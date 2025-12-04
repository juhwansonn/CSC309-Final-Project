import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';

const AllUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const { user } = useAuth(); // Get current user (token)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // We use the token to prove we are an admin
                const response = await axios.get(`${API_BASE_URL}/users`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setUsers(response.data.results);
            } catch (err) {
                setError('Failed to fetch users. Are you a manager?');
                console.error(err);
            }
        };

        fetchUsers();
    }, [user]);

    return (
        <div>
            <h2>All Users (Manager View)</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <ul>
                {users.map((u) => (
                    <li key={u.id}>
                        {u.name} (@{u.utorid}) - Role: <strong>{u.role}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AllUsersPage;