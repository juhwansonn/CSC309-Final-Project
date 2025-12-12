import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';

const LoginPage = () => {
  const [utorid, setUtorid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated (token exists), redirect to dashboard
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/tokens`, {
        utorid,
        password,
      });

      const { token: jwtToken } = response.data;
  
      const userResponse = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const userRole = userResponse.data.role;

      login(jwtToken, userRole); 

      // Redirect to the dashboard/root page
      navigate('/'); 

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Check UTORid and password.');
    }
  };

  return (
    // Applied styles for centering and padding
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.header}>ScoreCart Loyalty Program</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="UTORid"
            value={utorid}
            onChange={(e) => setUtorid(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Log In</button>
        </form>
        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.footerLink}>
          <button onClick={() => navigate('/reset-password')} style={styles.resetButton}>
              Forgot Password?
          </button>
        </p>
      </div>
    </div>
  );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh', // Ensures centering vertically in the viewport
        backgroundColor: '#f4f4f9',
    },
    loginBox: {
        width: '100%',
        maxWidth: '380px',
        padding: '30px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        backgroundColor: '#fff',
        textAlign: 'center',
    },
    header: {
        marginBottom: '25px',
        color: '#333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    input: {
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
    },
    button: {
        padding: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
    },
    error: {
        color: '#dc3545',
        marginTop: '15px',
        fontWeight: 'bold',
    },
    footerLink: {
        marginTop: '20px',
    },
    resetButton: {
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        fontSize: '14px',
        padding: 0,
    }
};

export default LoginPage;