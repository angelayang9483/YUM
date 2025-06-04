const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET all menus
router.get('/', menuController.getMenus);

// GET menus today
router.get('/today', menuController.getMenusToday);

// GET menu by dining hall
router.get('/:diningHallId', menuController.getMenuByDiningHall);

// GET menu by dining hall and today
/*router.get('/:diningHall/today', menuController.getMenuByDiningHallToday);*/

// POST new menu
router.post('/', menuController.createMenu);

module.exports = router;