const express = require('express');
const router = express.Router();
const WebScrapeController = require('../controllers/WebScrapeController');

router.post('/', async (req, res) => {
  try {
    await WebScrapeController.updateMenuDatabase();
    res.status(200).json({ message: 'Menus updated successfully' });
  } catch (error) {
    console.error('Error updating menus:', error);
    res.status(500).json({ message: 'Failed to update menus' });
  }
});

module.exports = router;