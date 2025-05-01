import { NextResponse } from 'next/server';

export async function GET() {
  // Create response
  const response = NextResponse.json({
    message: 'Logged out successfully',
  });

  // Clear the cookie
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    sameSite: 'lax',
    path: '/'
  });

  return response;
} 