require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'YUM API is running. Use /api/users to access the API endpoints.' });
});

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const scrapeMenusRoutes = require('./routes/scrapeMenusRoutes');
app.use('/api/scrapeMenus', scrapeMenusRoutes);

const diningHallRoutes = require('./routes/diningHallRoutes');
app.use('/api/dininghalls', diningHallRoutes);

// Import WebScrapeController
const WebScrapeController = require('./controllers/WebScrapeController');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('MongoDB connected');
  
  // Automatically scrape menus when server starts
  console.log('🚀 Starting automatic menu scraping...');
  try {
    await WebScrapeController.updateMenuDatabase();
    console.log('✅ Initial menu scraping completed successfully');
  } catch (error) {
    console.error('❌ Error during initial menu scraping:', error);
  }
  
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error(err));
