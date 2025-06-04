const MenuModel = require('../models/MenuModel');

// GET all menus
const getMenus = async (req, res) => {
    try {
        const menus = await MenuModel.find()
        .populate({
            path: 'mealPeriods.stations.meals',
            model: 'Meal'
        })
        .exec();
        res.status(200).json(menus);
    } catch (err) {
        console.error('Error fetching menus:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET all menus today
const getMenusToday = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0, 0, 0, 0
        );
        const startOfTomorrow = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0, 0, 0, 0
        );
        const menus = await MenuModel.find({
            date: {
              $gte: startOfToday,
              $lt:  startOfTomorrow,
            }
        })
        .populate({
            path: 'mealPeriods.stations.meals',
            model: 'Meal'
        })
        .exec();
        res.status(200).json(menus);
    } catch (err) {
        console.error('Error fetching menus:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET all menus by dining hall
const getMenusByDiningHall = async (req, res) => {
    try {
        const menus = await MenuModel.find({ diningHallId: req.params.diningHallId })
        .populate({
            path: 'mealPeriods.stations.meals',
            model: 'Meal'
        })
        .exec();
        res.status(200).json(menus);
    } catch (err) {
        console.error('Error fetching menus:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET menu by dining hall and today
const getMenuByDiningHallToday = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0, 0, 0, 0
        );
        const startOfTomorrow = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0, 0, 0, 0
        );
        console.log(startOfToday)
        console.log(startOfTomorrow)
        const menu = await MenuModel.findOne({
            date: {
              $gte: startOfToday,
              $lt:  startOfTomorrow,
            },
            diningHallId: req.params.diningHallId
        })
        .populate({
            path: 'mealPeriods.stations.meals',
            model: 'Meal'
        })
        .exec();
        res.status(200).json(menu);
    } catch (err) {
        console.error('Error fetching menus:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
    
// POST new menu
const createMenu = async (req, res) => {
    try {
      const menu = await MenuModel.create(req.body);
      res.status(201).json(menu);
    } catch (err) {
      console.error('Error creating menu:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };


module.exports = { getMenus, getMenusToday, getMenusByDiningHall, getMenuByDiningHallToday, createMenu };