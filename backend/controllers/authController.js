const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 400, 'User already exists with this email');
  }

  try {
    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return sendSuccess(res, 201, 'User registered successfully', {
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 500, 'Failed to create user account');
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  const { email, password } = req.body;

  try {
    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 401, 'Account is deactivated. Please contact support.');
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Login failed. Please try again.');
  }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    return sendSuccess(res, 200, 'Profile retrieved successfully', {
      user: req.user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return sendError(res, 500, 'Failed to retrieve user profile');
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  const { name, preferences } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Update fields
    if (name) {
      user.name = name.trim();
    }
    
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: userResponse
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return sendError(res, 500, 'Failed to update profile');
  }
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // Here we just confirm the logout action
  return sendSuccess(res, 200, 'Logout successful', {
    message: 'Please remove the token from client storage'
  });
});

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    return sendError(res, 400, 'All password fields are required');
  }

  if (newPassword !== confirmPassword) {
    return sendError(res, 400, 'New passwords do not match');
  }

  if (newPassword.length < 6) {
    return sendError(res, 400, 'New password must be at least 6 characters long');
  }

  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return sendError(res, 500, 'Failed to change password');
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
