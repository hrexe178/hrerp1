import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/App.css';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const [announcements, setAnnouncements] = useState([]);
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            const [announcementResp, holidayResp, reviewResp] = await Promise.all([
                api.get('/api/announcements?limit=5'),
                api.get(`/api/holidays?year=${new Date().getFullYear()}&limit=5`),
                api.get('/api/performance-reviews/mine?limit=20') // Get up to 20 past reviews for the chart
            ]);

            setAnnouncements(announcementResp.data?.data || []);
            setUpcomingHolidays(holidayResp.data?.data || []);

            const rawReviews = reviewResp.data?.data || [];
            // Sort chronologically for the chart
            rawReviews.sort((a, b) => a.reviewCycle.localeCompare(b.reviewCycle));

            const formattedReviews = rawReviews.map(r => ({
                name: r.reviewCycle,
                rating: r.overallRating || 0,
                status: r.status
            }));

            setMyReviews(formattedReviews);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard data');
            console.error('Error fetching employee dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div className="dashboard-page employee-dashboard">
            <div className="dashboard-header animate-fade-in">
                <h1>Welcome Back, {user?.firstName}!</h1>
                <p className="role-badge pulse-badge">{user?.role.toUpperCase()}</p>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {loading ? (
                <div className="loading">Loading dashboard metrics...</div>
            ) : (
                <div className="admin-grid-layout">

                    <section className="dashboard-section glass-card full-width">
                        <h2>📈 My Monthly Performance Tracking</h2>
                        {myReviews.filter(r => r.rating > 0).length === 0 ? (
                            <p className="text-muted">You do not have any completed performance reviews yet.</p>
                        ) : (
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <LineChart data={myReviews.filter(r => r.rating > 0)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                        <XAxis dataKey="name" stroke="#fff" />
                                        <YAxis domain={[0, 5]} stroke="#fff" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                        <Legend />
                                        <Line type="monotone" name="Overall Rating" dataKey="rating" stroke="#34d399" strokeWidth={4} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <a href="/my-attendance" className="action-btn glass-btn">📅 My Attendance</a>
                            <a href="/my-leaves" className="action-btn glass-btn">🏖️ My Leaves</a>
                            <a href="/my-payslips" className="action-btn glass-btn">💰 My Payslips</a>
                            <a href="/performance-reviews" className="action-btn glass-btn">📝 Assessment Details</a>
                        </div>
                    </section>

                    <div className="dashboard-split-columns full-width">
                        <section className="dashboard-section glass-card">
                            <h2>📣 Important Announcements</h2>
                            {announcements.length === 0 ? (
                                <p>No active announcements</p>
                            ) : (
                                <div className="details-container">
                                    {announcements.map((item) => (
                                        <div key={item._id} className="announcement-item">
                                            <p className="announcement-title"><strong>{item.title}</strong></p>
                                            <p className="announcement-message">{item.message}</p>
                                            <small className="text-muted">Published: {formatDate(item.publishDate)}</small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="dashboard-section glass-card">
                            <h2>📅 Upcoming Holidays</h2>
                            {upcomingHolidays.length === 0 ? (
                                <p>No holidays configured for this year</p>
                            ) : (
                                <ul className="holiday-list">
                                    {upcomingHolidays.map((holiday) => (
                                        <li key={holiday._id}>
                                            <strong>{formatDate(holiday.date)}</strong> - {holiday.name} <span className="text-muted">({holiday.type})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>

                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
