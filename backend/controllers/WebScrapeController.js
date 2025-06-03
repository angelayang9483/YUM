const axios = require('axios');
const cheerio = require('cheerio');
const MenuModel = require('../models/MenuModel');
const DiningHallModel = require('../models/DiningHallModel');
const MealModel = require('../models/MealModel');

/**
 * WebScrapeController - Handles scraping UCLA dining hall menu data
 */
class WebScrapeController {
  
  // Simple lock to prevent concurrent scraping
  static isScrapingInProgress = false;
  
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
            meals: {},
            hours: []
          };
          
          // Scrape dining hours
          const hoursContainer = $('.dining-hours-container');
          if (hoursContainer.length > 0) {
            hoursContainer.find('.dining-hours-item').each((index, item) => {
              const $item = $(item);
              const mealName = $item.find('.meal-name').text().trim();
              const mealTimeElement = $item.find('.meal-time');
              
              let mealTime = '';
              let isOpen = true;
              
              // Check if there's a "closed-text" span indicating the meal period is closed
              const closedText = mealTimeElement.find('.closed-text');
              if (closedText.length > 0) {
                mealTime = closedText.text().trim();
                isOpen = false;
              } else {
                mealTime = mealTimeElement.text().trim();
                isOpen = true;
              }
              
              if (mealName && mealTime) {
                const hourInfo = {
                  label: mealName,
                  time: mealTime,
                  isOpen: isOpen
                };
                
                // If the meal period is open, try to parse open/close times
                if (isOpen && mealTime.includes(' - ')) {
                  const [openTime, closeTime] = mealTime.split(' - ').map(t => t.trim());
                  hourInfo.open = openTime;
                  hourInfo.close = closeTime;
                } else {
                  hourInfo.open = null;
                  hourInfo.close = null;
                }
                
                results[diningHallName].hours.push(hourInfo);
              }
            });
          }
          
          // Log the scraped hours for this dining hall
          if (results[diningHallName].hours.length > 0) {
            console.log(`  Hours for ${diningHallName}:`);
            results[diningHallName].hours.forEach(hour => {
              const status = hour.isOpen ? '✓ OPEN' : '✗ CLOSED';
              console.log(`    ${hour.label}: ${hour.time} [${status}]`);
            });
          } else {
            console.log(`  No hours found for ${diningHallName}`);
          }
          
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
                      
                      // Add meal to station
                      results[diningHallName].meals[mealPeriod].stations[stationName].menuItems.push({
                        name: mealName,
                        station: stationName,
                        ingredients: ingredients
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
   * Update the database with the latest menu information
   * @returns {Promise<void>}
   */
  static async updateMenuDatabase() {
    // Prevent concurrent scraping
    if (WebScrapeController.isScrapingInProgress) {
      return;
    }
    
    try {
      WebScrapeController.isScrapingInProgress = true;
      const timestamp = new Date().toISOString();
      const allMenus = await this.scrapeAllMenus();
      const today = new Date();
      
      // For each dining hall, update or create the database entry
      for (const diningHallName in allMenus) {
        const diningHallData = allMenus[diningHallName];
        const cleanDiningHallName = diningHallName.trim(); // Remove extra whitespace
        
        // Prepare hours array from scraped data
        const scrapedHours = diningHallData.hours || [];
        
        // Create or update dining hall
        const diningHall = await DiningHallModel.findOneAndUpdate(
          { name: cleanDiningHallName },
          {
            name: cleanDiningHallName,
            location: { building: cleanDiningHallName },
            hours: scrapedHours
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
      
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Error updating menu database:`, error);
      throw error;
    } finally {
      WebScrapeController.isScrapingInProgress = false;
    }
  }
}

module.exports = WebScrapeController;
