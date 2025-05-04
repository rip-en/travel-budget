'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root Page Component
 * 
 * This component serves as the entry point for the root path ('/').
 * It immediately redirects the user to the '/holidays' page upon mounting.
 */
export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Automatically navigate to the main holidays view
    router.push('/holidays');
  }, [router]); // Dependency array ensures this runs once on mount
  
  // Display a simple loading/redirecting message while the navigation occurs.
  // This prevents a flash of unstyled content or an empty page.
  return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
}