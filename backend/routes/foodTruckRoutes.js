const express = require('express');
const router = express.Router();
const foodTruckController = require('../controllers/foodTruckController');

// get all food trucks
router.get('/', foodTruckController.getFoodTrucks);

// get food trucks here today
router.get('/here', foodTruckController.getFoodTrucksHereToday);

// get one food truck
router.get('/:id', foodTruckController.getFoodTruckById);

// favorite a food truck
router.post('/:truckId/favorite', foodTruckController.favoriteFoodTruck);

module.exports = router;