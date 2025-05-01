import { connectToDatabase } from '@/app/lib/mongoose';
import Holiday from '@/app/models/HolidayModel';

// Connect to the database before any operations
async function ensureConnection() {
  await connectToDatabase();
}

// Get all holidays (admin only)
export async function getAllHolidays() {
  await ensureConnection();
  return await Holiday.find().sort({ createdAt: -1 });
}

// Get holidays by user ID
export async function getHolidaysByUserId(userId) {
  await ensureConnection();
  return await Holiday.find({ userId }).sort({ createdAt: -1 });
}

// Get a holiday by ID
export async function getHolidayById(id, userId = null) {
  await ensureConnection();
  
  const query = { _id: id };
  
  // If userId is provided, ensure we only get holidays owned by this user
  if (userId) {
    query.userId = userId;
  }
  
  return await Holiday.findOne(query);
}

// Create a new holiday
export async function createHoliday(holidayData) {
  await ensureConnection();
  
  const holiday = new Holiday(holidayData);
  await holiday.save();
  return holiday;
}

// Update a holiday
export async function updateHoliday(id, holidayData, userId = null) {
  await ensureConnection();
  
  const query = { _id: id };
  
  // If userId is provided, ensure we only update holidays owned by this user
  if (userId) {
    query.userId = userId;
  }
  
  // Prevent changing the userId during update
  if (holidayData.userId) {
    delete holidayData.userId;
  }
  
  // Debug logging
  console.log('Holiday update input data:', JSON.stringify(holidayData, null, 2));
  
  // Use $set operator for updates
  const updateOperation = {
    $set: {}
  };
  
  // Add all fields except budget to updateOperation
  Object.keys(holidayData).forEach(key => {
    if (key !== 'budget') {
      updateOperation.$set[key] = holidayData[key];
    }
  });
  
  // Handle budget separately if it exists
  if (holidayData.budget) {
    // Format budget amount as number
    const budgetAmount = typeof holidayData.budget.amount === 'string' 
      ? Number(holidayData.budget.amount) || 0 
      : holidayData.budget.amount || 0;
      
    // Set budget fields properly
    updateOperation.$set['budget'] = {
      amount: budgetAmount,
      currency: holidayData.budget.currency || 'USD'
    };
  }
  
  console.log('Holiday update operation:', JSON.stringify(updateOperation, null, 2));
  
  const options = { new: true, runValidators: true }; // Return updated document
  const updatedHoliday = await Holiday.findOneAndUpdate(query, updateOperation, options);
  
  if (!updatedHoliday) {
    throw new Error(`Holiday with ID ${id} not found${userId ? ' for this user' : ''}`);
  }
  
  return updatedHoliday;
}

// Delete a holiday
export async function deleteHoliday(id, userId = null) {
  await ensureConnection();
  
  const query = { _id: id };
  
  // If userId is provided, ensure we only delete holidays owned by this user
  if (userId) {
    query.userId = userId;
  }
  
  const result = await Holiday.deleteOne(query);
  return result;
}

// Add an expense to a holiday
export async function addExpense(holidayId, expense, userId = null) {
  await ensureConnection();
  
  const query = { _id: holidayId };
  
  // If userId is provided, ensure we only update holidays owned by this user
  if (userId) {
    query.userId = userId;
  }
  
  // Ensure date is a proper Date object
  if (expense.date) {
    expense.date = new Date(expense.date);
  } else {
    expense.date = new Date();
  }
  
  const options = { new: true, runValidators: true }; // Return updated document
  const holiday = await Holiday.findOneAndUpdate(
    query,
    { $push: { expenses: expense } },
    options
  );
  
  if (!holiday) {
    throw new Error(`Holiday with ID ${holidayId} not found${userId ? ' for this user' : ''}`);
  }
  
  // Return the newly added expense
  return holiday.expenses[holiday.expenses.length - 1];
}

// Remove an expense from a holiday
export async function removeExpense(holidayId, expenseId, userId = null) {
  await ensureConnection();
  
  const query = { _id: holidayId };
  
  // If userId is provided, ensure we only update holidays owned by this user
  if (userId) {
    query.userId = userId;
  }
  
  const result = await Holiday.updateOne(
    query,
    { $pull: { expenses: { _id: expenseId } } }
  );
  
  return result;
} 