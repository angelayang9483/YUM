const FoodTruck = require('../models/FoodTruckModel');

// GET all food trucks
const getFoodTrucks = async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    const foodTrucks = await FoodTruck.find();
    
    console.log(`\n [${timestamp}] getFoodTrucks called - Found ${foodTrucks.length} food trucks:`);
    foodTrucks.forEach(truck => {
      console.log(`  - ${truck.name} (ID: ${truck._id}) - ${truck.hours.length} hour periods`);
      if (truck.hours.length > 0) {
        // Show the first hour period as a sample
        const firstHour = truck.hours[0];
        console.log(`Sample hour: ${firstHour.label} - time:"${firstHour.time}" - isOpen:${firstHour.isOpen} - open:"${firstHour.open}" - close:"${firstHour.close}"`);
      }
    });
    
    res.status(200).json(foodTrucks);
  } catch (error) {
    console.error('Error fetching food trucks:', error);
    res.status(500).json({ message: 'Error fetching food trucks' });
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
  getFoodTruckById 
};