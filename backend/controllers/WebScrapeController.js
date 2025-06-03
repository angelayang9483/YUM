const axios = require('axios');
const cheerio = require('cheerio');
const MenuModel = require('../models/MenuModel');
const DiningHallModel = require('../models/DiningHallModel');
const MealModel = require('../models/MealModel');

/**
 * WebScrapeController - Handles scraping UCLA dining hall menu data
 */
class WebScrapeController {
  
  /**
   * Scrape all UCLA dining hall menus
   * @returns {Promise<Object>} Object containing all dining hall menus
   */
  static async scrapeAllMenus() {
    try {
      const allDiningHalls = {
        "Bruin Plate": "https://dining.ucla.edu/bruin-plate/",
        "De Neve Dining": "https://dining.ucla.edu/de-neve-dining/",
        "Epicuria at Covel": "https://dining.ucla.edu/epicuria-at-covel/",
        "Bruin Cafe": "https://dining.ucla.edu/bruin-cafe/",
        "Cafe 1919": "https://dining.ucla.edu/cafe-1919/",
        "Epicuria at Ackerman": "https://dining.ucla.edu/epicuria-at-ackerman/",
        "Rendezvous": "https://dining.ucla.edu/rendezvous/",  
        "The Drey": "https://dining.ucla.edu/the-drey/",
        "The Study at Hedrick": "https://dining.ucla.edu/the-study-at-hedrick/",
        "Spice Kitchen": "https://dining.ucla.edu/spice-kitchen/"
      };
       
      const results = {};
      const diningHallEntries = Object.entries(allDiningHalls);
      console.log(`Starting to scrape ${diningHallEntries.length} dining halls...`);
      
      // Process all dining halls in parallel for faster scraping
      await Promise.all(diningHallEntries.map(async ([diningHallName, url], index) => {
        console.log(`[${index + 1}/${diningHallEntries.length}] Scraping: ${diningHallName}`);
        
        try {
          // Make HTTP request to the dining hall page
          const response = await axios.get(url);
          const $ = cheerio.load(response.data);
          
          results[diningHallName] = {
            name: diningHallName,
            url: url,
            meals: {}
          };
          
          // Find all meal period dropdowns (breakfast, lunch, dinner, etc.)
          $('a.category-anchor-link').each((index, anchor) => {
            const href = $(anchor).attr('href');
            if (href && href.includes('-') && href.startsWith('#')) {
              const value = href.substring(1); // Remove the # from href
              const mealPeriod = value.split('-')[0]; // e.g., "breakfast" from "breakfast-SALADS"
              
              if (!results[diningHallName].meals[mealPeriod]) {
                results[diningHallName].meals[mealPeriod] = {
                  name: mealPeriod,
                  stations: {}
                };
              }
            }
          });
          
          let totalItems = 0;
          
          // Process each meal period found
          Object.keys(results[diningHallName].meals).forEach(mealPeriod => {
            // Find all stations for this meal period using anchor links
            $('a.category-anchor-link').each((index, anchor) => {
              const href = $(anchor).attr('href');
              if (href && href.startsWith(`#${mealPeriod}-`) && !href.includes('#!')) {
                const value = href.substring(1); // Remove the #
                const stationName = value.replace(`${mealPeriod}-`, '');
                const stationId = value;
                
                // Initialize station
                if (!results[diningHallName].meals[mealPeriod].stations[stationName]) {
                  results[diningHallName].meals[mealPeriod].stations[stationName] = {
                    name: stationName,
                    menuItems: []
                  };
                }
                
                // Find the corresponding div section for this station
                const stationSection = $(`#${stationId}`);
                
                if (stationSection.length > 0) {
                  // Process each recipe card (meal) in this station
                  stationSection.find('section.recipe-card').each((cardIndex, card) => {
                    const $card = $(card);
                    
                    // Extract meal name
                    const mealName = $card.find('h3').text().trim();
                    
                    if (mealName) {
                      // Extract ingredients from the description paragraph
                      const ingredients = $card.find('.see-menu-details p').text().trim();
                      
                      // Extract recipe detail link for nutrition info
                      const recipeDetailLink = $card.find('a.recipe-detail-link').attr('href');
                      const fullRecipeUrl = recipeDetailLink ? `https://dining.ucla.edu${recipeDetailLink}` : null;
                      
                      // Add meal to station
                      results[diningHallName].meals[mealPeriod].stations[stationName].menuItems.push({
                        name: mealName,
                        station: stationName,
                        ingredients: ingredients,
                        nutritionDetailUrl: fullRecipeUrl,
                        nutritionInfo: null // Will be populated if we scrape the detail page
                      });
                      
                      totalItems++;
                    }
                  });
                }
              }
            });
          });
          
          console.log(`✓ [${index + 1}/${diningHallEntries.length}] ${diningHallName}: Found ${totalItems} menu items`);
          
        } catch (error) {
          console.error(`✗ [${index + 1}/${diningHallEntries.length}] Error scraping ${diningHallName}:`, error.message);
          // Continue with other dining halls even if one fails
        }
      }));
      
      const totalDiningHalls = Object.keys(results).length;
      const totalMenuItems = Object.values(results).reduce((total, diningHall) => {
        return total + Object.values(diningHall.meals || {}).reduce((mealTotal, meal) => {
          return mealTotal + Object.values(meal.stations || {}).reduce((stationTotal, station) => {
            return stationTotal + (station.menuItems || []).length;
          }, 0);
        }, 0);
      }, 0);
      
      
      return results;
    } catch (error) {
      console.error('Error scraping UCLA dining menus:', error);
      throw error;
    }
  }
  
  /**
   * Scrape menu for a specific dining hall
   * @param {string} diningHallName - Name of the dining hall
   * @returns {Promise<Object>} Menu data for the specified dining hall
   */
  static async scrapeMenuByDiningHall(diningHallName) {
    try {
      const allMenus = await this.scrapeAllMenus();
      return allMenus[diningHallName] || null;
    } catch (error) {
      console.error(`Error scraping menu for ${diningHallName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get detailed information about a specific meal
   * @param {string} mealUrl - URL to the meal's detail page
   * @returns {Promise<Object>} Detailed information about the meal
   */
  static async getMealDetails(mealUrl) {
    try {
      const response = await axios.get(mealUrl);
      const $ = cheerio.load(response.data);
      
      // Extract nutrition information from the nutrition div
      const nutritionInfo = {};
      
      // Look for the nutrition div specifically
      const nutritionDiv = $('#nutrition');
      
      if (nutritionDiv.length > 0) {
        // Extract serving size from <strong>Serving Size:</strong> format
        const servingSizeText = nutritionDiv.find('strong:contains("Serving Size")').parent().text();
        if (servingSizeText) {
          const servingSizeMatch = servingSizeText.match(/Serving Size:\s*(.+?)(?:\n|$|<)/);
          if (servingSizeMatch) {
            nutritionInfo['serving_size'] = servingSizeMatch[1].trim();
          }
        }
        
        // Extract calories from <p class='single-calories'><span>Calories</span>590</p>
        const caloriesElement = nutritionDiv.find('.single-calories');
        if (caloriesElement.length > 0) {
          const caloriesText = caloriesElement.text().trim();
          const caloriesMatch = caloriesText.match(/Calories\s*(\d+)/);
          if (caloriesMatch) {
            nutritionInfo['calories'] = caloriesMatch[1];
          }
        }
        
        // Extract nutrition facts from table rows with <span>Label</span>Value format
        nutritionDiv.find('.nutritive-table tr').each((i, row) => {
          const $row = $(row);
          
          // Skip header rows
          if ($row.find('th').length > 0) return;
          
          const firstCell = $row.find('td').first();
          if (firstCell.length > 0) {
            const span = firstCell.find('span');
            if (span.length > 0) {
              const label = span.text().trim();
              const fullText = firstCell.text().trim();
              
              // Extract the value after the label
              const value = fullText.replace(label, '').trim();
              
              if (label && value) {
                const cleanLabel = label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
                nutritionInfo[cleanLabel] = value;
                
                // Also get the percentage if it exists in the second cell
                const secondCell = $row.find('td').eq(1);
                if (secondCell.length > 0) {
                  const percentage = secondCell.text().trim();
                  if (percentage && percentage !== '&nbsp;' && percentage !== '') {
                    nutritionInfo[`${cleanLabel}_daily_value`] = percentage;
                  }
                }
              }
            }
          }
        });
        
        // Handle two-column nutritive table (for vitamins/minerals)
        nutritionDiv.find('.nutritive-table-two-column tr').each((i, row) => {
          const $row = $(row);
          const cells = $row.find('td');
          
          // Process pairs of cells (nutrient + percentage)
          for (let i = 0; i < cells.length; i += 2) {
            const nutrientCell = $(cells[i]);
            const percentageCell = $(cells[i + 1]);
            
            if (nutrientCell.length > 0) {
              const span = nutrientCell.find('span');
              if (span.length > 0) {
                const label = span.text().trim();
                const fullText = nutrientCell.text().trim();
                const value = fullText.replace(label, '').trim();
                
                if (label && value) {
                  const cleanLabel = label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
                  nutritionInfo[cleanLabel] = value;
                  
                  // Add percentage if available
                  if (percentageCell && percentageCell.length > 0) {
                    const percentage = percentageCell.text().trim();
                    if (percentage && percentage !== '&nbsp;' && percentage !== '') {
                      nutritionInfo[`${cleanLabel}_daily_value`] = percentage;
                    }
                  }
                }
              }
            }
          }
        });
      }
      
      return {
        nutritionInfo
      };
    } catch (error) {
      console.error('Error getting meal details:', error);
      return {
        nutritionInfo: {}
      };
    }
  }
  
  /**
   * Update the database with the latest menu information
   * @returns {Promise<void>}
   */
  static async updateMenuDatabase() {
    try {
      const allMenus = await this.scrapeAllMenus();
      const today = new Date();
      
      // For each dining hall, update or create the database entry
      for (const diningHallName in allMenus) {
        const diningHallData = allMenus[diningHallName];
        const cleanDiningHallName = diningHallName.trim(); // Remove extra whitespace
        
        // Create or update dining hall
        const diningHall = await DiningHallModel.findOneAndUpdate(
          { name: cleanDiningHallName },
          {
            name: cleanDiningHallName,
            location: { building: cleanDiningHallName },
            // We could scrape hours in the future if needed
            hours: [
              { label: 'Breakfast', open: '7:00 AM', close: '10:00 AM' },
              { label: 'Lunch', open: '11:00 AM', close: '2:00 PM' },
              { label: 'Dinner', open: '5:00 PM', close: '8:00 PM' }
            ]
          },
          { upsert: true, new: true }
        );
        
        // Create meal periods object to organize all meal periods in one menu
        const mealPeriods = {};
        
        // Process each meal period
        for (const mealName in diningHallData.meals) {
          const mealData = diningHallData.meals[mealName];
          
          // Create stations array for this meal period
          const stations = [];
          
          // Process each station in this meal period
          for (const stationName in mealData.stations) {
            const stationData = mealData.stations[stationName];
            
            // Create array to store meal IDs for this station
            const mealIds = [];
            
            // For each meal in this station, create or update and store reference
            for (const meal of stationData.menuItems) {
              // Create or update meal
              const mealDoc = await MealModel.findOneAndUpdate(
                { name: meal.name },
                {
                  name: meal.name,
                  category: meal.station,
                  description: meal.ingredients || '',  // Use ingredients as description
                  dietaryTags: [], // Removed allergen logic as requested
                },
                { upsert: true, new: true }
              );
              
              // Add meal ID to this station's array
              mealIds.push(mealDoc._id);
            }
            
            // Add station with its meals to the stations array
            stations.push({
              name: stationName,
              meals: mealIds
            });
          }
          
          // Add this meal period's stations to the meal periods object
          mealPeriods[mealName] = {
            name: mealName,
            stations: stations
          };
        }
        
        // Create or update ONE menu per dining hall with all meal periods
        const menu = await MenuModel.findOneAndUpdate(
          {
            diningHallId: diningHall._id,
            date: today
          },
          {
            name: cleanDiningHallName, // Add dining hall name to menu
            date: today,
            diningHallId: diningHall._id,
            mealPeriods: mealPeriods // All meal periods in one menu
          },
          { upsert: true, new: true }
        );
      }
      
      console.log('Menu database updated successfully');
    } catch (error) {
      console.error('Error updating menu database:', error);
      throw error;
    }
  }
  
  /**
   * Enrich menu data with detailed nutrition information
   * @param {Object} menuData - Menu data from scrapeAllMenus
   * @param {number} maxConcurrent - Maximum number of concurrent requests (default: 5)
   * @returns {Promise<Object>} Enriched menu data with nutrition information
   */
  static async enrichWithNutritionData(menuData, maxConcurrent = 5) {
    console.log("Enriching menu data with detailed nutrition information...");
    
    // Collect all nutrition detail URLs
    const nutritionUrls = [];
    
    Object.values(menuData).forEach(diningHall => {
      Object.values(diningHall.meals || {}).forEach(meal => {
        Object.values(meal.stations || {}).forEach(station => {
          (station.menuItems || []).forEach(item => {
            if (item.nutritionDetailUrl && !item.nutritionInfo) {
              nutritionUrls.push({
                url: item.nutritionDetailUrl,
                item: item
              });
            }
          });
        });
      });
    });
    
    console.log(`Found ${nutritionUrls.length} items to enrich with nutrition data`);
    
    // Process URLs in batches to avoid overwhelming the server
    for (let i = 0; i < nutritionUrls.length; i += maxConcurrent) {
      const batch = nutritionUrls.slice(i, i + maxConcurrent);
      
      await Promise.all(batch.map(async ({ url, item }) => {
        try {
          const details = await this.getMealDetails(url);
          
          // Merge the detailed information into the item
          item.nutritionInfo = details.nutritionInfo;
        } catch (error) {
          // Continue processing other items
        }
      }));
      
      // Small delay between batches to be respectful to the server
      if (i + maxConcurrent < nutritionUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return menuData;
  }
}

module.exports = WebScrapeController;
