const FoodTruck = require('../models/FoodTruckModel');

// shared function
const fetchAllFoodTrucks = async () => {
  return await FoodTruck.find();
};

// GET all food trucks
const getFoodTrucks = async (req, res) => {
  try {
    const foodTrucks = await fetchAllFoodTrucks();
    res.status(200).json(foodTrucks);
  } catch (error) {
    console.error('Error fetching food trucks:', error);
    res.status(500).json({ message: 'Error fetching food trucks' });
  }
};

// GET food trucks here today
const getFoodTrucksHereToday = async (req, res) => {
  try {
    const foodTrucks = await fetchAllFoodTrucks();
    const hereToday = foodTrucks.filter(truck => truck.hereToday === true);
    
    res.status(200).json(hereToday);
  } catch (error) {
    console.error('Error fetching food trucks here today:', error);
    res.status(500).json({ message: 'Error fetching food trucks here today' });
  }
};

// GET one food truck by id
const getFoodTruckById = async (req, res) => {
  try {
    console.log("Fetching food truck with ID:", req.params.id);
    const foodTruck = await FoodTruck.findById(req.params.id);

    if (!foodTruck) {
      console.log("Food truck not found for ID:", req.params.id);
      return res.status(404).json({ message: 'Food truck not found' });
    }

    res.json(foodTruck);
  } catch (err) {
    console.error("Error in getFoodTruckById:", err.stack);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  getFoodTrucks,
  getFoodTrucksHereToday,
  getFoodTruckById 
};