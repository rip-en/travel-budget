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

// GET /api/holidays/[id]
export async function GET(request, { params }) {
  // Extract and store id at the beginning
  const id = params.id;
  
  try {
    const auth = await getAuthenticatedUserId(request);
    
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    console.log(`Fetching holiday ${id} for user: ${auth.userId}`);
    
    const holiday = await holidayService.getHolidayById(id, auth.userId);
    
    if (!holiday) {
      return NextResponse.json(
        { error: 'Holiday not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Holiday retrieved successfully',
      holiday
    });
  } catch (error) {
    console.error(`Error fetching holiday ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch holiday', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/holidays/[id]
export async function PUT(request, { params }) {
  // Extract and store id at the beginning to avoid synchronous access warnings
  const id = params.id;
  
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
    
    console.log(`Updating holiday ${id} for user: ${auth.userId}`);
    
    const holiday = await holidayService.updateHoliday(id, holidayData, auth.userId);
    
    return NextResponse.json({
      message: 'Holiday updated successfully',
      holiday
    });
  } catch (error) {
    console.error(`Error updating holiday ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update holiday', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/holidays/[id]
export async function DELETE(request, { params }) {
  // Extract and store id at the beginning
  const id = params.id;
  
  try {
    const auth = await getAuthenticatedUserId(request);
    
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    console.log(`Deleting holiday ${id} for user: ${auth.userId}`);
    
    const result = await holidayService.deleteHoliday(id, auth.userId);
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Holiday not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error(`Error deleting holiday ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete holiday', details: error.message },
      { status: 500 }
    );
  }
} 