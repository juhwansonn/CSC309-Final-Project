import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user, token, currentRole, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Helper to determine the dashboard greeting based on role
    const getGreeting = () => {
        if (!user) return 'Welcome!';
        const role = currentRole || user.role;
        switch(role) {
            case 'superuser':
            case 'manager':
                return `Welcome, ${user.name} (Manager View)`;
            case 'cashier':
                return `Welcome, ${user.name} (Cashier View)`;
            default:
                return `Welcome back, ${user.name}`;
        }
    };
    
    // Logic for Transaction Display (reused from TransactionsPage)
    const formatTransaction = (tx) => {
        let details = tx.remark || '—';
        let typeLabel = tx.type;
        let typeColor = '#333';
        let displayAmount = tx.amount;

        if (tx.type === 'redemption') {
            displayAmount = -Math.abs(tx.amount);
        }
        if (tx.type === 'transfer') {
            if (tx.amount < 0) {
                typeLabel = "Sent";
                typeColor = '#d9534f'; // Red
                details = `To: @${tx.relatedUserUtorid || 'Unknown'}`;
            } else {
                typeLabel = "Received";
                typeColor = '#28a745'; // Green
                details = `From: @${tx.relatedUserUtorid || 'Unknown'}`;
            }
        } else if (tx.type === 'purchase') {
            typeColor = '#007bff'; // Blue
        } else if (tx.type === 'redemption') {
            typeColor = '#fd7e14'; // Orange
        }

        const amountColor = displayAmount >= 0 ? 'green' : 'red';
        const sign = displayAmount > 0 ? '+' : '';

        return { typeLabel, typeColor, details, displayAmount: `${sign}${displayAmount}`, amountColor };
    };


    useEffect(() => {
        const fetchRecentTransactions = async () => {
            if (!token || authLoading) return;
            
            try {
                // Fetch only 5 most recent transactions
                const response = await axios.get(`${API_BASE_URL}/users/me/transactions`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        limit: 5,
                        orderBy: 'newest'
                    }
                });
                setRecentTransactions(response.data.results);
            } catch (err) {
                setError('Failed to fetch recent activity.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecentTransactions();
    }, [token, authLoading]);

    if (authLoading || loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Dashboard...</div>;
    }
    
    // Fallback if auth is still broken (shouldn't happen with ProtectedRoute)
    if (!user) return navigate('/login');

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            
            {/* --- TOP SECTION: BALANCE & ACTIONS --- */}
            <div style={styles.header}>
                <h2 style={styles.greeting}>{getGreeting()}</h2>
                
                <div style={styles.balanceBox}>
                    <p style={styles.balanceText}>Your Current Balance:</p>
                    <h1 style={styles.points}>{user.points} Points</h1>
                </div>

                <div style={styles.actionGrid}>
                    <button onClick={() => navigate('/transfer')} style={{...styles.actionBtn, backgroundColor: '#007bff'}}>Transfer Points</button>
                    <button onClick={() => navigate('/redeem')} style={{...styles.actionBtn, backgroundColor: '#fd7e14'}}>Redeem Points</button>
                    <button onClick={() => navigate('/profile')} style={{...styles.actionBtn, backgroundColor: '#6c757d'}}>Edit Profile</button>
                </div>
            </div>

            {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
            
            {/* --- BOTTOM SECTION: RECENT ACTIVITY --- */}
            <div style={{ marginTop: '40px' }}>
                <h3 style={styles.activityHeader}>Recent Activity</h3>
                
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((tx) => {
                            const data = formatTransaction(tx);
                            return (
                                <li key={tx.id} style={styles.txItem}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ color: data.typeColor, fontWeight: 'bold' }}>{data.typeLabel}</span>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#555' }}>{data.details}</p>
                                    </div>
                                    <span style={{ color: data.amountColor, fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        {data.displayAmount}
                                    </span>
                                </li>
                            );
                        })
                    ) : (
                        <p style={{ textAlign: 'center', color: '#666' }}>No recent activity found. Go earn some points!</p>
                    )}
                </ul>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={() => navigate('/transactions')} style={styles.historyBtn}>
                        View Full History →
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    header: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        textAlign: 'center'
    },
    greeting: {
        margin: '0 0 10px 0',
        fontSize: '1.2rem',
        color: '#6c757d'
    },
    balanceBox: {
        marginBottom: '20px'
    },
    balanceText: {
        margin: 0,
        fontSize: '1.0rem',
        color: '#333'
    },
    points: {
        margin: '5px 0',
        fontSize: '2.5rem',
        color: '#28a745'
    },
    actionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px'
    },
    actionBtn: {
        padding: '10px',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.9rem'
    },
    activityHeader: {
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px',
        marginBottom: '15px'
    },
    txItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #eee'
    },
    historyBtn: {
        padding: '8px 15px',
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default DashboardPage;