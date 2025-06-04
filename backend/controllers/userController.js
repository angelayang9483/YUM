const User = require('../models/UserModel');
const Comment = require('../models/CommentModel');
const jwt = require('jsonwebtoken');
const Meal = require('../models/MealModel');
const FoodTruck = require('../models/FoodTruckModel');


// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a user
const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(200).json({userId: user._id, token})
    } catch (error) {
        console.log("Error creating user:", error)

        if (error.name === 'ValidationError') {
          const errors = {};
          for (let field in error.errors) {
            errors[field] = error.errors[field].message;
          }
          return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: errors
          });
        }

        res.status(400).json({
          success: false, 
          message: error.message
        })
    }
};

// Get one user
const getUserById = async (req, res) => {
  try {
    console.log("Fetching user with ID:", req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check Username and password for signin
const checkUsernameAndPassword = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password"});
    }
    try {
      const isMatch = await user.checkPassword(password);
      if(!isMatch) {
        return res.status(401).json({ error: "Invalid username or password"});
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.status(200).json({
        userId: user._id,
        // username: user.username,
        token: token
      });
    } catch (err) {
      console.error("Password comparison error:", err);
      res.status(500).json({ error: "Server error occurred" });
    }
  } catch(error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
}

const getLikedComments = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user and populate their liked comments with full comment data
    const user = await User.findById(id).populate('likedComments');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the populated liked comments
    res.status(200).json({
      success: true,
      likedComments: user.likedComments,
      count: user.likedComments.length
    });

  } catch (error) {
    console.error("Get liked comments error:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
}

const getFavoriteFoodTrucks = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user and populate their favorite trucks
    const user = await User.findById(userId).populate('favoriteFoodTrucks');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the populated favorite trucks
    res.status(200).json({
      success: true,
      favoriteFoodTrucks: user.favoriteFoodTrucks,
      count: user.favoriteFoodTrucks.length
    });

  } catch (error) {
    console.error("Get favorite food trucks error:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
}

const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user and populate their liked comments with full comment data
    const user = await User.findById(id).populate('comments');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the populated liked comments
    res.status(200).json({
      success: true,
      comments: user.comments,
      count: user.comments.length
    });

  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
}

const favoriteMeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { mealId } = req.body;

        const user = await User.findById(id);
        const meal = await Meal.findById(mealId);


        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!meal) {
            return res.status(404).json({ error: "Meal not found" });
        }

        user.favoriteMeals.push(mealId);
        await user.save();

        meal.favoritesCount += 1;
        await meal.save();

        res.status(200).json({
            success: true,
            message: "Meal favorited successfully",
            meal: meal
        });
    } catch (error) {
        console.error("Favorite meal error:", error);
        res.status(500).json({ error: "Server error occurred" });
    }
}


const unfavoriteMeal = async (req, res) => {
  try {
      const { id } = req.params;
      const { mealId } = req.body;

      const user = await User.findById(id);
      const meal = await Meal.findById(mealId);

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      if (!meal) {
          return res.status(404).json({ error: "Meal not found" });
      }

      user.favoriteMeals.pull(mealId);
      await user.save();

      meal.favoritesCount -= 1;
      await meal.save();

      res.status(200).json({
          success: true,
          message: "Meal unfavorited successfully",
          meal: meal
      });
  } catch (error) {
      console.error("Unfavorite meal error:", error);
      res.status(500).json({ error: "Server error occurred" });
  }
}

const favoriteFoodTruck = async (req, res) => {
  try {
    const { id } = req.params;
    const { truckId } = req.body;

    const user = await User.findById(id);
    const truck = await FoodTruck.findById(truckId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    if (!truck) {
        return res.status(404).json({ error: "Food truck not found" });
    }

    user.favoriteFoodTrucks.push(truckId);
    await user.save();

    truck.favoritesCount += 1;
    await truck.save();

    res.status(200).json({
        success: true,
        message: "Food truck favorited successfully",
        truck: truck
    });
  } catch (error) {
    console.error("Favorite food truck error:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
}

const unfavoriteFoodTruck = async (req, res) => {
  try {
    const { id } = req.params;
    const { truckId } = req.body;

    const user = await User.findById(id);
    const truck = await FoodTruck.findById(truckId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    if (!truck) {
        return res.status(404).json({ error: "Food truck not found" });
    }

    user.favoriteFoodTrucks.pull(truckId);
    await user.save();

    truck.favoritesCount -= 1;
    await truck.save();

    res.status(200).json({
        success: true,
        message: "Food truck unfavorited successfully",
        truck: truck
    });
  } catch (error) {
    console.error("Unfavorite food truck error:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
}

const getFavoriteMeals = async (req, res) => {
  console.log("Fetching favorite meals");
  try {
    const { userId } = req.params;

    // Find the user and populate their favorite meals
    const user = await User.findById(userId).populate('favoriteMeals');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the populated favorite trucks
    res.status(200).json({
      success: true,
      favoriteMeals: user.favoriteMeals,
      count: user.favoriteMeals.length
    });

  } catch (error) {
    console.error("Get favorite meals error:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
}

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  deleteUser,
  checkUsernameAndPassword,
  // likeComment,
  getLikedComments,
  favoriteFoodTruck,
  unfavoriteFoodTruck,
  getFavoriteFoodTrucks,
  getComments,
  favoriteMeal,
  unfavoriteMeal,
  getFavoriteMeals
};
