import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole = 'regular' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading state while fetching user data
    return <div>Loading...</div>;
  }

  if (!user || !user.token) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" replace />;
  }

  // Define role clearance based on backend logic (regular=0, cashier=1, manager=2, superuser=3)
  const ROLE_RANKS = { regular: 0, cashier: 1, manager: 2, superuser: 3 };
  const userRank = ROLE_RANKS[user.role] || 0;
  const requiredRank = ROLE_RANKS[requiredRole] || 0;
  
  // Check if the user's role meets the minimum required level
  if (userRank < requiredRank) {
    // Redirect users with insufficient access
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render the child route
  return <Outlet />;
};

export default ProtectedRoute;