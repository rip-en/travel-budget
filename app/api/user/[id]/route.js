import { NextResponse } from 'next/server';
import { deleteUserById } from '../../../services/userService'; // Adjust path as needed
import { getAuthenticatedUserId, isAdmin } from '../../../lib/authUtils'; // Import both from authUtils
import mongoose from 'mongoose';

// Potential Improvement: Move getAuthenticatedUserId to authUtils.js to avoid cross-route imports

export async function DELETE(request, { params }) {
  const targetUserId = params.id;

  // 1. Authenticate the requesting user
  const auth = await getAuthenticatedUserId(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const requesterUserId = auth.userId;

  // 2. Check if the requesting user is an admin
  const isRequesterAdmin = await isAdmin(requesterUserId);
  if (!isRequesterAdmin) {
    return NextResponse.json({ error: 'Forbidden: Requires admin privileges' }, { status: 403 });
  }

  // 3. Validate target user ID format
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ error: 'Invalid target user ID format' }, { status: 400 });
  }

  // 4. Prevent admin from deleting themselves via this route (optional)
  if (requesterUserId === targetUserId) {
      return NextResponse.json({ error: 'Admins cannot delete themselves through this endpoint. Use /api/user/me instead.' }, { status: 400 });
  }

  try {
    console.log(`Admin ${requesterUserId} attempting to delete user: ${targetUserId}`);
    
    const result = await deleteUserById(targetUserId);

    if (!result.userDeleted) {
      return NextResponse.json({ error: 'Target user not found for deletion' }, { status: 404 });
    }

    console.log(`Admin ${requesterUserId} successfully deleted user: ${targetUserId}`);
    return NextResponse.json(
        { message: `User ${targetUserId} deleted successfully` }, 
        { status: 200 }
    );

  } catch (error) {
    console.error(`Admin ${requesterUserId} failed to delete user ${targetUserId}:`, error);
    // Check if it's a known error type, e.g., from deleteUserById throwing
    // Or return a generic error
    return NextResponse.json({ error: 'Internal server error during user deletion' }, { status: 500 });
  }
} 