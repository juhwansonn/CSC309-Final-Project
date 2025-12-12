import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // If the user is not logged in, do not render the navbar
    if (!user) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper to check roles (assuming hierarchical: superuser > manager > cashier > regular)
    const role = (user.role || '').toLowerCase();
    const isManager = role === 'manager' || role === 'superuser';
    const isCashier = role === 'cashier' || isManager;

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <div style={styles.brand}>
                    <Link to="/profile" style={styles.brandLink}>CSSU Rewards</Link>
                </div>

                <div style={styles.links}>
                    {/* Common Links (Everyone) */}
                    <Link to="/profile" style={styles.link}>Profile</Link>
                    <Link to="/events" style={styles.link}>Events</Link>
                    <Link to="/promotions" style={styles.link}>Promotions</Link>

                    {/* Regular User Actions */}
                    <Link to="/transactions" style={styles.link}>History</Link>
                    <Link to="/transfer" style={styles.link}>Transfer</Link>
                    <Link to="/redeem" style={styles.link}>Redeem</Link>

                    {/* Manager / Cashier Links */}
                    {isCashier && (
                        <div style={styles.separator}>
                            <span style={{ color: '#aaa' }}>|</span>
                            <Link to="/cashier" style={styles.link}>Charge</Link> 
                            
                            <Link to="/redeem/process" style={styles.link}>Process</Link>
                        </div>
                    )}

                    {isManager && (
                        <div style={styles.separator}>
                            <Link to="/users" style={styles.link}>Users</Link>
                        </div>
                    )}
                </div>

                <div style={styles.auth}>
                    <span style={{ marginRight: '15px', fontWeight: 'bold' }}>
                        @{user.utorid}
                    </span>
                    <button onClick={handleLogout} style={styles.button}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

// Simple inline styles
const styles = {
    nav: {
        backgroundColor: '#333',
        color: '#fff',
        padding: '10px 20px',
        marginBottom: '20px',
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    brand: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
    },
    brandLink: {
        color: '#fff',
        textDecoration: 'none',
    },
    links: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
    },
    link: {
        color: '#ccc',
        textDecoration: 'none',
        fontSize: '0.95rem',
    },
    separator: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
    },
    auth: {
        display: 'flex',
        alignItems: 'center',
    },
    button: {
        padding: '5px 10px',
        cursor: 'pointer',
        backgroundColor: '#d9534f',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
    }
};

export default Navbar;