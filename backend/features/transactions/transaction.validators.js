const { body, query, param } = require('express-validator');

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

module.exports = transactionValidation;
