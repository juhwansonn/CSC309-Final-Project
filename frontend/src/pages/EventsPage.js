import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');
    const { user, token } = useAuth();
    const navigate = useNavigate();

    // State for Pagination & Sorting
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortOrder, setSortOrder] = useState('date_asc'); 
    const LIMIT = 5;

    const isManager = user && (user.role === 'manager' || user.role === 'superuser');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/events`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { 
                        page: page,
                        limit: LIMIT,
                        orderBy: sortOrder
                    }
                });
                setEvents(response.data.results);
                setTotalPages(Math.ceil(response.data.count / LIMIT));
            } catch (err) {
                setError('Failed to fetch events.');
            }
        };
        fetchEvents();
    }, [token, page, sortOrder]);

    const handleRSVP = async (eventId) => {
        try {
            await axios.post(`${API_BASE_URL}/events/${eventId}/guests/me`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Success! You are on the guest list.");
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.error || "RSVP Failed");
        }
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(events.filter(e => e.id !== eventId));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete event");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Upcoming Events</h2>
                {isManager && (
                    <button onClick={() => navigate('/events/new')} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        + New Event
                    </button>
                )}
            </div>

            {/* --- SORT BAR --- */}
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: 'bold' }}>Sort By:</label>
                <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="date_asc">Date (Soonest First)</option>
                    <option value="date_desc">Date (Latest First)</option>
                    <option value="capacity_desc">Capacity (Highest)</option>
                    <option value="points_desc">Points Awarded (Highest)</option>
                </select>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ display: 'grid', gap: '20px' }}>
                {events.map((event) => (
                    <div key={event.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                            <h3 style={{margin: 0}}>{event.name}</h3>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {/* Join Button */}
                                <button 
                                    onClick={() => handleRSVP(event.id)}
                                    style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Join
                                </button>

                                {/* Manager Buttons */}
                                {isManager && (
                                    <>
                                        {/* NEW: Manage Button */}
                                        <button 
                                            onClick={() => navigate(`/events/${event.id}/manage`)}
                                            style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Manage
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(event.id)}
                                            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <p style={{ margin: '5px 0' }}><strong>Location:</strong> {event.location}</p>
                        <p style={{ margin: '5px 0' }}><strong>Time:</strong> {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}</p>
                        <p style={{ margin: '10px 0', color: '#555' }}>{event.description}</p>
                        <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                            <strong>Guests:</strong> {event.numGuests} / {event.capacity} | <strong>Points:</strong> {event.pointsAwarded}
                        </p>
                    </div>
                ))}
                
                {events.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No events found.</p>}
            </div>

            {/* --- Pagination --- */}
            {totalPages > 1 && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
                    <span style={{ fontWeight: 'bold' }}>Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
                </div>
            )}
        </div>
    );
};

export default EventsPage;