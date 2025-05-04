import { connectToDatabase } from '../lib/mongoose'; // Adjust path as needed
import User from '../models/User'; // Correct path to User model
import Holiday from '../models/HolidayModel'; // Assuming HolidayModel is correct Mongoose model
import mongoose from 'mongoose';

async function ensureConnection() {
  await connectToDatabase();
}

/**
 * Deletes a user and all their associated holidays.
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<{userDeleted: boolean, holidaysDeletedCount: number}>} - Result object.
 */
export async function deleteUserById(userId) {
  await ensureConnection();
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
  }

  // Use a transaction for atomicity (optional but recommended)
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Delete user
    const userDeletionResult = await User.findByIdAndDelete(userId, { session });
    
    if (!userDeletionResult) {
        await session.abortTransaction();
        session.endSession();
        // Consider throwing a specific "User not found" error if preferred
        console.warn(`User with ID ${userId} not found for deletion.`);
        return { userDeleted: false, holidaysDeletedCount: 0 }; 
    }

    // Delete associated holidays
    const holidayDeletionResult = await Holiday.deleteMany({ userId: userId }, { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    console.log(`Deleted user ${userId} and ${holidayDeletionResult.deletedCount} holidays.`);
    
    return {
        userDeleted: true,
        holidaysDeletedCount: holidayDeletionResult.deletedCount
    };

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error(`Error deleting user ${userId}:`, error);
    throw error; // Re-throw the error to be handled by the API route
  }
} 