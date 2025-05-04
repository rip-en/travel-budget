import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Expense amount is required'],
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Transportation', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Other'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
  url: { 
    type: String, 
    trim: true, 
  },
  comment: { 
    type: String, 
    trim: true 
  },
});

const HolidaySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true, // Index for faster queries by user
  },
  title: {
    type: String,
    required: [true, 'Holiday title is required'],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    index: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  budget: {
    amount: {
      type: Number,
      default: 0,
      min: 0,
      required: false,
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'TRY'],
      default: 'GBP',
    }
  },
  expenses: {
    type: [ExpenseSchema],
    default: [],
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  imageType: {
    type: String,
    enum: ['upload', 'preset', null],
    default: null,
  },
  imageData: {
    type: String, // Base64 data for uploaded images
    default: null,
  },
  imagePreset: {
    type: Number, // Index for preset images
    default: null,
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true,
  },
  tags: {
    type: [String],
    default: [],
    index: true,
  },
  // --- Like/Heart Fields ---
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
    index: true // Index for potential lookups related to likes
  },
  likeCount: {
    type: Number,
    default: 0,
    index: true // Index for sorting by popularity
  },
  // -------------------------
  
  // --- Comments --- 
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      username: { // Denormalized for easier display
        type: String,
        required: true, 
      },
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500, // Add a max length
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // ---------------

}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Virtual property for total expenses
HolidaySchema.virtual('totalExpenses').get(function() {
  return this.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
});

// Virtual property for remaining budget
HolidaySchema.virtual('remainingBudget').get(function() {
  return (this.budget?.amount || 0) - this.totalExpenses;
});

// Include virtuals when converting to JSON
HolidaySchema.set('toJSON', { virtuals: true });
HolidaySchema.set('toObject', { virtuals: true });

export default mongoose.models.Holiday || mongoose.model('Holiday', HolidaySchema); 