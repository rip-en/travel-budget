import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../../../lib/mongoose'; // Adjust path as needed
import Holiday from '../../../../models/HolidayModel'; // Adjust path as needed
import User from '../../../../models/User'; // Needed to ensure user exists

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production';

// Helper function to verify JWT and get user ID
async function getUserIdFromToken(request) {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Optional: Check if user still exists in DB
        await connectToDatabase(); // Ensure DB connection before User query
        const userExists = await User.findById(decoded.userId).lean();
        if (!userExists) return null; 
        
        return decoded.userId;
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        return null;
    }
}

// POST handler for Liking a Holiday
export async function POST(request, { params }) {
    const { holidayId } = params;
    
    if (!mongoose.Types.ObjectId.isValid(holidayId)) {
        return NextResponse.json({ error: 'Invalid holiday ID format' }, { status: 400 });
    }

    const userId = await getUserIdFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        await connectToDatabase();

        // Find the holiday and add the user to the likes array using $addToSet to prevent duplicates
        // Also increment likeCount atomically
        const updatedHoliday = await Holiday.findByIdAndUpdate(
            holidayId,
            { 
                $addToSet: { likes: userId }, // Add user ID if not already present
                $inc: { likeCount: 1 } // Increment count (ensure likeCount field exists or add it)
            },
            { new: true } // Return the updated document
        ).lean(); // Use lean for performance if only reading data

        if (!updatedHoliday) {
            return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
        }
        
        // Check if the user was actually added (findByIdAndUpdate doesn't directly tell us if $addToSet did anything)
        // We can compare the old likes array length with the new one, but incrementing likeCount handles this implicitly.
        // If likeCount didn't increment as expected (e.g., user was already there), the count remains accurate.

        return NextResponse.json({ 
            message: 'Holiday liked successfully', 
            likes: updatedHoliday.likes, // Return updated likes array
            likeCount: updatedHoliday.likeCount // Return updated count
        }, { status: 200 });

    } catch (error) {
        console.error('Error liking holiday:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE handler for Unliking a Holiday
export async function DELETE(request, { params }) {
    const { holidayId } = params;

     if (!mongoose.Types.ObjectId.isValid(holidayId)) {
        return NextResponse.json({ error: 'Invalid holiday ID format' }, { status: 400 });
    }

    const userId = await getUserIdFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        await connectToDatabase();

        // Find the holiday and remove the user from the likes array using $pull
        // Also decrement likeCount, ensuring it doesn't go below zero
        const holidayBeforeUpdate = await Holiday.findById(holidayId).select('likes').lean();
        
        if (!holidayBeforeUpdate) {
             return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
        }

        // Only decrement if the user was actually in the likes array
        const userWasLiking = holidayBeforeUpdate.likes.some(likeId => likeId.equals(userId));
        
        const updateQuery = { $pull: { likes: userId } };
        if (userWasLiking) {
            updateQuery.$inc = { likeCount: -1 }; 
            // Alternative: Could use $max: { likeCount: 0 } within $inc stage in aggregation, 
            // but simple check + conditional inc is fine.
        }

        const updatedHoliday = await Holiday.findByIdAndUpdate(
            holidayId,
            updateQuery,
            { new: true }
        ).lean(); // Use lean

        if (!updatedHoliday) {
             // Should not happen if findById worked before, but good practice
            return NextResponse.json({ error: 'Holiday not found during update' }, { status: 404 });
        }
        
        // Ensure likeCount didn't go negative ( belt-and-suspenders)
        if (updatedHoliday.likeCount < 0) {
           updatedHoliday.likeCount = 0;
           await Holiday.findByIdAndUpdate(holidayId, { likeCount: 0 });
        }


        return NextResponse.json({ 
            message: 'Holiday unliked successfully',
            likes: updatedHoliday.likes,
            likeCount: updatedHoliday.likeCount 
        }, { status: 200 });

    } catch (error) {
        console.error('Error unliking holiday:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 