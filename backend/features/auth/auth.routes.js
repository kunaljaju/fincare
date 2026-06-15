const express = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('./auth.middleware');
const userValidation = require('./auth.validators');

const router = express.Router();

// Public routes
router.post('/register', userValidation.register, authController.registerUser);
router.post('/login', userValidation.login, authController.loginUser);

// Protected routes (require authMiddleware)
router.get('/verify', authMiddleware, authController.getUserProfile);
router.get('/profile', authMiddleware, authController.getUserProfile);
router.put('/profile', authMiddleware, userValidation.updateProfile, authController.updateUserProfile);
router.post('/logout', authMiddleware, authController.logoutUser);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
