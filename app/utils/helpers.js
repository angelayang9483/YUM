import axios from 'axios';
import config from '../config';
import { on } from '../utils/emitter.js';

const url = config.BASE_URL;

const getDiningHalls = async (setDiningHalls) => {
    try {
      const response = await axios.get(`${url}/api/dininghalls`);
      console.log('Dining halls data received:', response.data?.length || 0, 'halls');
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid dining halls data format:', response.data);
        return;
      }
      
      setDiningHalls(response.data);
    } catch (error) {
      console.error('Error fetching dining halls:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

const parseTime = (timeString) => {
    if (!timeString) return null;
    const parts = timeString.split(' ');
    const timePart = parts[0];
    const modifier = parts[1];
  
    let [hours, minutes] = timePart.split(':').map(Number);
  
    if (modifier) {
      if (modifier.toLowerCase() === 'p.m.' && hours !== 12) {
        hours += 12;
      } else if (modifier.toLowerCase() === 'a.m.' && hours === 12) {
        hours = 0;
      }
    }
    return { hours, minutes };
  }
  

const isDiningHallOpen = (hall, now) => {
    if (!hall || !hall.hours || hall.hours.length === 0) {
      return false;
    }
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
  
    for (const period of hall.hours) {
      if (!period.label || !period.open || !period.close) continue;
  
      const openTime = parseTime(period.open);
      const closeTime = parseTime(period.close);
  
      if (!openTime || !closeTime) continue;
  
      if (closeTime.hours < openTime.hours || (closeTime.hours === openTime.hours && closeTime.minutes <= openTime.minutes)) {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) || 
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          return true;
        }
      } else {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) && 
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          return true;
        }
      }
    }
  
    return false;
  }

const getClosingTime = (hall, now) => {
    if (!hall || !hall.hours || hall.hours.length === 0) {
      return 'N/A';
    }
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes(); // Get current minutes
  
    for (const period of hall.hours) {
      if (!period.label || !period.open || !period.close) continue;

      // Use parseTime for open and close times
      const openTime = parseTime(period.open);
      const closeTime = parseTime(period.close);

      if (!openTime || !closeTime) continue; // Skip if parsing failed
      
      // Check if current time falls within this period
      let isActivePeriod = false;
      if (closeTime.hours < openTime.hours || (closeTime.hours === openTime.hours && closeTime.minutes <= openTime.minutes)) { // Overnight period
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) || 
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          isActivePeriod = true;
        }
      } else { // Same day period
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) && 
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          isActivePeriod = true;
        }
      }

      if (isActivePeriod) {
        return period.close; // Return the original closing time string of the active period
      }
    }

    return 'N/A'; // No currently active period found
  }

const getNextOpenTime = (hall, now) => {
    if (!hall || !hall.hours || !hall.hours.length === 0) {
      return 'N/A';
    }
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes(); // Get current minutes
    const currentTotalMinutes = currentHour * 60 + currentMinute; // Current time in minutes from midnight

    let nextOpenTimeStr = 'N/A';
    let minDiffToNextOpen = Infinity; // Stores the smallest difference in minutes to the next open time today
    let earliestOpenTimeTodayStr = 'N/A';
    let minMinutesForEarliestToday = Infinity; // Stores the earliest opening time of the day in minutes from midnight

    for (const period of hall.hours) {
      if (!period.label || !period.open || !period.close) continue;
  
      const openTime = parseTime(period.open);
      if (!openTime) continue; // Skip if parsing failed

      const periodOpenTotalMinutes = openTime.hours * 60 + openTime.minutes;

      // Track the absolute earliest opening time for the day
      if (periodOpenTotalMinutes < minMinutesForEarliestToday) {
        minMinutesForEarliestToday = periodOpenTotalMinutes;
        earliestOpenTimeTodayStr = period.open;
      }

      // If this period opens after the current time today
      if (periodOpenTotalMinutes > currentTotalMinutes) {
        const diff = periodOpenTotalMinutes - currentTotalMinutes;
        if (diff < minDiffToNextOpen) {
          minDiffToNextOpen = diff;
          nextOpenTimeStr = period.open;
        }
      }
    }
  
    // If no opening time found for later today, the next opening is the earliest one (implying next day)
    if (nextOpenTimeStr === 'N/A' && earliestOpenTimeTodayStr !== 'N/A') {
      return earliestOpenTimeTodayStr;
    }
  
    return nextOpenTimeStr;
  }

const isFoodTruckOpen = (truck, now) => {
    if (!truck || !truck.hereToday || !truck.hours || !truck.hours.length) {
      return false;
    }
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
  
    for (const period of truck.hours) {
      if (!period.open || !period.close) continue;
      const openTime = parseTime(period.open);
      const closeTime = parseTime(period.close);
  
      if (!openTime || !closeTime) continue;
  
      if (closeTime.hours < openTime.hours || (closeTime.hours === openTime.hours && closeTime.minutes <= openTime.minutes)) {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) ||
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          return true;
        }
      } else {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) &&
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          return true;
        }
      }
    }
  
    return false;
  }

const getClosingTruckTime = (truck, now) => {
    if (!isFoodTruckOpen(truck, now)) return null;
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
  
    for (const period of truck.hours) {
      if (!period.open || !period.close) continue;
  
      const openTime = parseTime(period.open);
      const closeTime = parseTime(period.close);
  
      if (!openTime || !closeTime) continue;
  
      let isOpenInThisPeriod = false;
      if (closeTime.hours < openTime.hours || (closeTime.hours === openTime.hours && closeTime.minutes <= openTime.minutes)) {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) ||
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          isOpenInThisPeriod = true;
        }
      } else {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) &&
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          isOpenInThisPeriod = true;
        }
      }
  
      if (isOpenInThisPeriod) {
        return period.close;
      }
    }
    return null;
  }

const getNextOpenTruckTime = (truck, now) => {
    if (isFoodTruckOpen(truck, now) || !truck.hours || truck.hours.length === 0) return null;
    
    let nextOpenTimeStr = null;
    let minDiff = Infinity;
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  
    truck.hours.forEach(period => {
      if (!period.open) return;
  
      const openTime = parseTime(period.open);
      if (!openTime) return;
  
      let openTotalMinutes = openTime.hours * 60 + openTime.minutes;
      let diff = openTotalMinutes - currentTotalMinutes;
  
      if (diff < 0) {
        diff += 24 * 60;
      }
  
      if (diff < minDiff) {
        minDiff = diff;
        nextOpenTimeStr = period.open;
      }
    });
  
    return nextOpenTimeStr;
  }

// get the dining halls and food trucks
const getFoodTrucks = async (setFoodTrucks) => {
    const response = await axios.get(`${url}/api/foodtrucks/here`);
    console.log("Food truck data response: ", response.data);
    setFoodTrucks(response.data);
}

const initializeMealAndTruckListeners = (fetchFavoriteMeals, fetchFavoriteFoodTrucks, callerName) => {
    let favoriteMealListener = null;
    let unfavoritedMealListener = null;
    let favoriteFoodTruckListener = null;
    let unfavoritedFoodTruckListener = null;
    
    if (fetchFavoriteMeals){
        fetchFavoriteMeals();
        favoriteMealListener = on('favorite-meal', async (meal) => {
            console.log(`HEARD FROM ${callerName}`)
              fetchFavoriteMeals(meal, true);
          });
        unfavoritedMealListener = on('unfavorited-meal', async (meal) => {
            console.log(`HEARD FROM ${callerName}`)
              fetchFavoriteMeals(meal, false);
          });
    }
    if (fetchFavoriteFoodTrucks){
        fetchFavoriteFoodTrucks();
        favoriteFoodTruckListener = on('favorite-truck', async (foodTruck) => {
            console.log(`HEARD FROM ${callerName}`)
              fetchFavoriteFoodTrucks(foodTruck, true);
          });
        unfavoritedFoodTruckListener = on('unfavorited-truck', async (foodTruck) => {
            console.log(`HEARD FROM ${callerName}`)
            fetchFavoriteFoodTrucks(foodTruck, false);
        });
    }
    return () => {
        if (favoriteMealListener) favoriteMealListener();
        if (unfavoritedMealListener) unfavoritedMealListener();
        if (favoriteFoodTruckListener) favoriteFoodTruckListener();
        if (unfavoritedFoodTruckListener) unfavoritedFoodTruckListener();
    };
}


export {
    getClosingTime, getClosingTruckTime, getDiningHalls,
    getFoodTrucks, getNextOpenTime, getNextOpenTruckTime, initializeMealAndTruckListeners, isDiningHallOpen, isFoodTruckOpen
};

