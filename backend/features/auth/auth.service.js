const User = require('./auth.model');
const generateToken = require('../../utils/generateToken');

class AuthService {
  async registerUser({ name, email, password }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('User already exists with this email');
      error.statusCode = 400;
      throw error;
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);
    await user.updateLastLogin();

    const userResponse = user.toObject();
    delete userResponse.password;

    return { token, user: userResponse };
  }

  async loginUser({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Account is deactivated. Please contact support.');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user._id);
    await user.updateLastLogin();

    const userResponse = user.toObject();
    delete userResponse.password;

    return { token, user: userResponse };
  }

  async updateUserProfile(userId, { name, preferences }) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (name) {
      user.name = name.trim();
    }
    
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return userResponse;
  }

  async changePassword(userId, { currentPassword, newPassword, confirmPassword }) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      const error = new Error('All password fields are required');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword !== confirmPassword) {
      const error = new Error('New passwords do not match');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error('New password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 401;
      throw error;
    }

    user.password = newPassword;
    await user.save();
    return true;
  }
}

module.exports = new AuthService();
