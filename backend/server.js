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

let isScraping = true;

app.get('/scrape-status', (req, res) => {
  res.json({ isScraping });
});

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const diningHallRoutes = require('./routes/diningHallRoutes');
app.use('/api/dininghalls', diningHallRoutes);

const commentRoutes = require('./routes/commentRoutes');
app.use('/api/comments', commentRoutes);

const foodTruckRoutes = require('./routes/foodTruckRoutes');
app.use('/api/foodtrucks', foodTruckRoutes);

// Import WebScrapeController
const WebScrapeController = require('./controllers/WebScrapeController');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('MongoDB connected');
  
  // Automatically scrape menus when server starts
  console.log('Starting automatic menu scraping...');
  try {
    isScraping = true;
    await WebScrapeController.updateMenuDatabase();
    console.log('Starting food truck scraping...');
    await WebScrapeController.scrapeFoodTrucks();
  } catch (error) {
    console.error('Error during initial scraping:', error);
  } finally {
    isScraping = false;
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error(err));
