const Comment = require('../models/CommentModel');
const User = require('../models/UserModel');
const DiningHall = require('../models/DiningHallModel');

// create comment
const createComment = async (req, res) => {
  const { content, diningHallName, userId } = req.body;

  try {
    const diningHall = await DiningHall.findOne({ name: diningHallName });
    const comment = new Comment({
      content,
      diningHall: diningHall._id,
      user: userId
    });

    await comment.save();

    res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const linkCommentToUser = async (req, res) => {
  const { userId } = req.body;
  const { commentId } = req.params;
  console.log("LINKING COMMENT TO USER: ", userId, commentId);

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.comments.push(commentId);

    await user.save();
    await comment.save();
  } catch (err) {
    console.error("Could not add comment to user:", err);
  }
};

// get one comment
const getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req,params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found '});
        res.json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// delete comment
const deleteComment = async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// like comment
const likeComment = async (req, res) => {
  const { userId } = req.body;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const alreadyLiked = user.likedComments.includes(commentId);

    if (alreadyLiked) {
      console.log("already liked");
      user.likedComments = user.likedComments.filter(id => id.toString() !== commentId);
      comment.likes -= 1;
      if (String(comment.user) !== userId) {
        const author = await User.findById(comment.user);
        console.log("AUTHOR: ", author)
        if (author) {
          author.karma -= 5;
          await author.save();
          console.log("AUTHOR NEW KARMA: ", author.karma);
        }
      }
    } else {
      console.log('not liked yet');
      user.likedComments.push(commentId);
      comment.likes += 1;
      console.log("COMMENT USER: ", String(comment.user));
      if (String(comment.user) !== userId) {
        const author = await User.findById(comment.user);
        console.log("AUTHOR: ", author)
        if (author) {
          author.karma += 5;
          await author.save();
          console.log("AUTHOR NEW KARMA: ", author.karma);
        }
      }
    }

    await user.save();
    await comment.save();

    res.status(200).json({
      success: true,
      isLiked: !alreadyLiked,
      likeCount: comment.likes,
      message: alreadyLiked ? "Comment unliked" : "Comment liked"
    });
  } catch (err) {
    console.error("Like comment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createComment,
  getCommentById,
  deleteComment,
  likeComment
};