import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongoose'; // Corrected relative path
import User from '../../../models/User'; // Corrected relative path
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'; // Import mongoose
import { cookies } from 'next/headers'; // Use cookies

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('JWT_SECRET environment variable is not defined! Using fallback secret. THIS IS NOT SECURE FOR PRODUCTION.');
}
const effectiveJwtSecret = JWT_SECRET || 'fallback_secret_do_not_use_in_production';

export async function PUT(request) {
  // mongoose.set('debug', false); // Remove debugging toggle
  try {
    // 1. Verify JWT and get userId
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    let decodedPayload;
    try {
      decodedPayload = jwt.verify(token, effectiveJwtSecret);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    if (!decodedPayload || !decodedPayload.userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }
    const userId = decodedPayload.userId;

    // 2. Get new username from request
    const { username } = await request.json();
    console.log(`API received request to update username for user ${userId} to: ${username}`);

    // 3. Validation (Server-side)
    if (!username || username.length < 3 || !/^[a-zA-Z0-9]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long and contain only letters and numbers' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 4. Check if username is already taken by ANOTHER user (case-insensitive)
    const existingUser = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }, 
      _id: { $ne: userId } 
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 }); // 409 Conflict
    }

    // 5. Update the user directly
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { username: username } }, // Use $set to explicitly update
        { new: true, runValidators: true } // Return updated doc, run schema validators
    ).select('username'); // Only select username

    if (!updatedUser) {
      // User from valid token not found (deleted between verify and update?)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('Username updated successfully in DB for user:', userId);

    return NextResponse.json(
        { message: 'Username updated successfully', username: updatedUser.username }, 
        { status: 200 }
    );

  } catch (error) {
     // Handle potential errors (DB connection, validation, duplicates during update)
     console.error('Update username error:', error);
     if (error.code === 11000) { // Duplicate key error during update
       return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
     }
     if (error.name === 'ValidationError') {
       return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
     }
     return NextResponse.json({ error: 'Internal server error updating username' }, { status: 500 });
  } 
  // finally {
  //    mongoose.set('debug', false); // Remove debugging toggle
  // }
} 