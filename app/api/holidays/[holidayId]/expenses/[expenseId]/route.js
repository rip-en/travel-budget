import { NextResponse } from 'next/server';
import * as holidayService from '@/app/services/holidayService'; // Adjust path if needed
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

// PUT /api/holidays/[holidayId]/expenses/[expenseId]
export async function PUT(request, { params }) {
  const { holidayId, expenseId } = params;
  
  try {
    // Authenticate user
    const auth = await getAuthenticatedUserId(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Get expense data from request
    let expenseData;
    try {
      expenseData = await request.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // Ensure title is set from description if necessary
    if (expenseData.description && !expenseData.title) {
      expenseData.title = expenseData.description;
    }

    console.log(`Updating expense ${expenseId} for holiday ${holidayId} by user: ${auth.userId}`);
    console.log("Expense data received by API:", JSON.stringify(expenseData, null, 2));
    
    // Update expense using the service, passing userId for authorization check
    const updatedExpense = await holidayService.updateExpense(holidayId, expenseId, expenseData, auth.userId);
    
    console.log("Updated expense:", JSON.stringify(updatedExpense, null, 2));
    
    // Return the updated expense
    return NextResponse.json(updatedExpense, { status: 200 });

  } catch (error) {
    console.error(`Error updating expense ${expenseId} for holiday ${holidayId}:`, error);
    // Check for specific errors like "Holiday not found for this user"
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { error: 'Failed to update expense', details: error.message },
      { status: status }
    );
  }
}

// DELETE /api/holidays/[holidayId]/expenses/[expenseId]
export async function DELETE(request, { params }) {
  const { holidayId, expenseId } = params;
  
  try {
    // Authenticate user
    const auth = await getAuthenticatedUserId(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    console.log(`Deleting expense ${expenseId} from holiday ${holidayId} by user: ${auth.userId}`);
    
    // Delete expense using the service, passing userId for authorization check
    const result = await holidayService.removeExpense(holidayId, expenseId, auth.userId);
    
    console.log("Delete result:", JSON.stringify(result, null, 2));
    
    // Return success
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting expense ${expenseId} from holiday ${holidayId}:`, error);
    // Check for specific errors
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { error: 'Failed to delete expense', details: error.message },
      { status: status }
    );
  }
} 