import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';

const EditPromotionPage = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '', description: '', type: 'automatic', startTime: '', endTime: '', 
        minSpending: '', rate: '', points: ''
    });

    // Helper to format ISO date string for datetime-local input
    const formatForInput = (isoString) => {
        if (!isoString) return '';
        // Slice to remove the seconds/milliseconds and 'Z' (e.g., "2025-12-01T12:00")
        return isoString.slice(0, 16); 
    };

    // Fetch existing promotion data
    const fetchPromotion = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/promotions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const promo = response.data;

            setFormData({
                name: promo.name || '',
                description: promo.description || '',
                type: promo.type === 'onetime' ? 'one-time' : promo.type,
                startTime: formatForInput(promo.startTime),
                endTime: formatForInput(promo.endTime),
                minSpending: promo.minSpending || '',
                rate: promo.rate || '',
                points: promo.points || '',
            });
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load promotion details.');
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        fetchPromotion();
    }, [fetchPromotion]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Prepare the payload (only send fields that have values)
            const payload = {};

            if (formData.name) payload.name = formData.name;
            if (formData.description) payload.description = formData.description;
            if (formData.type) payload.type = formData.type;
            
            // Format dates back to ISO strings
            if (formData.startTime) payload.startTime = new Date(formData.startTime).toISOString();
            if (formData.endTime) payload.endTime = new Date(formData.endTime).toISOString();

            // Convert numbers, coercing empty strings to null or skipping them
            if (formData.minSpending !== '') payload.minSpending = parseFloat(formData.minSpending) || null;
            if (formData.rate !== '') payload.rate = parseFloat(formData.rate) || null;
            if (formData.points !== '') payload.points = parseInt(formData.points) || null;
            
            await axios.patch(`${API_BASE_URL}/promotions/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Promotion updated successfully!");
            navigate('/promotions');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update promotion');
        }
    };

    if (loading) return <div>Loading Promotion...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '500px' }}>
            <h2>Edit Promotion #{id}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input name="name" placeholder="Promotion Name" required value={formData.name} onChange={handleChange} />
                <textarea name="description" placeholder="Description" required value={formData.description} onChange={handleChange} />
                
                <label>Type:</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="automatic">Automatic</option>
                    <option value="one-time">One-Time Code</option>
                </select>

                <label>Start Time:</label>
                <input name="startTime" type="datetime-local" required value={formData.startTime} onChange={handleChange} />
                
                <label>End Time:</label>
                <input name="endTime" type="datetime-local" required value={formData.endTime} onChange={handleChange} />
                
                <h3>Rewards (Optional)</h3>
                <input name="minSpending" type="number" step="0.01" placeholder="Min Spending ($)" value={formData.minSpending} onChange={handleChange} />
                <input name="rate" type="number" step="0.1" placeholder="Multiplier Rate (e.g. 1.5)" value={formData.rate} onChange={handleChange} />
                <input name="points" type="number" placeholder="Flat Bonus Points" value={formData.points} onChange={handleChange} />
                
                <button type="submit" style={{ marginTop: '10px', padding: '10px' }}>Save Changes</button>
            </form>
        </div>
    );
};

export default EditPromotionPage;