import mongoose from 'mongoose';

// Cache the mongoose connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 60000, // 60 seconds
      socketTimeoutMS: 90000,          // 90 seconds
      connectTimeoutMS: 60000,         // 60 seconds
      maxPoolSize: 10,                 // Maintain up to 10 socket connections
      maxIdleTimeMS: 120000            // 2 minutes
    };

    console.log('Connecting to MongoDB...', new Date().toISOString());
    
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log('Connected to MongoDB!', new Date().toISOString());
      return mongoose;
    }).catch(err => {
      console.error('MongoDB connection error:', err);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
} 