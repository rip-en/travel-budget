import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongoose';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers'; // Import cookies
import { deleteUserById } from '../../../services/userService'; 
import bcrypt from 'bcryptjs';
import Holiday from '../../../models/HolidayModel'; // Import Holiday model

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production';

// --- GET Handler --- 
export async function GET(request) {
  try {
    // 1. Get token from httpOnly cookie
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Verify JWT
    let decodedPayload;
    try {
      decodedPayload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      // Clear potentially invalid cookie
      const errorResponse = NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      errorResponse.cookies.set('auth_token', '', { maxAge: -1, path: '/' });
      return errorResponse;
    }

    // 3. Check for userId in payload
    if (!decodedPayload || !decodedPayload.userId) {
      return NextResponse.json({ error: 'User ID not found in token' }, { status: 401 });
    }

    // 4. Fetch user from database
    await connectToDatabase();
    const user = await User.findById(decodedPayload.userId).select('-password').lean();

    if (!user) {
      // User ID from token doesn't exist in DB (rare, but possible)
      const errorResponse = NextResponse.json({ error: 'User not found' }, { status: 404 });
      errorResponse.cookies.set('auth_token', '', { maxAge: -1, path: '/' });
      return errorResponse;
    }

    // Calculate total likes received on user's holidays
    const userHolidays = await Holiday.find({ userId: decodedPayload.userId }).select('likes').lean();
    const totalLikesReceived = userHolidays.reduce((sum, holiday) => sum + (holiday.likes?.length || 0), 0);

    // 5. Return user data including the calculated stats
    const userResponse = {
      ...user,
      totalLikesReceived
    };

    return NextResponse.json(userResponse, { status: 200 });

  } catch (error) {
    console.error('Error fetching user data for /me:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      // Clear invalid/expired cookie
      const response = NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      response.cookies.set('auth_token', '', { maxAge: -1, path: '/' });
      return response;
    }
    return NextResponse.json({ error: 'Internal server error fetching user data' }, { status: 500 });
  }
}

// --- DELETE Handler --- 
export async function DELETE(request) {
  try {
    // 1. Verify JWT and get userId (as before)
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    let decodedPayload;
    try {
      decodedPayload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      const errorResponse = NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      errorResponse.cookies.set('auth_token', '', { maxAge: -1, path: '/' });
      return errorResponse;
    }
    if (!decodedPayload || !decodedPayload.userId) {
      return NextResponse.json({ error: 'User ID not found in token' }, { status: 401 });
    }
    const userIdToDelete = decodedPayload.userId;

    // 2. Get email and password from request body for verification
    let verificationData;
    try {
      verificationData = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body for deletion' }, { status: 400 });
    }
    const { email: providedEmail, password: providedPassword } = verificationData;

    if (!providedEmail || !providedPassword) {
      return NextResponse.json({ error: 'Email and password required for verification' }, { status: 400 });
    }

    // 3. Fetch the user to verify credentials
    await connectToDatabase();
    const user = await User.findById(userIdToDelete); // Fetch full user doc including password hash

    if (!user) {
       // User from valid token not found in DB
       const errorResponse = NextResponse.json({ error: 'User not found' }, { status: 404 });
       errorResponse.cookies.set('auth_token', '', { maxAge: -1, path: '/' });
       return errorResponse;
    }

    // 4. Verify provided email and password
    const isEmailMatch = user.email.toLowerCase() === providedEmail.toLowerCase();
    const isPasswordMatch = await bcrypt.compare(providedPassword, user.password);

    if (!isEmailMatch || !isPasswordMatch) {
      console.warn(`Delete verification failed for user ${userIdToDelete}. Email match: ${isEmailMatch}, Password match: ${isPasswordMatch}`);
      return NextResponse.json({ error: 'Verification failed. Email or password incorrect.' }, { status: 403 }); // Forbidden
    }

    // --- Verification successful --- 

    // 5. Call the delete service function
    console.log(`Verification successful. Attempting to delete account for user: ${userIdToDelete}`);
    const deleteResult = await deleteUserById(userIdToDelete);

    // 6. Check deletion result
    if (!deleteResult || !deleteResult.userDeleted) {
      console.warn(`User deletion failed post-verification for ID: ${userIdToDelete}`);
      return NextResponse.json({ error: 'Failed to delete user after verification' }, { status: 500 }); 
    }

    // 7. Deletion successful - Clear cookie and return success
    console.log(`Successfully deleted verified account for user: ${userIdToDelete}`);
    const response = NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });
    response.cookies.set('auth_token', '', { maxAge: -1, path: '/' });
    return response;

  } catch (error) {
    console.error('Error deleting account via /me:', error);
    const errorResponse = NextResponse.json({ error: 'Internal server error during account deletion' }, { status: 500 });
    // Don't clear cookie on internal server error, might be temporary
    // errorResponse.cookies.set('auth_token', '', { httpOnly: true, expires: new Date(0), path: '/' });
    return errorResponse;
  }
} 