const Meal = require('../models/MealModel');

// GET all meals
const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find();
    res.status(200).json(meals);
  } catch (err) {
    console.error('Error fetching meals:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET meal by ID
const getMealById = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.status(200).json(meal);
  } catch (err) {
    console.error('Error fetching meal:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET meal by name
const getMealsByName = async (req, res) => {
    try {
        const { search } = req.query;
        
        function escapeRegex(str) {
            return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        }
        
        if (!search) {
          const allItems = await Meal.find().limit(50);
          return res.json(allItems);
        }

        const regex = new RegExp('^' + escapeRegex(search), 'i');
        const matches = await Meal.find({ name: regex }).limit(50);

        return res.json(matches);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
};


// GET meals by category
const getMealsByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        const meals = await Meal.find({ category });
        res.json(meals);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
}


// POST new meal
const createMeal = async (req, res) => {
    try {
      const meal = await Meal.create(req.body);
      res.status(201).json(meal);
    } catch (err) {
      console.error('Error creating meal:', err);
      res.status(500).json({ message: 'Server error' });
    }
};

const getPopularMeals = async(req, res) => {
  try {
    console.log('Fetching popular meals...');
    console.log('Meal model:', Meal);
    const popularMeals = await Meal.find({favoritesCount: { $gt:20 }});
    return res.status(200).json(popularMeals);
  }
  catch (err) {
    console.error('Error fetching popular meals:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMeals, getMealById, getMealsByName, getMealsByCategory, createMeal, getPopularMeals};