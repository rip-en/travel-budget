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
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    match: [/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
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
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema); 