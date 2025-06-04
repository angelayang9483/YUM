const FoodTruck = require('../models/FoodTruckModel');
const User = require('../models/UserModel');

// shared function
const fetchAllFoodTrucks = async () => {
  return await FoodTruck.find();
};

// GET all food trucks
const getFoodTrucks = async (req, res) => {
  try {
    const foodTrucks = await fetchAllFoodTrucks();
    res.status(200).json(foodTrucks);
  } catch (error) {
    console.error('Error fetching food trucks:', error);
    res.status(500).json({ message: 'Error fetching food trucks' });
  }
};

// GET food trucks here today
const getFoodTrucksHereToday = async (req, res) => {
  try {
    const foodTrucks = await fetchAllFoodTrucks();
    const hereToday = foodTrucks.filter(truck => truck.hereToday === true);
    
    res.status(200).json(hereToday);
  } catch (error) {
    console.error('Error fetching food trucks here today:', error);
    res.status(500).json({ message: 'Error fetching food trucks here today' });
  }
};

// GET one food truck by id
const getFoodTruckById = async (req, res) => {
  try {
    console.log("Fetching food truck with ID:", req.params.id);
    const foodTruck = await FoodTruck.findById(req.params.id);

    if (!foodTruck) {
      console.log("Food truck not found for ID:", req.params.id);
      return res.status(404).json({ message: 'Food truck not found' });
    }

    res.json(foodTruck);
  } catch (err) {
    console.error("Error in getFoodTruckById:", err.stack);
    res.status(500).json({ message: err.message });
  }
};

// favorite food truck
const favoriteFoodTruck = async (req, res) => {
  const { userId } = req.body;
  const { truckId } = req.params;

  try {
    const truck = await FoodTruck.findById(truckId);
    if (!truck) {
      return res.status(404).json({ error: "Food truck not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const alreadyFavorited = user.favoriteFoodTrucks.includes(truckId);

    if (alreadyFavorited) {
      console.log("already favorited");
      user.favoriteFoodTrucks = user.favoriteFoodTrucks.filter(id => id.toString() !== truckId);
      truck.favoriteCount -= 1;
    } else {
      console.log('not favorited yet');
      user.favoriteFoodTrucks.push(truckId);
      truck.favoriteCount += 1;
    }

    await user.save();
    await truck.save();

    res.status(200).json({
      success: true,
      isFavorited: !alreadyFavorited,
      favoriteCount: truck.favoriteCount,
      message: alreadyFavorited ? "Truck unfavorited" : "Truck unfavorited"
    });
  } catch (err) {
    console.error("Favorite truck error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getPopularFoodTrucks = async(req, res) => {
  try {
    const foodTrucks = await FoodTruck.find({favoritesCount: { $gt:20 }});
    return res.status(200).json(foodTrucks);
  }
  catch (err) {
    console.error('Error fetching popular meals:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  getFoodTrucks,
  getFoodTrucksHereToday,
  getFoodTruckById,
  favoriteFoodTruck,
  getPopularFoodTrucks
};