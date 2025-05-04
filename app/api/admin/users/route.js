import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongoose'; // Adjust path
import User from '../../models/User'; // Adjust path
import { getAuthenticatedUserId, isAdmin } from '../../lib/authUtils'; // Adjust path

export async function GET(request) {
    // 1. Authenticate and check for admin
    const auth = await getAuthenticatedUserId(request);
    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const requesterUserId = auth.userId;
    const isRequesterAdmin = await isAdmin(requesterUserId);
    if (!isRequesterAdmin) {
        return NextResponse.json({ error: 'Forbidden: Requires admin privileges' }, { status: 403 });
    }

    try {
        await connectToDatabase();

        // 2. Fetch all users, excluding passwords
        // Consider adding pagination for large numbers of users
        const users = await User.find({}).select('-password').lean(); // Exclude password field

        return NextResponse.json({ users, requesterId: requesterUserId }, { status: 200 });

    } catch (error) {
        console.error('Error fetching users for admin:', error);
        return NextResponse.json({ error: 'Internal server error fetching users' }, { status: 500 });
    }
} 