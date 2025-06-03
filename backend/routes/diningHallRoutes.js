const express = require('express');
const router = express.Router();
const diningHallController = require('../controllers/diningHallController');

// get all dining halls
router.get('/', diningHallController.getDiningHalls);

// get one dining hall
router.get('/:id', diningHallController.getDiningHallById);

module.exports = router;