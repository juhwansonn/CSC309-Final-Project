// File: src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [loading, setLoading] = useState(true);

  // Function to handle login success
  const login = (jwtToken, userRole) => {
    localStorage.setItem('jwt_token', jwtToken);
    setToken(jwtToken);
    // You'll fetch the full user object later, but set the role right away if possible
    setUser({ role: userRole }); 
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
  };

  // Effect to verify token and fetch user details on load
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Use the token to fetch user details (GET /users/me)
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Save the full user object, including their role
        setUser(response.data);
      } catch (error) {
        // If token is invalid or expired, log out the user
        console.error("Token invalid or expired. Logging out.");
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);