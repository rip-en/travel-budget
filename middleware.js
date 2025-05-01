import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
  const token = request.cookies.get('auth_token')?.value;
  
  // If there's no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If token exists, allow access (token validation happens in API routes)
  return NextResponse.next();
}

// Configure the paths that the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/auth routes (login, signup, etc.) - handled separately above
     * 2. Static files (css, js, images, fonts, etc.)
     * 3. Favicon and other browser files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 