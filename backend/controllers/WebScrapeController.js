const axios = require('axios');
const cheerio = require('cheerio');
const MenuModel = require('../models/MenuModel');
const DiningHallModel = require('../models/DiningHallModel');
const FoodItemModel = require('../models/FoodItemModel');

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
      console.log("SCRAPING ALL MENUS");
      // UCLA dining website URL
      const url = 'https://dining.ucla.edu/dining-locations/';
      
      // Make HTTP request to the UCLA dining website
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      // Object to store all dining hall data
      const allDiningHalls = {};
      
      // Find all dining halls
      $('a.ucla-main-nav__link').each((i, element) => {
        const diningHallName = $(element).text().trim();
        allDiningHalls[diningHallName] = {
          name: diningHallName,
          meals: {}
        };
        console.log("ALL DINING HALLS: ", allDiningHalls);
      });
      
      // Process each dining hall section
      for (const diningHallName in allDiningHalls) {
        const diningHallElement = $(`h2:contains("${diningHallName}")`).closest('.menu-block');
        
        // Find all meal periods (Breakfast, Lunch, Dinner)
        diningHallElement.find('h3').each((i, mealElement) => {
          const mealName = $(mealElement).text().trim();
          allDiningHalls[diningHallName].meals[mealName] = {
            name: mealName,
            menuItems: []
          };
          
          // Find the menu section for this meal
          const menuSection = $(mealElement).next('.menu-section');
          
          // Process each menu category (Entrées, Sides, etc.)
          menuSection.find('h4').each((j, categoryElement) => {
            const category = $(categoryElement).text().trim();
            
            // Process each food item in this category
            const foodItemsList = $(categoryElement).next('ul');
            foodItemsList.find('li').each((k, foodItem) => {
              const foodName = $(foodItem).text().trim();
              
              // Get food details by looking for a link to more information
              const foodItemLink = $(foodItem).find('a').attr('href');
              let foodDetails = {
                dietaryTags: [],
                description: '',
                imageUrl: ''
              };
              
              // If there's a link to food details, we could fetch it
              // In a production app, we might want to do this asynchronously
              // or in batches to avoid too many simultaneous requests
              
              // Add food item to the menu
              allDiningHalls[diningHallName].meals[mealName].menuItems.push({
                name: foodName,
                category: category,
                details: foodDetails
              });
            });
          });
        });
      }
      
      return allDiningHalls;
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
   * Get detailed information about a specific food item
   * @param {string} foodItemUrl - URL to the food item's detail page
   * @returns {Promise<Object>} Detailed information about the food item
   */
  static async getFoodItemDetails(foodItemUrl) {
    try {
      const response = await axios.get(foodItemUrl);
      const $ = cheerio.load(response.data);
      
      // Extract dietary tags/allergens information
      const dietaryTags = [];
      $('.allergens li').each((i, element) => {
        dietaryTags.push($(element).text().trim());
      });
      
      // Extract description if available
      const description = $('.description').text().trim() || '';
      
      // Extract image URL if available
      const imageUrl = $('.recipe-image img').attr('src') || '';
      
      return {
        dietaryTags,
        description,
        imageUrl
      };
    } catch (error) {
      console.error('Error getting food item details:', error);
      return {
        dietaryTags: [],
        description: '',
        imageUrl: ''
      };
    }
  }
  
  /**
   * Update the database with the latest menu information
   * @returns {Promise<void>}
   */
  static async updateMenuDatabase() {
    try {
      console.log("UPDATING MENU DATABASE");
      const allMenus = await this.scrapeAllMenus();
      const today = new Date();
      
      // For each dining hall, update or create the database entry
      for (const diningHallName in allMenus) {
        const diningHallData = allMenus[diningHallName];
        
        // Create or update dining hall
        const diningHall = await DiningHallModel.findOneAndUpdate(
          { name: diningHallName },
          { 
            name: diningHallName,
            location: { building: diningHallName },
            // We could scrape hours in the future if needed
            hours: [
              { label: 'Breakfast', open: '7:00 AM', close: '10:00 AM' },
              { label: 'Lunch', open: '11:00 AM', close: '2:00 PM' },
              { label: 'Dinner', open: '5:00 PM', close: '8:00 PM' }
            ]
          },
          { upsert: true, new: true }
        );
        
        // For each meal period, create or update menu
        for (const mealName in diningHallData.meals) {
          const mealData = diningHallData.meals[mealName];
          
          // Create menu items array to store all food item references
          const menuItems = [];
          
          // For each food item, create or update and store reference
          for (const foodItem of mealData.menuItems) {
            // Create or update food item
            const foodItemDoc = await FoodItemModel.findOneAndUpdate(
              { name: foodItem.name },
              {
                name: foodItem.name,
                category: foodItem.category,
                description: '',  // Could be scraped from detail page
                dietaryTags: foodItem.details.allergens || [],
                imageUrl: '' // Could be scraped from detail page
              },
              { upsert: true, new: true }
            );
            
            // Add food item reference to menu items array
            menuItems.push({
              foodItemId: foodItemDoc._id,
              station: foodItem.category  // Using category as station
            });
          }
          
          // Create or update menu for this meal period
          await MenuModel.findOneAndUpdate(
            { 
              diningHallId: diningHall._id,
              date: today,
              // We use mealName to differentiate breakfast/lunch/dinner menus
            },
            { 
              date: today,
              diningHallId: diningHall._id,
              items: menuItems
            },
            { upsert: true }
          );
        }
      }
      
      console.log('Menu database updated successfully');
    } catch (error) {
      console.error('Error updating menu database:', error);
      throw error;
    }
  }
}

module.exports = WebScrapeController;
