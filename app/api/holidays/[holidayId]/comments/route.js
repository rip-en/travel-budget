import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../../../lib/mongoose'; // Adjust path
import Holiday from '../../../../models/HolidayModel'; // Adjust path
import User from '../../../../models/User'; // Adjust path

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production';

// Helper to get user details (ID and username) from token
async function getUserFromToken(request) {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        await connectToDatabase(); 
        // Fetch user to get username and ensure existence
        const user = await User.findById(decoded.userId).select('username').lean(); 
        if (!user) return null; 
        
        return { userId: user._id.toString(), username: user.username }; // Return ID and username
    } catch (error) {
        console.error("JWT verification or User fetch failed:", error.message);
        return null;
    }
}

// POST /api/holidays/[holidayId]/comments
export async function POST(request, { params }) {
    const { holidayId } = params;
    
    if (!mongoose.Types.ObjectId.isValid(holidayId)) {
        return NextResponse.json({ error: 'Invalid holiday ID format' }, { status: 400 });
    }

    const user = await getUserFromToken(request);
    if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let commentData;
    try {
        commentData = await request.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { text } = commentData;
    if (!text || typeof text !== 'string' || text.trim().length === 0 || text.length > 500) {
        return NextResponse.json({ error: 'Invalid comment text (1-500 characters required)' }, { status: 400 });
    }

    try {
        await connectToDatabase();
        
        // Find the holiday
        const holiday = await Holiday.findById(holidayId);

        if (!holiday) {
            return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
        }

        // Check permissions: Holiday must be public and commenter cannot be the owner
        if (!holiday.isPublic) {
             return NextResponse.json({ error: 'Cannot comment on a private holiday' }, { status: 403 });
        }
        if (holiday.userId.toString() === user.userId) {
             return NextResponse.json({ error: 'Cannot comment on your own holiday' }, { status: 403 });
        }

        // Create the comment object
        const newComment = {
            userId: user.userId,
            username: user.username,
            text: text.trim(),
            createdAt: new Date(),
        };

        // Add comment to the beginning of the array using $push and $position
        holiday.comments.unshift(newComment); // Modify in memory first for atomicity if needed, or push directly
        
        // Or update directly (simpler if atomicity on comment order isn't critical)
        const updatedHoliday = await Holiday.findByIdAndUpdate(
            holidayId,
            { $push: { comments: { $each: [newComment], $position: 0 } } }, // Add to start
            { new: true } // Return updated doc
        ).lean(); // Lean for performance

        if (!updatedHoliday) {
            // Should not happen if findById worked, but good practice
            return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
        }

        // Return only the newly added comment or the updated list
        return NextResponse.json(updatedHoliday.comments[0], { status: 201 }); // 201 Created

    } catch (error) {
        console.error(`Error adding comment to holiday ${holidayId}:`, error);
        // Handle potential validation errors from Mongoose if schema validation fails on save/update
        if (error.name === 'ValidationError') {
             return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 