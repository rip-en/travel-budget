import { connectToDatabase } from '@/app/lib/mongoose';
import Holiday from '@/app/models/HolidayModel';
import mongoose from 'mongoose';

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

  // Log the data received by the service function
  console.log('Data received by createHoliday service:', JSON.stringify(holidayData, null, 2));
  
  // Ensure budget amount is null if empty string, as schema expects Number
  if (holidayData.budget && holidayData.budget.amount === '') {
    holidayData.budget.amount = null;
  }

  // Directly pass the potentially modified holidayData to the constructor
  const holiday = new Holiday(holidayData);
  
  try {
    // Log before saving
    console.log('Holiday object before save:', JSON.stringify(holiday.toObject(), null, 2)); // Use toObject() for plain object
    await holiday.save();
    // Log after saving
    console.log('Holiday object after save:', JSON.stringify(holiday.toObject(), null, 2)); // Use toObject() for plain object
    return holiday;
  } catch (error) {
    console.error("Error saving new holiday:", error);
    // Log validation errors specifically if they occur
    if (error.name === 'ValidationError') {
      console.error("Validation Errors:", error.errors);
    }
    throw error; // Re-throw the error to be handled by the API route
  }
}

// Update a holiday
export async function updateHoliday(id, holidayData, userId = null) {
  await ensureConnection();
  
  const query = { _id: id };
  
  // If userId is provided, ensure we only update holidays owned by this user
  if (userId) {
    query.userId = userId;
  }
  
  const holiday = await Holiday.findOne(query);
  
  if (!holiday) {
    throw new Error(`Holiday with ID ${id} not found${userId ? ' for this user' : ''}`);
  }

  // Update fields directly on the found document
  Object.keys(holidayData).forEach(key => {
    // Skip _id and userId, and handle budget separately if needed
    if (key !== '_id' && key !== 'userId') {
      if (key === 'budget') {
        // Ensure budget is an object and amount is a number
        const budgetAmount = typeof holidayData.budget?.amount === 'string' 
          ? Number(holidayData.budget.amount) || 0 
          : holidayData.budget?.amount || 0;
        holiday.budget = {
          amount: budgetAmount,
          currency: holidayData.budget?.currency || holiday.budget?.currency || 'USD'
        };
      } else if (key === 'isPublic') {
        holiday.isPublic = Boolean(holidayData.isPublic);
      } else if (key === 'tags') {
        // Ensure tags is an array of strings
        holiday.tags = Array.isArray(holidayData.tags) 
          ? holidayData.tags.map(tag => String(tag).trim()).filter(tag => tag) 
          : [];
      } else {
        holiday[key] = holidayData[key];
      }
    }
  });

  // Log the holiday object right before validation and saving
  console.log('Holiday object before save:', JSON.stringify(holiday, null, 2));

  // Run validators before saving
  await holiday.validate();
  
  // Save the updated document
  const updatedHoliday = await holiday.save();
  
  // Log the holiday object after saving
  console.log('Holiday object after save:', JSON.stringify(updatedHoliday, null, 2));
  
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

// --- New function for public holidays ---
export async function getPublicHolidays(options = {}) {
  await ensureConnection();
  const { searchTerm, tags, sortBy = 'createdAt_desc' } = options;

  const query = { isPublic: true };

  // Add search term query (destination or title)
  if (searchTerm) {
    const regex = new RegExp(searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\\\$&'), 'i'); // Corrected regex escape
    query.$or = [
      { title: regex },
      { destination: regex },
    ];
  }

  // Add tags query (match all provided tags)
  if (tags && tags.length > 0) {
    query.tags = { $all: tags };
  }

  // Define sort options
  let sortCriteria = {};
  const [sortField, sortDirection] = sortBy.split('_');
  const direction = sortDirection === 'asc' ? 1 : -1;

  if (sortField === 'startDate') {
    sortCriteria = { startDate: direction };
  } else if (sortField === 'title') {
    sortCriteria = { title: direction };
  } else if (sortField === 'budget') {
    sortCriteria = { 'budget.amount': direction }; // Corrected field path
  } else if (sortField === 'likeCount') { // Added sorting by likeCount
      sortCriteria = { likeCount: direction };
  } else { // Default to createdAt descending
    sortCriteria = { createdAt: -1 }; 
  }

  console.log('Public holidays query:', JSON.stringify(query));
  console.log('Public holidays sort:', JSON.stringify(sortCriteria));

  // TODO: Add pagination later if needed (limit, skip)
  const holidays = await Holiday.find(query)
    .populate('userId', 'username') // Ensure username is populated
    .sort(sortCriteria)
    .lean(); // Use lean for performance

  console.log(`Found ${holidays.length} public holidays matching query.`);
  // Optional: Log the IDs or titles of found holidays for verification
  // console.log('Found holiday IDs:', holidays.map(h => h._id));
  
  return holidays;
}
// ------------------------------------

// Add an expense to a holiday
export async function addExpense(holidayId, expenseData, userId = null) {
  await ensureConnection();
  
  console.log("holidayService.addExpense - Starting expense addition", { holidayId, userId });
  console.log("Raw expense data:", JSON.stringify(expenseData, null, 2));
  
  const query = { _id: holidayId };
  
  // If userId is provided, ensure we only update holidays owned by this user
  if (userId) {
    query.userId = userId;
  }
  
  // Ensure expense data has all required fields
  const sanitizedExpenseData = {
    // Required fields with defaults
    title: expenseData.title || expenseData.description || 'Unnamed Expense',
    amount: parseFloat(expenseData.amount || 0),
    category: expenseData.category || 'Other',
    date: expenseData.date ? new Date(expenseData.date) : new Date(),
    
    // Optional fields
    notes: expenseData.notes || '',
    url: expenseData.url || '',
    comment: expenseData.comment || ''
  };

  console.log("Processed expense data:", JSON.stringify(sanitizedExpenseData, null, 2));
  
  // First, fetch the holiday to ensure it exists and get current expenses
  const holidayToUpdate = await Holiday.findOne(query);
  
  if (!holidayToUpdate) {
    throw new Error(`Holiday with ID ${holidayId} not found${userId ? ' for this user' : ''}`);
  }
  
  // Add the new expense to the expenses array
  if (!Array.isArray(holidayToUpdate.expenses)) {
    holidayToUpdate.expenses = [];
  }
  
  holidayToUpdate.expenses.push(sanitizedExpenseData);
  
  // Save the updated holiday
  await holidayToUpdate.save();
  
  // Return the newly added expense (which is the last one in the updated array)
  const newExpense = holidayToUpdate.expenses[holidayToUpdate.expenses.length - 1];
  console.log("New expense created:", JSON.stringify(newExpense, null, 2));
  console.log("All expenses now:", JSON.stringify(holidayToUpdate.expenses, null, 2));
  
  return newExpense;
}

// Remove an expense from a holiday
export async function removeExpense(holidayId, expenseId, userId = null) {
  await ensureConnection();
  
  const query = { _id: holidayId };
  
  // If userId is provided, ensure we only update holidays owned by this user
  if (userId) {
    query.userId = userId;
  }
  
  console.log(`Attempting to remove expense ${expenseId} from holiday ${holidayId} for user ${userId}`);

  const result = await Holiday.updateOne(
    query,
    { $pull: { expenses: { _id: expenseId } } }
  );

  console.log('Remove expense result:', result);

  // Check if the holiday was found
  if (result.matchedCount === 0) {
    // Use template literal correctly
    throw new Error(`Holiday with ID ${holidayId} not found${userId ? ' for this user' : ''}.`); 
  }
  
  // Check if an expense was actually removed
  if (result.modifiedCount === 0) {
    // This could mean the expenseId didn't exist, or user lacked permission if userId was in query
    console.warn(`Expense with ID ${expenseId} not found within holiday ${holidayId}, or deletion wasn't needed.`);
    // Use template literal correctly
    throw new Error(`Expense with ID ${expenseId} not found within holiday ${holidayId}.`);
  }
  
  // Return the result object from MongoDB which contains counts
  return { success: true, ...result }; // Indicate success explicitly
}

// Update an expense on a holiday
export async function updateExpense(holidayId, expenseId, expenseData, userId = null) {
  await ensureConnection();
  
  console.log(`holidayService.updateExpense - Starting expense update for ${expenseId} in holiday ${holidayId}`);
  console.log("Raw expense update data:", JSON.stringify(expenseData, null, 2));
  
  const query = { _id: holidayId };
  
  // If userId is provided, ensure we only update holidays owned by this user
  if (userId) {
    query.userId = userId;
  }
  
  // First, find the holiday to make sure it exists and user has access
  const holidayToUpdate = await Holiday.findOne(query);
  
  if (!holidayToUpdate) {
    throw new Error(`Holiday with ID ${holidayId} not found${userId ? ' for this user' : ''}`);
  }
  
  // Find the expense to update
  const existingExpenseIndex = holidayToUpdate.expenses.findIndex(
    exp => exp._id.toString() === expenseId
  );
  
  if (existingExpenseIndex === -1) {
    throw new Error(`Expense with ID ${expenseId} not found in holiday ${holidayId}`);
  }
  
  // Ensure expense data has all required fields
  const sanitizedExpenseData = {
    // Required fields with defaults - preserve existing values if not provided
    title: expenseData.title || holidayToUpdate.expenses[existingExpenseIndex].title,
    amount: parseFloat(expenseData.amount || holidayToUpdate.expenses[existingExpenseIndex].amount),
    category: expenseData.category || holidayToUpdate.expenses[existingExpenseIndex].category,
    date: expenseData.date ? new Date(expenseData.date) : holidayToUpdate.expenses[existingExpenseIndex].date,
    
    // Optional fields
    notes: expenseData.notes || holidayToUpdate.expenses[existingExpenseIndex].notes || '',
    url: expenseData.url || holidayToUpdate.expenses[existingExpenseIndex].url || '',
    comment: expenseData.comment || holidayToUpdate.expenses[existingExpenseIndex].comment || ''
  };
  
  console.log("Processed expense update data:", JSON.stringify(sanitizedExpenseData, null, 2));
  
  // Update the expense in the array
  holidayToUpdate.expenses[existingExpenseIndex] = {
    ...holidayToUpdate.expenses[existingExpenseIndex].toObject(), // Preserve the _id
    ...sanitizedExpenseData
  };
  
  // Save the updated holiday
  await holidayToUpdate.save();
  
  // Return the updated expense
  const updatedExpense = holidayToUpdate.expenses[existingExpenseIndex];
  console.log("Updated expense:", JSON.stringify(updatedExpense, null, 2));
  
  return updatedExpense;
}

// --- Like/Unlike Logic ---

export async function likeHoliday(holidayId, userId) {
  await ensureConnection();
  
  // Use Promise.all to update both Holiday and User concurrently
  const [holidayUpdateResult, userUpdateResult] = await Promise.all([
    // Update Holiday: Add userId to likes, increment likeCount
    Holiday.updateOne(
      { _id: holidayId, likes: { $ne: userId } }, // Only update if user hasn't liked it yet
      { 
        $addToSet: { likes: userId }, // Use $addToSet to prevent duplicates
        $inc: { likeCount: 1 } 
      }
    ),
    // Update User: Add holidayId to likedHolidays
    mongoose.model('User').updateOne(
      { _id: userId }, 
      { $addToSet: { likedHolidays: holidayId } }
    )
  ]);

  // Check if the holiday was found and updated (modifiedCount > 0)
  if (holidayUpdateResult.matchedCount === 0) {
    throw new Error(`Holiday with ID ${holidayId} not found.`);
  }
  if (holidayUpdateResult.modifiedCount === 0) {
    console.log(`User ${userId} already liked holiday ${holidayId} or holiday not found.`);
    // Don't throw error, maybe return specific status or the fact it wasn't modified
    return { alreadyLiked: true };
  }

  return { success: true };
}

export async function unlikeHoliday(holidayId, userId) {
  await ensureConnection();
  
  const [holidayUpdateResult, userUpdateResult] = await Promise.all([
    // Update Holiday: Remove userId from likes, decrement likeCount
    Holiday.updateOne(
      { _id: holidayId, likes: userId }, // Only update if user has liked it
      { 
        $pull: { likes: userId }, 
        $inc: { likeCount: -1 } 
      }
    ),
    // Update User: Remove holidayId from likedHolidays
    mongoose.model('User').updateOne(
      { _id: userId }, 
      { $pull: { likedHolidays: holidayId } }
    )
  ]);

  // Check if the holiday was found and updated
  if (holidayUpdateResult.matchedCount === 0) {
    throw new Error(`Holiday with ID ${holidayId} not found or user hasn't liked it.`);
  }
  if (holidayUpdateResult.modifiedCount === 0) {
    // Should ideally not happen if matchedCount > 0, but good practice
    console.log(`Unlike operation did not modify holiday ${holidayId} for user ${userId}.`);
    return { notModified: true }; 
  }

  return { success: true };
}

// ------------------------- 