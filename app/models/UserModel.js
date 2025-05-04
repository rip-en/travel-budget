const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    match: [/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers'],
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  likedHolidays: {
    type: [Schema.Types.ObjectId],
    ref: 'Holiday',
    default: []
  },
  settings: {
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'English' },
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema); 