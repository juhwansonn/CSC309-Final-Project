import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole = 'regular' }) => {
  // 1. Destructure 'token' from the context
  const { user, token, loading } = useAuth(); 

  if (loading) {
    return <div>Loading...</div>;
  }

  // 2. Check 'token' directly (not user.token)
  //    Also check if 'user' exists, just to be safe
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const ROLE_RANKS = { regular: 0, cashier: 1, manager: 2, superuser: 3 };
  
  // Safety check: ensure user.role exists (it might be null briefly)
  const userRole = user.role ? user.role.toLowerCase() : 'regular';

  const userRank = ROLE_RANKS[userRole] || 0;
  const requiredRank = ROLE_RANKS[requiredRole] || 0;
  
  if (userRank < requiredRank) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;