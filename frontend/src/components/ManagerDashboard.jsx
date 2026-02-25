import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/App.css';

const ManagerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [team, setTeam] = useState([]);
    const [projects, setProjects] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            const [employeeResp, projectResp, announcementResp, holidayResp] = await Promise.all([
                api.get('/api/employees?limit=200'),
                api.get('/api/projects?limit=200'),
                api.get('/api/announcements?limit=5'),
                api.get(`/api/holidays?year=${new Date().getFullYear()}&limit=5`)
            ]);

            setTeam(employeeResp.data?.data || []);
            setProjects(projectResp.data?.data || []);
            setAnnouncements(announcementResp.data?.data || []);
            setUpcomingHolidays(holidayResp.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard data');
            console.error('Error fetching manager dashboard stats:', err);
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
                <h1>Manager Dashboard, {user?.firstName}!</h1>
                <p className="role-badge pulse-badge">{user?.role.toUpperCase()}</p>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {loading ? (
                <div className="loading">Loading dashboard metrics...</div>
            ) : (
                <div className="admin-grid-layout">
                    <div className="dashboard-grid full-width">
                        <div className="stat-card glass-card">
                            <h3>👥 Team Size</h3>
                            <p className="stat-value">{team.length}</p>
                        </div>
                        <div className="stat-card glass-card">
                            <h3>📊 Assigned Projects</h3>
                            <p className="stat-value">{projects.length}</p>
                        </div>
                        <div className="stat-card glass-card">
                            <h3>🚀 In Progress</h3>
                            <p className="stat-value">{projects.filter(p => p.status === 'In Progress').length}</p>
                        </div>
                    </div>

                    <div className="dashboard-split-columns full-width">
                        <section className="dashboard-section glass-card">
                            <h2>🚀 Quick Team Actions</h2>
                            <div className="quick-actions" style={{ marginBottom: '1rem' }}>
                                <a href="/employees" className="action-btn glass-btn">👥 View Team</a>
                                <a href="/projects" className="action-btn glass-btn">📊 Manage Projects</a>
                                <a href="/attendance" className="action-btn glass-btn">📅 Team Attendance</a>
                                <a href="/performance-reviews" className="action-btn glass-btn">📝 Team Reviews</a>
                            </div>
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

                    <div className="dashboard-split-columns full-width">
                        <section className="dashboard-section glass-card full-width">
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
                    </div>

                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
