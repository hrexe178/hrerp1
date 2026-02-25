import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/App.css';

const NotificationBell = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
                setUnreadCount(res.data.count);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleMarkAsRead = async (id, link) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setIsOpen(false);
            if (link) navigate(link);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            // Opt-in lazy mark all read OR keep individually clicked. We let them click individual.
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="notification-bell-container" style={{ position: 'relative', marginRight: '20px' }}>
            <button onClick={toggleDropdown} className="bell-btn" style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', position: 'relative' }}>
                🔔
                {unreadCount > 0 && (
                    <span className="badge" style={{ position: 'absolute', top: '-5px', right: '-10px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown glass-card animate-slide-up" style={{
                    position: 'absolute',
                    top: '40px',
                    right: '-50px',
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="action-link"
                                style={{ fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifications.length === 0 ? (
                            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>No recent notifications</p>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    onClick={() => handleMarkAsRead(notif._id, notif.link)}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        background: notif.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(96, 165, 250, 0.2)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        borderLeft: notif.isRead ? 'none' : '3px solid #60a5fa'
                                    }}
                                    className="notification-item"
                                >
                                    <p style={{ margin: '0 0 5px 0', fontWeight: notif.isRead ? 'normal' : 'bold', fontSize: '0.9rem' }}>{notif.title}</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>{notif.message}</p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.7rem', color: '#64748b' }}>{new Date(notif.createdAt).toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
