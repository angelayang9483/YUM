const DiningHallModel = require('../models/DiningHallModel');

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

module.exports = { getDiningHalls };