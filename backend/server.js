const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const analyticsRoutes = require('./routes/analytics');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  console.log('💡 Make sure to:');
  console.log('   1. Replace <db_password> in .env with your actual MongoDB password');
  console.log('   2. Check your internet connection');
  console.log('   3. Verify MongoDB Atlas cluster is running');
  console.log('   4. Check IP whitelist in MongoDB Atlas');
  // Don't exit process, let server run for testing
});

// NEW - Test routes first (no auth needed)
app.get('/api/transactions/test', (req, res) => {
  res.json({ message: 'Transactions working!', timestamp: new Date() });
});

app.get('/api/budgets/test', (req, res) => {
  res.json({ message: 'Budgets working!', timestamp: new Date() });
});

app.get('/api/analytics/test', (req, res) => {
  res.json({ message: 'Analytics working!', timestamp: new Date() });
});

app.get('/api/auth/test', (req, res) => {
  res.json({ 
    message: 'Auth routes working!', 
    timestamp: new Date(),
    env_check: {
      jwt_secret_exists: !!process.env.JWT_SECRET,
      mongodb_uri_exists: !!process.env.MONGODB_URI
    }
  });
});

// Auth routes (no auth middleware needed)
app.use('/api/auth', authRoutes);

// Protected routes (with auth)
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/budgets', authMiddleware, budgetRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FinCare API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 for API routes - FIXED VERSION
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Handle 404 for all other routes - FIXED VERSION  
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 FinCare Backend Server is running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
