const { body, param } = require('express-validator');

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

module.exports = budgetValidation;
