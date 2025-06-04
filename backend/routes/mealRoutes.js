const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

// GET all meals
router.get('/', mealController.getMeals);

// GET popular meals
router.get('/popular', mealController.getPopularMeals);

// GET meal by ID
router.get('/:id', mealController.getMealById);

// GET meal by name (search)
router.get('/search', mealController.getMealsByName);

// GET meals by category
router.get('/category', mealController.getMealsByCategory);

// POST new meal
router.post('/', mealController.createMeal);

module.exports = router;