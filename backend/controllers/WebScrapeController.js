const axios = require('axios');
const cheerio = require('cheerio');
const MenuModel = require('../models/MenuModel');
const DiningHallModel = require('../models/DiningHallModel');
const MealModel = require('../models/MealModel');
const FoodTruckModel = require('../models/FoodTruckModel')

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
          
        } catch (error) {
          console.error(`Error scraping ${diningHallName}:`, error.message);
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

  static async checkIfDatabaseCurrent() {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
        
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const menus = await MenuModel.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).lean();
    const hallsWithMenu = new Set(
      menus.map((m) => m.diningHallId.toString())
    );
    const allHalls = await DiningHallModel.find().lean();
    const hallsMissingMenu = allHalls.filter(
      (h) => !hallsWithMenu.has(h._id.toString())
    );
    if (hallsMissingMenu.length > 0) {
      return false;
    }
    return true;
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

    // Check if the database is current
    if (await this.checkIfDatabaseCurrent()) {
      return;
    }
    
    try {
      WebScrapeController.isScrapingInProgress = true;
      console.log('Starting database update with scraped data...');
      const allMenus = await this.scrapeAllMenus();
      
      // Reset all meals to not being here today, then update the ones that are
      await MealModel.updateMany({}, { $set: { hereToday: false } });
      
      // Process all dining halls in parallel
      await Promise.all(Object.entries(allMenus).map(async ([diningHallName, diningHallData]) => {
        const cleanDiningHallName = diningHallName.trim();
        
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
        
        // Collect all meal updates to process in parallel
        const allMealUpdates = [];
        
        // Process each meal period to collect all meals
        for (const mealName in diningHallData.meals) {
          const mealData = diningHallData.meals[mealName];
          
          // Process each station in this meal period
          for (const stationName in mealData.stations) {
            const stationData = mealData.stations[stationName];
            
            // Add all meals from this station to the parallel update list
            for (const meal of stationData.menuItems) {
              allMealUpdates.push(
                MealModel.findOneAndUpdate(
                  { name: meal.name },
                  {
                    $set: {
                      hereToday: true,
                      category: meal.station,
                      description: meal.ingredients || '',
                    },
                    $setOnInsert: {
                      name: meal.name,
                      dietaryTags: [],
                      favoritesCount: 0,
                      diningHall: cleanDiningHallName
                    }
                  },
                  { upsert: true, new: true }
                )
              );
            }
          }
        }
        
        // Execute all meal updates in parallel
        const allMealDocs = await Promise.all(allMealUpdates);
        
        // Create a map from meal name to meal ID for quick lookup
        const mealNameToId = {};
        allMealDocs.forEach(mealDoc => {
          mealNameToId[mealDoc.name] = mealDoc._id;
        });
        
        // Create meal periods object to organize all meal periods in one menu
        const mealPeriods = {};
        
        // Process each meal period to build the menu structure
        for (const mealName in diningHallData.meals) {
          const mealData = diningHallData.meals[mealName];
          
          // Create stations array for this meal period
          const stations = [];
          
          // Process each station in this meal period
          for (const stationName in mealData.stations) {
            const stationData = mealData.stations[stationName];
            
            // Create array to store meal IDs for this station
            const mealIds = [];
            
            // For each meal in this station, get the ID from our map
            for (const meal of stationData.menuItems) {
              const mealId = mealNameToId[meal.name];
              if (mealId) {
                mealIds.push(mealId);
              }
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
        await MenuModel.findOneAndUpdate(
          {
            name: cleanDiningHallName
          },
          {
            name: cleanDiningHallName,
            diningHallId: diningHall._id,
            mealPeriods: mealPeriods,
            date: new Date()
          },
          { upsert: true, new: true }
        );
      }));
      
      console.log('Menu database updated successfully');
    } catch (error) {
      console.error('Error updating menu database:', error);
      throw error;
    } finally {
      WebScrapeController.isScrapingInProgress = false;
    }
  }
  
  /**
   * Scrape UCLA food truck schedule
   * @returns {Promise<Object>} Object containing food truck data by location
   */
  static async scrapeFoodTrucks() {
    try {
      const url = "https://dining.ucla.edu/meal-swipe-exchange/";
      console.log('Scraping food truck schedule from:', url);
      
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      const locations = ['Sproul', 'Rieber'];
      const timeSlots = [
        '5:00 p.m. – 8:30 p.m.',
        '9 p.m. – 12 a.m.'
      ];

      await FoodTruckModel.updateMany({}, { $set: {
         hereToday: false,
         hours: [],
         dailyLocation: ""
        } });
      
      // Get today's date for comparison
      const today = new Date();
      const todayFormatted = today.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }); // e.g., "Mon, Jun 2"
      
      console.log('Today is:', todayFormatted);
      
      const foodTrucksSet = new Set(); // For case-insensitive duplicate detection
      const locationData = {};
      
      locations.forEach(location => {
        console.log(`Looking for ${location} section...`);
        
        // Find the h3 tag containing the location name
        const locationHeader = $('h3').filter((i, el) => {
          return $(el).text().trim().toLowerCase().includes(location.toLowerCase());
        });
        
        if (locationHeader.length === 0) {
          console.log(`No ${location} section found`);
          return;
        }
        
        // Find the table that comes after this h3
        const table = locationHeader.next('figure').find('table');
        if (table.length === 0) {
          console.log(`No table found after ${location} header`);
          return;
        }
        
        console.log(`Found table for ${location}`);
        locationData[location] = [];
        
        // Process each row in the table body
        table.find('tbody tr').each((rowIndex, row) => {
          const cells = $(row).find('td');
          const dateCell = $(cells[0]).text().trim();
          
          if (!dateCell) return; // Skip empty rows
          
          // Check if this date matches today
          const isToday = dateCell.toLowerCase().includes(todayFormatted.toLowerCase().substring(0, 3)) && // Match day of week
                         dateCell.toLowerCase().includes(todayFormatted.toLowerCase().split(' ')[2]); // Match day number
          
          if(isToday) {
            for(let timeSlotIndex = 0; timeSlotIndex < 2; timeSlotIndex++) {
              const cellIndex = timeSlotIndex + 1; // Skip date column
              const cell = $(cells[cellIndex]);
              const timeSlot = timeSlots[timeSlotIndex];
              
              if (!cell.length) continue;
              
              const cellHtml = cell.html() || '';
              const cellText = cell.text().trim();
              
              if (!cellText) continue;
              
              let truckNames = [];
              
              if (cellHtml.includes('<br>')) {
                // Multiple trucks separated by <br>
                const parts = cellHtml.split('<br>');
                parts.forEach(part => {
                  const truckName = $('<div>').html(part).text().trim();
                  if (truckName) {
                    truckNames.push(truckName);
                  }
                });
              } else {
                // Single truck
                if (cellText) {
                  truckNames.push(cellText);
                }
              }
              
              // Add each truck to our data with case-insensitive duplicate detection
              truckNames.forEach(truckName => {
                const lowerCaseName = truckName.toLowerCase();
                if (truckName && !foodTrucksSet.has(lowerCaseName)) {
                  foodTrucksSet.add(lowerCaseName);
                  
                  locationData[location].push({
                    name: truckName, // Keep original capitalization
                    location: location,
                    timeSlot: timeSlot,
                    date: dateCell,
                    hereToday: true,
                  });
                }
              });
            }
          }
        });
      });
      
      // Save to database
      console.log('Saving food trucks to database...');
      const allFoodTruckUpdates = [];
      
      Object.keys(locationData).forEach(location => {
        locationData[location].forEach(truckData => {
          // Parse the time slot to match schema format
          let hoursArray = [];
          if (truckData.timeSlot) {
            const timeSlot = truckData.timeSlot;
            let label = "";
            let open = "";
            let close = "";
            
            if (timeSlot.includes('5:00 p.m.')) {
              label = "Evening";
              open = "5:00 p.m.";
              close = "8:30 p.m.";
            } else if (timeSlot.includes('9 p.m.')) {
              label = "Late Night";
              open = "9:00 p.m.";
              close = "12:00 a.m.";
            }
            
            hoursArray.push({
              label: label,
              open:  open,
              close: close
            });
          }
          
          allFoodTruckUpdates.push(
            FoodTruckModel.findOneAndUpdate(
              { name: truckData.name }, // Use exact name for matching
              {
                $set: {
                  dailyLocation: truckData.location,
                  hours: hoursArray,
                  hereToday: truckData.hereToday
                },
                $setOnInsert: {
                  name: truckData.name,
                  likeCount: 0
                } 
              },
              { upsert: true, new: true }
            )
          );
        });
      });
      
      // Execute all food truck updates in parallel
      const savedTrucks = await Promise.all(allFoodTruckUpdates);
      
      // Convert to final format
      const result = {
        locations: locationData,
        uniqueTrucks: Array.from(foodTrucksSet),
        totalTrucks: foodTrucksSet.size,
        savedToDatabase: savedTrucks.length,
        lastUpdated: new Date().toISOString()
      };
      
      console.log(`Scraped ${result.totalTrucks} unique food trucks, saved ${result.savedToDatabase} to database`);
      
      return result;
      
    } catch (error) {
      console.error('Error scraping food truck schedule:', error);
      throw error;
    }
  }
}

module.exports = WebScrapeController;
