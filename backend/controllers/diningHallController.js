const DiningHallModel = require('../models/DiningHallModel');
const DiningHall = require('../models/DiningHallModel');

// GET all dining halls
const getDiningHalls = async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    const diningHalls = await DiningHallModel.find();
    
    console.log(`\n🔍 [${timestamp}] getDiningHalls called - Found ${diningHalls.length} dining halls:`);
    diningHalls.forEach(hall => {
      console.log(`  - ${hall.name} (ID: ${hall._id}) - ${hall.hours.length} hour periods`);
      if (hall.hours.length > 0) {
        // Show the first hour period as a sample
        const firstHour = hall.hours[0];
        console.log(`    Sample hour: ${firstHour.label} - time:"${firstHour.time}" - isOpen:${firstHour.isOpen} - open:"${firstHour.open}" - close:"${firstHour.close}"`);
      }
    });
    
    res.status(200).json(diningHalls);
  } catch (error) {
    console.error('Error fetching dining halls:', error);
    res.status(500).json({ message: 'Error fetching dining halls' });
  }
};

// GET one dining hall by id
const getDiningHallById = async (req, res) => {
  try {
    console.log("Fetching dining hall with ID:", req.params.id);
    const diningHall = await DiningHall.findById(req.params.id);

    if (!diningHall) {
      console.log("Dining hall not found for ID:", req.params.id);
      return res.status(404).json({ message: 'Dining hall not found' });
    }

    res.json(diningHall);
  } catch (err) {
    console.error("Error in getDiningHallById:", err.stack); // 🔍 full error
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  getDiningHalls,
  getDiningHallById 
};