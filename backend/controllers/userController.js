const User = require('../models/UserModel');
const { Comment } = require('../models/commentModel');
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

const likeComment = async (req, res) => {
  try {
    const { userId } = req.params;
    const { commentId } = req.body;

    // Find user and comment
    const user = await User.findById(userId);
    const comment = await Comment.findById(commentId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if user already liked this comment
    const alreadyLiked = user.likedComments.includes(commentId);

    if (alreadyLiked) {
      // Unlike: Remove from user's liked array and decrease comment count
      user.likedComments = user.likedComments.filter(id => id.toString() !== commentId);
      comment.likes -= 1
    } else {
      // Like: Add to user's liked array and increase comment count
      user.likedComments.push(commentId);
      comment.likes += 1;
    }

    // Save both updates
    await user.save();
    await comment.save();

    res.status(200).json({
      success: true,
      isLiked: !alreadyLiked,
      likeCount: comment.likes,
      message: alreadyLiked ? "Comment unliked" : "Comment liked"
    });

  } catch (error) {
    console.error("Like comment error:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
}

const getLikedComments = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user and populate their liked comments with full comment data
    const user = await User.findById(userId).populate('likedComments');

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

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  deleteUser,
  checkUsernameAndPassword,
  likeComment,
  getLikedComments
};
