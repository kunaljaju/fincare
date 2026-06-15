const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { validationResult } = require('express-validator');

const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, 201, 'User registered successfully', result);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to create user account');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Login failed. Please try again.');
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Profile retrieved successfully', {
    user: req.user
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const updatedUser = await authService.updateUserProfile(req.user._id, req.body);
    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: updatedUser
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to update profile');
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Logout successful', {
    message: 'Please remove the token from client storage'
  });
});

const changePassword = asyncHandler(async (req, res) => {
  try {
    await authService.changePassword(req.user._id, req.body);
    return sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to change password');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  changePassword
};
