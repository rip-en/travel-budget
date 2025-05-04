import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongoose'; // Adjust path
import User from '../../models/User'; // Adjust path
import Holiday from '../../models/Holiday'; // Adjust path
import { getAuthenticatedUserId, isAdmin } from '../../lib/authUtils'; // Import both from authUtils

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

        // 2. Fetch stats
        const userCount = await User.countDocuments();
        const holidayCount = await Holiday.countDocuments();
        // Add more stats as needed, e.g., count of recent signups

        const stats = {
            totalUsers: userCount,
            totalHolidays: holidayCount,
            // Add more stats here
        };

        return NextResponse.json(stats, { status: 200 });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal server error fetching stats' }, { status: 500 });
    }
} 