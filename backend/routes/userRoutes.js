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
router.post('/login', userController.checkEmailAndPassword);

module.exports = router;
