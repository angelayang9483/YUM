const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// POST new comment
router.post('/', commentController.createComment);

// GET one comment by ID
router.get('/:id', commentController.getCommentById);

// DELETE comment
router.delete('/:id', commentController.deleteComment);

// like a comment
router.post('/:commentId/like', commentController.likeComment);

module.exports = router;