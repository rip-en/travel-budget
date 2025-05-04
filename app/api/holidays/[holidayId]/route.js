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

// GET /api/holidays/[holidayId]
export async function GET(request, { params: paramsPromise }) {
  const params = await paramsPromise; // Await params
  const holidayId = params.holidayId;
  
  try {
    const auth = await getAuthenticatedUserId(request);
    
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    console.log(`Fetching holiday ${holidayId} for user: ${auth.userId}`);
    
    const holiday = await holidayService.getHolidayById(holidayId, auth.userId);
    
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
    console.error(`Error fetching holiday ${holidayId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch holiday', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/holidays/[holidayId]
export async function PUT(request, { params: paramsPromise }) {
  const params = await paramsPromise; // Await params
  const holidayId = params.holidayId;
  
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
    
    console.log(`Updating holiday ${holidayId} for user: ${auth.userId}`);
    
    // Assuming holidayService.updateHoliday handles authorization internally or accepts userId
    const updatedHoliday = await holidayService.updateHoliday(holidayId, holidayData, auth.userId);
    
    return NextResponse.json({
      message: 'Holiday updated successfully',
      holiday: updatedHoliday // Return the updated holiday object
    });
  } catch (error) {
    console.error(`Error updating holiday ${holidayId}:`, error);
    // Check for specific errors like "Holiday not found for this user"
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { error: 'Failed to update holiday', details: error.message },
      { status: status }
    );
  }
}

// DELETE /api/holidays/[holidayId]
export async function DELETE(request, { params: paramsPromise }) {
  const params = await paramsPromise; // Await params
  const holidayId = params.holidayId;
  
  try {
    const auth = await getAuthenticatedUserId(request);
    
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    console.log(`Deleting holiday ${holidayId} for user: ${auth.userId}`);
    
    // Assuming holidayService.deleteHoliday handles authorization internally or accepts userId
    const result = await holidayService.deleteHoliday(holidayId, auth.userId);
    
    if (!result || result.deletedCount === 0) { // Check if deletion was successful
      return NextResponse.json(
        { error: 'Holiday not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error(`Error deleting holiday ${holidayId}:`, error);
    // Check for specific errors like "Holiday not found for this user"
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { error: 'Failed to delete holiday', details: error.message },
      { status: status }
    );
  }
} 