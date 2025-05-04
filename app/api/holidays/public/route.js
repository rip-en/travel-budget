import { NextResponse } from 'next/server';
import * as holidayService from '@/app/services/holidayService';

// GET /api/holidays/public
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const searchTerm = searchParams.get('q') || ''; // Search term (q=...)
    const tagsParam = searchParams.get('tags') || ''; // Comma-separated tags (tags=beach,city)
    const sortBy = searchParams.get('sortBy') || 'createdAt_desc'; // Sort option (sortBy=startDate_asc)
    
    // Process tags into an array
    const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    const options = {
      searchTerm,
      tags,
      sortBy
    };

    console.log('Fetching public holidays with options:', options);
    
    const publicHolidays = await holidayService.getPublicHolidays(options);
    
    return NextResponse.json({
      message: 'Public holidays retrieved successfully',
      holidays: publicHolidays
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching public holidays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public holidays', details: error.message },
      { status: 500 }
    );
  }
} 