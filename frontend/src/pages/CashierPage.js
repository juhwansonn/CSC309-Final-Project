import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';

const CashierPage = () => {
    const { token } = useAuth();
    
    // Form State
    const [formData, setFormData] = useState({
        utorid: '',
        spent: '',
        promotionIds: '' // Comma separated IDs (e.g. "1, 2")
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            // Prepare payload
            const payload = {
                type: 'purchase',
                utorid: formData.utorid,
                spent: parseFloat(formData.spent),
                // Convert "1,2,3" string -> [1, 2, 3] array
                promotionIds: formData.promotionIds
                    ? formData.promotionIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
                    : []
            };

            const response = await axios.post(`${API_BASE_URL}/transactions`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Success!
            const earned = response.data.earned || 0;
            setMessage({ 
                type: 'success', 
                text: `Transaction Successful! User charged $${payload.spent} and earned ${earned} points.` 
            });
            
            // Clear only cost fields, keep utorid in case of repeat
            setFormData(prev => ({ ...prev, spent: '', promotionIds: '' }));

        } catch (err) {
            console.error(err);
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.error || "Transaction Failed. Check UTORid or inputs." 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Cashier Terminal (Purchase)</h2>
            <p>Enter customer details to process a purchase and award points.</p>

            {message.text && (
                <div style={{
                    padding: '15px', 
                    marginBottom: '20px', 
                    borderRadius: '5px',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24'
                }}>
                    <strong>{message.text}</strong>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* 1. Customer UTORid */}
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Customer UTORid:</label>
                    <input 
                        name="utorid"
                        placeholder="e.g. john.doe"
                        value={formData.utorid}
                        onChange={handleChange}
                        required
                        style={{ padding: '10px', width: '100%', fontSize: '1.1rem' }}
                    />
                </div>

                {/* 2. Amount Spent */}
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Amount Spent ($):</label>
                    <input 
                        name="spent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.spent}
                        onChange={handleChange}
                        required
                        style={{ padding: '10px', width: '100%', fontSize: '1.1rem' }}
                    />
                </div>

                {/* 3. Promotions (Optional) */}
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Promotion IDs (Optional):</label>
                    <input 
                        name="promotionIds"
                        placeholder="e.g. 1, 5 (Comma separated)"
                        value={formData.promotionIds}
                        onChange={handleChange}
                        style={{ padding: '10px', width: '100%' }}
                    />
                    <small style={{ color: '#666' }}>Enter IDs of active promotions to apply extra points.</small>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        padding: '15px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        fontSize: '1.2rem', 
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '10px'
                    }}
                >
                    {loading ? 'Processing...' : 'Complete Purchase'}
                </button>
            </form>
        </div>
    );
};

export default CashierPage;