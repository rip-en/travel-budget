import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongoose';
import User from '../../../models/User';

export async function POST(request) {
  try {
    const { field, value } = await request.json();

    if (!field || !value || (field !== 'email' && field !== 'username')) {
      return NextResponse.json({ error: 'Invalid field or value for availability check' }, { status: 400 });
    }

    // Basic format check before hitting DB (optional but good practice)
    if (field === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
      // Don't need to check DB if format is invalid
      return NextResponse.json({ available: false, message: 'Invalid format' }, { status: 200 }); 
    }
    if (field === 'username' && (value.length < 3 || !/^[a-zA-Z0-9]+$/.test(value))) {
      // Don't need to check DB if format/length is invalid
       return NextResponse.json({ available: false, message: 'Invalid format' }, { status: 200 });
    }

    await connectToDatabase();

    // Perform case-insensitive check
    const query = { [field]: { $regex: new RegExp(`^${value}$`, 'i') } };
    const existingUser = await User.findOne(query).select('_id').lean(); // Only need to know if it exists

    return NextResponse.json({ available: !existingUser }, { status: 200 });

  } catch (error) {
    console.error('Availability Check API Error:', error);
    // Don't reveal specific errors, just indicate check failed
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
  }
} 