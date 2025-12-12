// frontend/src/pages/PromotionsPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PromotionsPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [error, setError] = useState('');
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const canCreate = user && (user.role === 'manager' || user.role === 'superuser');

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/promotions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPromotions(response.data.results);
            } catch (err) {
                setError('Failed to fetch promotions.');
                console.error(err);
            }
        };
        fetchPromotions();
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this promotion?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/promotions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPromotions(promotions.filter(p => p.id !== id));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Active Promotions</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {isManager && (
                <button onClick={() => navigate('/promotions/new')} style={{ marginBottom: '20px', padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    + Create New Promotion
                </button>
            )}

            <div style={{ display: 'grid', gap: '20px' }}>
                {promotions.map((promo) => (
                    <div key={promo.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{margin: '0 0 5px 0'}}>{promo.name} <span style={{fontSize: '0.8em', color: '#666'}}>({promo.type})</span></h3>
                            <p style={{margin: '5px 0'}}>{promo.description}</p>
                            <p style={{margin: '5px 0', fontSize: '0.9rem', color: '#555'}}><strong>Valid until:</strong> {new Date(promo.endTime).toLocaleDateString()}</p>
                            
                            <div style={{marginTop: '10px', fontSize: '0.9rem'}}>
                                {promo.minSpending > 0 && <span style={{marginRight: '15px', padding: '3px 8px', background: '#e9ecef', borderRadius: '4px'}}>Min Spend: ${promo.minSpending}</span>}
                                {promo.rate > 0 && <span style={{marginRight: '15px', padding: '3px 8px', background: '#d1ecf1', color: '#0c5460', borderRadius: '4px'}}>Rate: {promo.rate}x</span>}
                                {promo.points > 0 && <span style={{padding: '3px 8px', background: '#d4edda', color: '#155724', borderRadius: '4px'}}>Bonus: +{promo.points}</span>}
                            </div>
                        </div>

                        {/* Delete Button */}
                        {isManager && (
                            <button 
                                onClick={() => handleDelete(promo.id)}
                                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: '15px' }}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}
                {promotions.length === 0 && <p>No active promotions found.</p>}
            </div>
        </div>
    );
};

export default PromotionsPage;