import { NextResponse } from 'next/server';
import * as holidayService from '@/app/services/holidayService';

// POST /api/holidays/[id]/expenses
export async function POST(request, { params }) {
  // Extract and store id at the beginning
  const id = params.id;
  
  try {
    const expenseData = await request.json();
    const expense = await holidayService.addExpense(id, expenseData);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error(`Error adding expense to holiday ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to add expense', details: error.message },
      { status: 500 }
    );
  }
} 