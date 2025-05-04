import { NextResponse } from 'next/server';

// Can be GET or POST, POST is slightly more conventional for actions
export async function POST(request) {
  try {
    // Create a response object
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

    // Set the cookie to be expired
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Set expiry date to the past
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout API Error:', error);
    // Even if error occurs, try to clear cookie, but return error status
    const errorResponse = NextResponse.json({ error: 'Internal server error during logout' }, { status: 500 });
    errorResponse.cookies.set('auth_token', '', { httpOnly: true, expires: new Date(0), path: '/' });
    return errorResponse;
  }
} 