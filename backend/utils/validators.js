const { body, query, param } = require('express-validator');

/**
 * User validation rules
 */
const userValidation = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .isLength({ min: 6, max: 128 })
      .withMessage('Password must be between 6 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    
    body('preferences.currency')
      .optional()
      .isIn(['INR', 'USD', 'EUR', 'GBP'])
      .withMessage('Invalid currency'),
    
    body('preferences.language')
      .optional()
      .isIn(['en', 'hi'])
      .withMessage('Invalid language')
  ]
};

/**
 * Transaction validation rules
 */
const transactionValidation = {
  create: [
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('Type must be either income or expense'),
    
    body('amount')
      .isFloat({ min: 0.01, max: 10000000 })
      .withMessage('Amount must be between 0.01 and 10,000,000'),
    
    body('description')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Description must be between 1 and 200 characters'),
    
    body('category')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category is required and must be less than 50 characters'),
    
    body('date')
      .isISO8601()
      .withMessage('Date must be a valid ISO date')
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error('Transaction date cannot be in the future');
        }
        return true;
      }),
    
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    
    body('tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Tags must be an array with maximum 10 items'),
    
    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Each tag must be between 1 and 20 characters')
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid transaction ID'),
    
    body('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage('Type must be either income or expense'),
    
    body('amount')
      .optional()
      .isFloat({ min: 0.01, max: 10000000 })
      .withMessage('Amount must be between 0.01 and 10,000,000'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Description must be between 1 and 200 characters'),
    
    body('category')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category must be less than 50 characters'),
    
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO date'),
    
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ],

  query: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage('Type must be income or expense'),
    
    query('category')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category filter is invalid'),
    
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be valid ISO date'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be valid ISO date'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters')
  ]
};

/**
 * Budget validation rules
 */
const budgetValidation = {
  create: [
    body('category')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category is required and must be less than 50 characters'),
    
    body('limit')
      .isFloat({ min: 0.01, max: 10000000 })
      .withMessage('Budget limit must be between 0.01 and 10,000,000'),
    
    body('period')
      .optional()
      .isIn(['monthly', 'weekly', 'yearly'])
      .withMessage('Period must be monthly, weekly, or yearly'),
    
    body('alertThreshold')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Alert threshold must be between 0 and 100'),
    
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be valid ISO date'),
    
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be valid ISO date')
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid budget ID'),
    
    body('limit')
      .optional()
      .isFloat({ min: 0.01, max: 10000000 })
      .withMessage('Budget limit must be between 0.01 and 10,000,000'),
    
    body('alertThreshold')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Alert threshold must be between 0 and 100'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value')
  ]
};

/**
 * Analytics validation rules
 */
const analyticsValidation = {
  categories: [
    query('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage('Type must be income or expense'),
    
    query('period')
      .optional()
      .isIn(['1month', '3months', '6months', '1year'])
      .withMessage('Period must be 1month, 3months, 6months, or 1year')
  ],

  trends: [
    query('months')
      .optional()
      .isInt({ min: 1, max: 24 })
      .withMessage('Months must be between 1 and 24')
  ]
};

module.exports = {
  userValidation,
  transactionValidation,
  budgetValidation,
  analyticsValidation
};
