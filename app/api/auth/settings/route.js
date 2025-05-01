import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export async function PUT(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production');
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const { settings } = await request.json();

    // Validate settings
    if (!settings) {
      return NextResponse.json({ error: 'Settings are required' }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Update user settings
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: { settings } },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        settings: updatedUser.settings
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 