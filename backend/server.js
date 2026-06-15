const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes (Modular Feature Architecture)
const authRoutes = require('./features/auth/auth.routes');
const transactionRoutes = require('./features/transactions/transaction.routes');
const budgetRoutes = require('./features/budgets/budget.routes');
const analyticsRoutes = require('./features/analytics/analytics.routes');

// Import middleware
const authMiddleware = require('./features/auth/auth.middleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: options.message
    });
  },
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

// Disable Mongoose buffering so queries fail fast when disconnected
mongoose.set('bufferCommands', false);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.log('💡 Make sure to:');
  console.log('   1. Replace the MONGODB_URI in .env with your actual MongoDB connection string');
  console.log('   2. Check your internet connection');
  console.log('   3. Verify MongoDB Atlas cluster is running');
  console.log('   4. Check IP whitelist in MongoDB Atlas');
  // Don't exit process, let server run for testing
});

// Middleware to fail fast if database is disconnected
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is offline. Please configure a valid MONGODB_URI in backend/.env'
    });
  }
  next();
};

// Health check endpoint (no auth needed)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Fincare API is running',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Auth routes (no auth middleware needed, but checks DB connection)
app.use('/api/auth', checkDbConnection, authRoutes);

// Protected routes (with auth and DB connection check)
app.use('/api/transactions', checkDbConnection, authMiddleware, transactionRoutes);
app.use('/api/budgets', checkDbConnection, authMiddleware, budgetRoutes);
app.use('/api/analytics', checkDbConnection, authMiddleware, analyticsRoutes);

// Handle 404 for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Handle 404 for all other routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Fincare Backend Server is running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
