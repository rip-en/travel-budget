'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Helper component for Delete Button
function DeleteUserButton({ userId, currentAdminId, userName, onUserDeleted }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        // Prevent admin from deleting themselves via this button
        if (userId === currentAdminId) {
            alert("You cannot delete your own account from the admin panel. Use the account settings page.");
            return;
        }
        
        if (!window.confirm(`Are you sure you want to delete user ${userName} (${userId})? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        setError(null);
        try {
            const response = await fetch(`/api/user/${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to delete user (status: ${response.status})`);
            }
            // Call the callback to refresh the user list
            onUserDeleted(userId);
            alert(`User ${userName} deleted successfully.`);
        } catch (e) {
            console.error("Failed to delete user:", e);
            setError(e.message || "Could not delete user.");
            alert(`Error: ${e.message || "Could not delete user."}`); // Simple alert for now
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting || userId === currentAdminId} // Disable if deleting or if it's the admin's own account
            className={`px-3 py-1 text-sm rounded transition-colors 
                ${userId === currentAdminId 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : isDeleting 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'}
                disabled:opacity-50 disabled:cursor-wait`}
        >
            {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
    );
}

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [currentAdminId, setCurrentAdminId] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [statsError, setStatsError] = useState(null);
    const [usersError, setUsersError] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        setStatsError(null);
        try {
            const response = await fetch('/api/admin/stats');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setStats(data);
        } catch (e) {
            console.error("Failed to fetch admin stats:", e);
            setStatsError(e.message || "An unknown error occurred fetching stats");
        } finally {
            setLoadingStats(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        setUsersError(null);
        try {
            const response = await fetch('/api/admin/users');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data.users || []);
            setCurrentAdminId(data.requesterId || null); // Store the current admin ID
        } catch (e) {
            console.error("Failed to fetch users:", e);
            setUsersError(e.message || "An unknown error occurred fetching users");
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, [fetchStats, fetchUsers]);

    const handleUserDeleted = (deletedUserId) => {
        setUsers(currentUsers => currentUsers.filter(user => user._id !== deletedUserId));
        // Optionally, refresh stats as well if user count changes
        fetchStats(); 
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Stats Section */}
            <h2 className="text-2xl font-semibold mb-4">Site Statistics</h2>
            {loadingStats && <p>Loading stats...</p>}
            {statsError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Stats Error:</strong>
                    <span className="block sm:inline"> {statsError}</span>
                </div>
            )}
            {stats && !statsError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {/* Stat cards */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Users</h3>
                        <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Holidays</h3>
                        <p className="text-4xl font-bold text-gray-900">{stats.totalHolidays}</p>
                    </div>
                </div>
            )}

            {/* User Management Section */}
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>
            {loadingUsers && <p>Loading users...</p>}
            {usersError && (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">User Loading Error:</strong>
                    <span className="block sm:inline"> {usersError}</span>
                </div>
            )}
            {!loadingUsers && !usersError && (
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Is Admin</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.isAdmin ? 'Yes' : 'No'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{user._id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <DeleteUserButton 
                                            userId={user._id} 
                                            currentAdminId={currentAdminId} 
                                            userName={user.name} 
                                            onUserDeleted={handleUserDeleted} 
                                        />
                                        {/* Add other actions like 'Edit' or 'View Details' here */} 
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard; 