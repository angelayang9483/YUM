const express = require('express');
const router = express.Router();
const WebScrapeController = require('../controllers/WebScrapeController');

// POST /api/scrapeFoodTrucks - Trigger food truck scraping
router.post('/', async (req, res) => {
  try {
    const result = await WebScrapeController.scrapeFoodTrucks();
    res.json(result);
  } catch (error) {
    console.error('Error scraping food trucks:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 