const express = require('express');
const router = express.Router();
const foodTruckController = require('../controllers/foodTruckController');

// get all food trucks
router.get('/', foodTruckController.getFoodTrucks);

// get food trucks here today
router.get('/here', foodTruckController.getFoodTrucksHereToday);

// get popular foodtrucks (move this BEFORE the /:id route)
router.get('/popular', foodTruckController.getPopularFoodTrucks);

// get one food truck (keep parameterized routes last)
router.get('/:id', foodTruckController.getFoodTruckById);

// favorite a food truck
router.post('/:truckId/favorite', foodTruckController.favoriteFoodTruck);

// get favorite foodtrucks
router.get('/popular', foodTruckController.getPopularFoodTrucks)

module.exports = router;