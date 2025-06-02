const DiningHallModel = require('../models/DiningHallModel');

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

module.exports = { getDiningHalls };