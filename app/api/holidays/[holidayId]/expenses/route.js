import { NextResponse } from 'next/server';
import * as holidayService from '@/app/services/holidayService';
import jwt from 'jsonwebtoken';

// Helper function to verify authentication (can be shared or duplicated)
async function getAuthenticatedUserId(request) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return { error: 'Not authenticated', status: 401 };
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production');
    return { userId: decoded.userId };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

// POST /api/holidays/[holidayId]/expenses
export async function POST(request, { params }) {
  // Attempt direct access after ensuring params context is stable
  await Promise.resolve(); // Minimal await to potentially ensure context
  const holidayId = params?.holidayId; 
  
  console.log(`API Route: Processing POST request. Accessed holidayId: ${holidayId}`);

  // Check if holidayId was successfully extracted
  if (!holidayId) {
    console.error("API Error: Missing holidayId parameter after access attempt");
    return NextResponse.json({ error: 'Missing holidayId parameter' }, { status: 400 });
  }
  
  console.log(`API Route: Processing POST request for holidayId: ${holidayId}`);

  try {
    // Authenticate user
    const auth = await getAuthenticatedUserId(request);
    if (auth.error) {
      console.error(`API Error: Authentication failed - ${auth.error}`);
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Get expense data from request
    let expenseData;
    try {
      expenseData = await request.json();
    } catch (error) {
      console.error("API Error: Invalid JSON in request body", error);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // Ensure title is set from description if necessary
    if (expenseData.description && !expenseData.title) {
      expenseData.title = expenseData.description;
    }

    console.log(`Adding expense to holiday ${holidayId} for user: ${auth.userId}`);
    console.log("Expense data received by API:", JSON.stringify(expenseData, null, 2));
    
    // Add expense using the service, passing userId for authorization check
    const newExpense = await holidayService.addExpense(holidayId, expenseData, auth.userId);
    
    console.log("New expense created:", JSON.stringify(newExpense, null, 2));
    
    // Return the newly added expense (or could return the updated holiday)
    return NextResponse.json(newExpense, { status: 201 });

  } catch (error) {
    console.error(`Error adding expense to holiday ${holidayId}:`, error);
    // Check for specific errors like "Holiday not found for this user"
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { error: 'Failed to add expense', details: error.message },
      { status: status }
    );
  }
} 