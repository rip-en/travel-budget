import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// List of public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
];

export function middleware(request) {
  // Get the path from the request
  const path = request.nextUrl.pathname;
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith('/api/auth/')
  );
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Get the token from cookies
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  // If there's no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production');
    
    // If the token is valid, allow access
    return NextResponse.next();
  } catch (error) {
    // If the token is invalid, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure the paths that the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/auth routes (login, signup, etc.)
     * 2. Static files (css, js, images, fonts, etc.)
     * 3. Favicon and other browser files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 