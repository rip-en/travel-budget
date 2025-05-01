import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password should be at least 6 characters'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  settings: {
    imageDisplayMode: {
      type: String,
      enum: ['blurred-background', 'simple', 'contain', 'cover'],
      default: 'blurred-background',
    },
    defaultCurrency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'TRY'],
      default: 'USD',
    },
    language: {
      type: String,
      enum: ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'],
      default: 'English',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema); 