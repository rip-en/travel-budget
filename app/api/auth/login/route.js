import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongoose';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('JWT_SECRET environment variable is not defined! Using fallback secret. THIS IS NOT SECURE FOR PRODUCTION.');
}
const effectiveJwtSecret = JWT_SECRET || 'fallback_secret_do_not_use_in_production';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user) {
      // Keep error message generic for security
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Keep error message generic for security
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // --- Password is valid, proceed with JWT --- 

    // Create JWT payload
    const payload = {
      userId: user._id,
      email: user.email, // Include email for potential display/checks
      isAdmin: user.isAdmin, // Include admin status
      // Add other non-sensitive info if needed, but keep payload small
    };

    // Sign the token
    const token = jwt.sign(payload, effectiveJwtSecret, { expiresIn: '7d' }); // 7-day expiry

    // Prepare user data to return in response (exclude password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      settings: user.settings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Create response with user data
    const response = NextResponse.json({
      message: 'Login successful',
      user: userResponse
    });

    // Set the httpOnly cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true, // Essential for security!
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'lax', // Good balance of security and usability
      maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
      path: '/', // Cookie available on all paths
    });

    return response;

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
} 