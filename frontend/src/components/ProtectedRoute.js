import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole = 'regular' }) => {
  const { user, token, loading } = useAuth(); 

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const ROLE_RANKS = { regular: 0, cashier: 1, manager: 2, superuser: 3 };
  
  const userRole = user.role ? user.role.toLowerCase() : 'regular';

  const userRank = ROLE_RANKS[userRole] || 0;
  const requiredRank = ROLE_RANKS[requiredRole] || 0;
  
  if (userRank < requiredRank) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;