import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongoose';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export async function GET(request) {
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

    // Connect to database
    await connectToDatabase();

    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 