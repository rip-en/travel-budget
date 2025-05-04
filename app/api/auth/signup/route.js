import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongoose';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

// Basic email regex (adjust if needed)
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;

export async function POST(request) {
  try {
    const { name, email, username, password } = await request.json();

    // --- Input Validation ---
    if (!name || !email || !username || !password) {
      return NextResponse.json({ error: 'All fields (name, email, username, password) are required' }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (username.length < 3 || !USERNAME_REGEX.test(username)) {
      return NextResponse.json({ error: 'Username must be 3+ characters, letters/numbers only' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    // --- End Validation ---

    await connectToDatabase();

    // Check for existing user (case-insensitive check for email/username)
    const existingUser = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${email}$`, 'i') } },
        { username: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    });

    if (existingUser) {
      const message = existingUser.email.toLowerCase() === email.toLowerCase()
        ? 'An account with this email already exists.'
        : 'This username is already taken.';
      return NextResponse.json({ error: message }, { status: 409 }); // 409 Conflict
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user instance
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      // Default settings can be handled by schema defaults
    });

    // Save the user
    await newUser.save();

    // Prepare response data (excluding password)
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
      settings: newUser.settings,
      createdAt: newUser.createdAt, // Include timestamps
      updatedAt: newUser.updatedAt
    };

    return NextResponse.json(
      { message: 'User created successfully', user: userResponse },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup API Error:', error);
    // Handle potential duplicate key errors during save (race condition, though check above helps)
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email or username already exists.' }, { status: 409 });
    }
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    // Generic error
    return NextResponse.json({ error: 'Internal server error during signup' }, { status: 500 });
  }
} 