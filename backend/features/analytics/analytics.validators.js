const { query } = require('express-validator');

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

module.exports = analyticsValidation;
