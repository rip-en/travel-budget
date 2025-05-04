import { connectToDatabase } from './mongoose';
import User from '../models/User'; // Adjust the path based on your structure
import jwt from 'jsonwebtoken'; // Add jwt import

/**
 * Checks if a user is an administrator.
 * @param {string} userId - The ID of the user to check.
 * @returns {Promise<boolean>} - True if the user is an admin, false otherwise.
 */
export async function isAdmin(userId) {
  if (!userId) {
    return false;
  }
  try {
    await connectToDatabase();
    const user = await User.findById(userId).select('isAdmin').lean();
    return user?.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false; // Fail safely
  }
}

// REMOVE getAuthenticatedUserId function as it's no longer used
/*
export async function getAuthenticatedUserId(request) {
  // ... function code ...
}
*/ 