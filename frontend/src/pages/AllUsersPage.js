import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';

const AllUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const { token, user: currentUser } = useAuth();
    const navigate = useNavigate();

    // State for Filters & Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name'); // Default sort by name

    // 1. ROBUST FETCH FUNCTION
    const fetchUsers = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { 
                    page: page, 
                    limit: 10,
                    search: searchTerm,
                    sort: sortBy
                }
            });

            // Handle different data structures safely
            let usersArray = [];
            if (res.data.users && Array.isArray(res.data.users)) {
                usersArray = res.data.users;
                setTotalPages(res.data.totalPages || 1);
            } else if (Array.isArray(res.data)) {
                usersArray = res.data;
            }

            setUsers(usersArray);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch users");
        }
    }, [token, page, searchTerm, sortBy]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- ACTIONS ---

    // 1. Promote Role
    const handleRoleUpdate = async (userId, newRole) => {
        if (!window.confirm(`Promote this user to ${newRole}?`)) return;
        try {
            await axios.patch(`${API_BASE_URL}/users/${userId}`, 
                { role: newRole }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Role updated!");
            fetchUsers();
        } catch (err) {
            alert("Update failed.");
        }
    };

    // 2. Verify User
    const handleVerify = async (userId) => {
        try {
            await axios.patch(`${API_BASE_URL}/users/${userId}`, 
                { isVerified: true }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers(); // Refresh UI to show checkmark
        } catch (err) {
            alert("Verification failed.");
        }
    };

    // 3. Toggle Suspicious
    const handleSuspiciousToggle = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        if (!window.confirm(`Mark this user as ${newStatus ? 'SUSPICIOUS' : 'Safe'}?`)) return;
        
        try {
            await axios.patch(`${API_BASE_URL}/users/${userId}`, 
                { isSuspicious: newStatus }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers();
        } catch (err) {
            alert("Update failed.");
        }
    };

    // Helper: Permission Check
    const canPromote = (targetRole) => {
        if (!currentUser) return false;
        if (currentUser.role === 'superuser') return true;
        if (currentUser.role === 'manager' && targetRole === 'cashier') return true;
        return false;
    };

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>User Management</h2>
                <button 
                    onClick={() => navigate('/users/new')}
                    style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    + Create User
                </button>
            </div>

            {/* --- FILTER & SORT BAR --- */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px' }}>
                <input 
                    type="text" 
                    placeholder="Search name or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px', flex: 1 }}
                />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px' }}>
                    <option value="name">Sort by Name</option>
                    <option value="email">Sort by Email</option>
                    <option value="role">Sort by Role</option>
                </select>
            </div>

            {error && <p style={{color: 'red'}}>{error}</p>}

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {Array.isArray(users) && users.map((u) => (
                    <li key={u.id || u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee', backgroundColor: u.isSuspicious ? '#fff3f3' : '#fff' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong>{u.name}</strong>
                                {u.isVerified && <span title="Verified" style={{ cursor:'default' }}>✅</span>}
                                {u.isSuspicious && <span style={{ color: 'red', fontWeight: 'bold', fontSize: '0.8rem', border: '1px solid red', padding: '2px 4px', borderRadius: '4px' }}>SUSPICIOUS</span>}
                            </div>
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>@{u.utorid}</span>
                            <br/>
                            <span style={{ fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#e2e3e5', marginTop: '5px', display: 'inline-block' }}>
                                {u.role}
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {/* Verify Button */}
                                {!u.isVerified && (
                                    <button onClick={() => handleVerify(u.id || u._id)} style={{...styles.actionBtn, backgroundColor: '#17a2b8'}}>
                                        Verify
                                    </button>
                                )}
                                
                                {/* Suspicious Toggle */}
                                <button onClick={() => handleSuspiciousToggle(u.id || u._id, u.isSuspicious)} style={{...styles.actionBtn, backgroundColor: u.isSuspicious ? '#6c757d' : '#dc3545'}}>
                                    {u.isSuspicious ? 'Unflag' : 'Flag Suspicious'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '5px' }}>
                                {u.role === 'regular' && canPromote('cashier') && (
                                    <button onClick={() => handleRoleUpdate(u.id || u._id, 'cashier')} style={styles.actionBtn}>
                                        Make Cashier
                                    </button>
                                )}
                                {u.role !== 'manager' && currentUser.role === 'superuser' && (
                                    <button onClick={() => handleRoleUpdate(u.id || u._id, 'manager')} style={styles.actionBtn}>
                                        Make Manager
                                    </button>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            )}
        </div>
    );
};

const styles = {
    actionBtn: {
        padding: '5px 10px',
        fontSize: '0.75rem',
        cursor: 'pointer',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '3px'
    }
};

export default AllUsersPage;