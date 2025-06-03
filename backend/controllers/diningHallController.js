const DiningHallModel = require('../models/DiningHallModel');
const DiningHall = require('../models/DiningHallModel');

// GET all dining halls
const getDiningHalls = async (req, res) => {
  try {
    const diningHalls = await DiningHallModel.find();
    res.status(200).json(diningHalls);
  } catch (err) {
    console.error('Error fetching dining halls:', err);
    res.status(500).json({ message: 'Server error' });
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