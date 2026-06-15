const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0.01, 'Budget amount must be greater than 0'],
    validate: {
      validator: function(value) {
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: 'Budget amount can have at most 2 decimal places'
    }
  },
  period: {
    type: String,
    required: true,
    enum: {
      values: ['monthly', 'weekly', 'yearly'],
      message: 'Period must be monthly, weekly, or yearly'
    },
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    }
  },
  endDate: {
    type: Date,
    required: true,
    default: function() {
      const start = this.startDate || new Date();
      const end = new Date(start);
      
      switch (this.period) {
        case 'weekly':
          end.setDate(start.getDate() + 7);
          break;
        case 'yearly':
          end.setFullYear(start.getFullYear() + 1);
          break;
        case 'monthly':
        default:
          end.setMonth(start.getMonth() + 1);
      }
      
      return end;
    }
  },
  alertThreshold: {
    type: Number,
    min: [0, 'Alert threshold cannot be negative'],
    max: [100, 'Alert threshold cannot be more than 100'],
    default: 80 // Alert when 80% of budget is spent
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for limit (alias to amount)
budgetSchema.virtual('limit')
  .get(function() {
    return this.amount;
  })
  .set(function(value) {
    this.amount = value;
  });

// Compound index to ensure one budget per category per period per user
budgetSchema.index(
  { user: 1, category: 1, period: 1, startDate: 1 },
  { unique: true }
);

// Virtual for formatted amount in INR
budgetSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.amount);
});

// Instance method to check if budget period is active
budgetSchema.methods.isActivePeriod = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Static method to get active budgets for a user
budgetSchema.statics.getActiveBudgets = function(userId) {
  const now = new Date();
  return this.find({
    user: userId,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

module.exports = mongoose.model('Budget', budgetSchema);
