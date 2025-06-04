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

const mealRoutes = require('./routes/mealRoutes');
app.use('/api/meals', mealRoutes);

const menuRoutes = require('./routes/menuRoutes');
app.use('/api/menus', menuRoutes);

const scrapeFoodTrucksRoutes = require('./routes/scrapeFoodTrucksRoutes');
app.use('/api/scrapeFoodTrucks', scrapeFoodTrucksRoutes);

const foodTruckRoutes = require('./routes/foodTruckRoutes');
app.use('/api/foodtrucks', foodTruckRoutes);

//added to reset the backend
const scrapeMenusRoutes = require('./routes/scrapeMenus');
app.use('/api/scrape/menus', scrapeMenusRoutes);

// Import WebScrapeController
const WebScrapeController = require('./controllers/WebScrapeController');


function msUntilNextMidnight() {
  const now = new Date();
  const tomorrowMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  return tomorrowMidnight.getTime() - now.getTime();
}

async function runScrapeCycle() {
  isScraping = true;
  try {
    console.log('Starting automatic menu scraping...');
    await WebScrapeController.updateMenuDatabase();
    console.log('Menu scraping complete.');

    console.log('Starting food truck scraping...');
    await WebScrapeController.scrapeFoodTrucks();
    console.log('Food truck scraping complete.');
  } catch (err) {
    console.error('Error during scrape cycle:', err);
  } finally {
    isScraping = false;
  }
}

function scheduleDailyRefresh() {
  const initialDelay = msUntilNextMidnight();
  console.log(
    `Waiting ${initialDelay}ms until the next local midnight...`
  );

  setTimeout(() => {
    runScrapeCycle();

    setInterval(() => {
      runScrapeCycle();
    }, 24 * 60 * 60 * 1000);
  }, initialDelay);
}
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('MongoDB connected');
  
  try {
    console.log('Starting initial menu scraping...');
    isScraping = true;
    await WebScrapeController.updateMenuDatabase();
    console.log('Initial menu scraping complete.');

    console.log('Starting initial food truck scraping...');
    await WebScrapeController.scrapeFoodTrucks();
    console.log('Initial food truck scraping complete.');
  } catch (error) {
    console.error('Error during initial scraping:', error);
  } finally {
    isScraping = false;
  }

  scheduleDailyRefresh();

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error(err));

