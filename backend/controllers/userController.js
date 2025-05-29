const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

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
        _id: user._id,
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

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  deleteUser,
  checkUsernameAndPassword,
};
