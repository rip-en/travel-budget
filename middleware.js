import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Public page routes (no need to list /api routes here due to matcher config)
const publicPageRoutes = [
  '/', // Assuming homepage is public
  '/login',
  '/signup',
];

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('auth_token')?.value;

  // Check if the current path is a public page route
  const isPublicPage = publicPageRoutes.includes(path);

  // If it's a public page, allow access regardless of token
  if (isPublicPage) {
    return NextResponse.next();
  }

  // If it's not a public page and there's no token, redirect to login
  if (!token) {
    console.log(`Middleware: No token found for protected route ${path}. Redirecting to login.`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If it's not a public page and token exists, allow access
  // API routes will perform finer-grained token validation
  return NextResponse.next();
}

// Config ensures middleware only runs on specified paths (excluding /api, static assets, etc.)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 