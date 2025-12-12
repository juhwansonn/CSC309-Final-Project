import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const AuthContext = createContext(null);

const ROLE_RANKS = { regular: 0, cashier: 1, manager: 2, superuser: 3 };

const getAvailableRoles = (primaryRole) => {
    const primaryRank = ROLE_RANKS[primaryRole.toLowerCase()] || 0;
    return Object.keys(ROLE_RANKS).filter(role => ROLE_RANKS[role] <= primaryRank);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [loading, setLoading] = useState(true);
  
  const [currentRole, setCurrentRole] = useState(null);
  const [allAvailableRoles, setAllAvailableRoles] = useState([]);

  const login = (jwtToken, userRole) => {
    localStorage.setItem('jwt_token', jwtToken);
    setToken(jwtToken);
    setUser({ role: userRole }); 
    
    const lowerRole = userRole.toLowerCase();
    setCurrentRole(lowerRole);
    setAllAvailableRoles(getAvailableRoles(lowerRole));
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    setCurrentRole(null);
    setAllAvailableRoles([]);
  };

  const switchRole = (newRole) => {
    if (allAvailableRoles.includes(newRole)) {
      setCurrentRole(newRole);
    } else {
      console.error(`Attempted to switch to unauthorized role: ${newRole}`);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = response.data;
        const primaryRole = userData.role.toLowerCase();

        setUser(userData);
        
        setAllAvailableRoles(getAvailableRoles(primaryRole));
        
        setCurrentRole(prevRole => prevRole || primaryRole); 
        
      } catch (error) {
        console.error("Token invalid or expired. Logging out.");
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ 
        user, 
        token, 
        login, 
        logout, 
        loading, 
        currentRole, 
        allAvailableRoles, 
        switchRole, 
        ROLE_RANKS 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);