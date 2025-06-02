const express = require('express');
const router = express.Router();
const diningHallController = require('../controllers/diningHallController');

router.get('/', diningHallController.getDiningHalls);

module.exports = router;