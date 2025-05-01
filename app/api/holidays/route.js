import { NextResponse } from 'next/server';
import * as holidayService from '@/app/services/holidayService';
import jwt from 'jsonwebtoken';

// Helper function to verify authentication
async function getAuthenticatedUserId(request) {
  // Get token from cookie
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return { error: 'Not authenticated', status: 401 };
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production');
    return { userId: decoded.userId };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

// GET /api/holidays - Get all holidays for the authenticated user
export async function GET(request) {
  try {
    const auth = await getAuthenticatedUserId(request);
    
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    console.log(`Fetching holidays for user: ${auth.userId}`);
    const holidays = await holidayService.getHolidaysByUserId(auth.userId);
    
    return NextResponse.json({
      message: 'Holidays retrieved successfully',
      count: holidays.length,
      holidays
    });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holidays', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/holidays - Create a new holiday for the authenticated user
export async function POST(request) {
  try {
    const auth = await getAuthenticatedUserId(request);
    
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Get holiday data from request
    let holidayData;
    try {
      holidayData = await request.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    // Basic validation
    if (!holidayData.title || !holidayData.destination) {
      return NextResponse.json(
        { error: 'Title and destination are required' },
        { status: 400 }
      );
    }
    
    // Add user ID to holiday data
    holidayData.userId = auth.userId;
    
    console.log(`Creating holiday for user: ${auth.userId}`, holidayData);
    
    // Create the holiday
    const holiday = await holidayService.createHoliday(holidayData);
    
    return NextResponse.json({
      message: 'Holiday created successfully',
      holiday
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating holiday:', error);
    return NextResponse.json(
      { error: 'Failed to create holiday', details: error.message },
      { status: 500 }
    );
  }
} 