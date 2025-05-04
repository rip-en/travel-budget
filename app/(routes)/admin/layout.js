import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthenticatedUserId, isAdmin } from '../../lib/authUtils'; // Adjust path

// This is a Server Component Layout
export default async function AdminLayout({ children }) {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    let userId = null;
    let isUserAdmin = false;

    if (token) {
        // Mock request object for getAuthenticatedUserId
        // In server components, we don't have the full Request object directly
        const mockRequest = {
            cookies: {
                get: (name) => cookieStore.get(name),
            },
        };
        const auth = await getAuthenticatedUserId(mockRequest); 
        
        if (!auth.error) {
            userId = auth.userId;
            isUserAdmin = await isAdmin(userId);
        }
    }

    // If not an admin, redirect to home page (or login page)
    if (!isUserAdmin) {
        // You might want to redirect to a specific 'unauthorized' page
        // or the login page instead of the homepage.
        redirect('/'); 
    }

    // If admin, render the children (the admin page)
    return <>{children}</>;
} 