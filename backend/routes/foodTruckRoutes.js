const express = require('express');
const router = express.Router();
const foodTruckController = require('../controllers/foodTruckController');

// get all food trucks
router.get('/', foodTruckController.getFoodTrucks);

// get food trucks here today
router.get('/here', foodTruckController.getFoodTrucksHereToday);

// get one dining hall
router.get('/:id', foodTruckController.getFoodTruckById);

module.exports = router;