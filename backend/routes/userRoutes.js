const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users
router.get('/', userController.getAllUsers);

// POST new user
router.post('/', userController.createUser);

// GET one user by ID
router.get('/:id', userController.getUserById);

// DELETE user
router.delete('/:id', userController.deleteUser);

// for logging in
router.post('/login', userController.checkUsernameAndPassword);

//like a comment
// router.post('/:userId/like-comment', userController.likeComment);

//get comments that have been liked by a user
router.get('/:id/liked-comments', userController.getLikedComments);

// GET comments user has made
router.get('/:id/comments', userController.getComments);

// favorite a meal
router.post('/:id/favorite-meal', userController.favoriteMeal);

// unfavorite a meal
router.delete('/:id/favorite-meal', userController.unfavoriteMeal);

// favorite a truck
router.post('/:id/favorite-truck', userController.favoriteFoodTruck);

// unfavorite a truck
router.delete('/:id/favorite-truck', userController.unfavoriteFoodTruck);

// get favorite meals
router.get('/:userId/favorite-meals', userController.getFavoriteMeals)

// GET favorite trucks
router.get('/:userId/favorite-trucks', userController.getFavoriteFoodTrucks);

module.exports = router;
