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

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortOrder, setSortOrder] = useState('ending_soon'); 
    const LIMIT = 5;

    const isManager = user && (user.role === 'manager' || user.role === 'superuser');

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/promotions`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { 
                        page: page,
                        limit: LIMIT,
                        orderBy: sortOrder 
                    }
                });
                setPromotions(response.data.results);
                
                const totalCount = response.data.count;
                setTotalPages(Math.ceil(totalCount / LIMIT));

            } catch (err) {
                setError('Failed to fetch promotions.');
                console.error(err);
            }
        };
        fetchPromotions();
    }, [token, page, sortOrder]);

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Active Promotions</h2>
                {isManager && (
                    <button onClick={() => navigate('/promotions/new')} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        + New Promotion
                    </button>
                )}
            </div>

            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: 'bold' }}>Sort By:</label>
                <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="ending_soon">Ending Soon</option>
                    <option value="rate">Highest Rate</option>
                    <option value="points">Highest Bonus Points</option>
                    <option value="min_spend">Lowest Min Spend</option>
                </select>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ display: 'grid', gap: '20px' }}>
                {promotions.map((promo) => (
                    <div key={promo.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{margin: '0 0 5px 0'}}>
                                <span style={{ color: '#007bff', marginRight: '8px' }}>#{promo.id}</span>
                                {promo.name} 
                                <span style={{fontSize: '0.8em', color: '#666', marginLeft: '8px'}}>({promo.type})</span>
                            </h3>

                            <p style={{margin: '5px 0'}}>{promo.description}</p>
                            <p style={{margin: '5px 0', fontSize: '0.9rem', color: '#555'}}><strong>Valid until:</strong> {new Date(promo.endTime).toLocaleDateString()}</p>
                            
                            <div style={{marginTop: '10px', fontSize: '0.9rem'}}>
                                {promo.minSpending > 0 && <span style={{marginRight: '15px', padding: '3px 8px', background: '#e9ecef', borderRadius: '4px'}}>Min Spend: ${promo.minSpending}</span>}
                                {promo.rate > 0 && <span style={{marginRight: '15px', padding: '3px 8px', background: '#d1ecf1', color: '#0c5460', borderRadius: '4px'}}>Rate: {promo.rate}x</span>}
                                {promo.points > 0 && <span style={{padding: '3px 8px', background: '#d4edda', color: '#155724', borderRadius: '4px'}}>Bonus: +{promo.points}</span>}
                            </div>
                        </div>

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
                {promotions.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No active promotions found.</p>}
            </div>

            {totalPages > 1 && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                    <button 
                        disabled={page <= 1} 
                        onClick={() => setPage(p => p - 1)}
                        style={{ padding: '8px 16px', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Previous
                    </button>
                    
                    <span style={{ fontWeight: 'bold' }}>
                        Page {page} of {totalPages}
                    </span>
                    
                    <button 
                        disabled={page >= totalPages} 
                        onClick={() => setPage(p => p + 1)}
                        style={{ padding: '8px 16px', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default PromotionsPage;