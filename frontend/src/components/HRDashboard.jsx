import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import '../styles/App.css';

const HRDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [perfStats, setPerfStats] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [reviewForm, setReviewForm] = useState({
        employee: '',
        monthYear: new Date().toISOString().slice(0, 7),
        rating: 3,
        assessment: ''
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            const [employeeResp, projectResp, announcementResp, holidayResp, perfResp, empListResp] = await Promise.all([
                api.get('/api/employees/stats/summary'),
                api.get('/api/projects?limit=200'),
                api.get('/api/announcements?limit=5'),
                api.get(`/api/holidays?year=${new Date().getFullYear()}&limit=5`),
                api.get('/api/performance-reviews/stats'),
                api.get('/api/employees?limit=200')
            ]);

            const projectRows = projectResp.data?.data || [];
            const inProgressProjects = projectRows.filter((project) => project.status === 'In Progress').length;

            setStats({
                ...employeeResp.data.data,
                totalProjects: projectRows.length,
                inProgressProjects,
            });

            setAnnouncements(announcementResp.data?.data || []);
            setUpcomingHolidays(holidayResp.data?.data || []);
            setPerfStats(perfResp.data?.data || []);
            setEmployees(empListResp.data?.data || []);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard data');
            console.error('Error fetching HR dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const startObj = new Date(reviewForm.monthYear + '-01');
            const endObj = new Date(startObj.getFullYear(), startObj.getMonth() + 1, 0);

            const createRes = await api.post('/api/performance-reviews', {
                employee: reviewForm.employee,
                reviewCycle: reviewForm.monthYear,
                reviewPeriod: {
                    startDate: startObj.toISOString().split('T')[0],
                    endDate: endObj.toISOString().split('T')[0]
                }
            });

            const reviewId = createRes.data.data._id;

            await api.put(`/api/performance-reviews/${reviewId}/manager-review`, {
                managerAssessment: reviewForm.assessment,
                finalRating: Number(reviewForm.rating),
                overallRating: Number(reviewForm.rating)
            });

            await api.put(`/api/performance-reviews/${reviewId}/complete`, {
                finalRating: Number(reviewForm.rating),
                overallRating: Number(reviewForm.rating)
            });

            toast.success('Performance review submitted successfully!');
            setReviewForm({ ...reviewForm, employee: '', assessment: '', rating: 3 });
            fetchDashboardData();

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit performance review');
        }
    };

    return (
        <div className="dashboard-page admin-dashboard">
            <div className="dashboard-header animate-fade-in">
                <h1>Welcome to the HR Dashboard, {user?.firstName}!</h1>
                <p className="role-badge pulse-badge">{user?.role.toUpperCase()}</p>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {loading ? (
                <div className="loading">Loading dashboard metrics...</div>
            ) : (
                <div className="admin-grid-layout">
                    {stats && (
                        <div className="dashboard-grid full-width">
                            <div className="stat-card glass-card">
                                <h3>👥 Total Employees</h3>
                                <p className="stat-value">{stats.totalEmployees || 0}</p>
                            </div>
                            <div className="stat-card glass-card">
                                <h3>🟢 Active Employees</h3>
                                <p className="stat-value">{stats.activeEmployees || 0}</p>
                            </div>
                            <div className="stat-card glass-card">
                                <h3>📊 Total Projects</h3>
                                <p className="stat-value">{stats.totalProjects || 0}</p>
                            </div>
                            <div className="stat-card glass-card">
                                <h3>🚀 In Progress</h3>
                                <p className="stat-value">{stats.inProgressProjects || 0}</p>
                            </div>
                        </div>
                    )}

                    <section className="dashboard-section glass-card graph-section full-width">
                        <h2>📈 Company-Wide Monthly Performance Rating Edge</h2>
                        {perfStats.length === 0 ? (
                            <p>No completed performance reviews found to generate charts.</p>
                        ) : (
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <LineChart data={perfStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                        <XAxis dataKey="name" stroke="#fff" />
                                        <YAxis domain={[0, 5]} stroke="#fff" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="rating" stroke="#60a5fa" strokeWidth={4} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>

                    <div className="dashboard-split-columns full-width">
                        <section className="dashboard-section glass-card quick-review-widget">
                            <h2>✍️ Quick Monthly Performance Review</h2>
                            <p className="text-muted" style={{ marginBottom: '1rem' }}>Submit a rating strictly for the selected month to update the charts instantly.</p>
                            <form onSubmit={handleReviewSubmit} className="form-container">
                                <div className="form-group">
                                    <label>Select Employee:</label>
                                    <select
                                        value={reviewForm.employee}
                                        onChange={e => setReviewForm({ ...reviewForm, employee: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Choose Employee --</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Review Month & Year:</label>
                                    <input
                                        type="month"
                                        value={reviewForm.monthYear}
                                        onChange={e => setReviewForm({ ...reviewForm, monthYear: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Rating (1-5):</label>
                                    <input
                                        type="range"
                                        min="1" max="5" step="0.5"
                                        value={reviewForm.rating}
                                        onChange={e => setReviewForm({ ...reviewForm, rating: e.target.value })}
                                    />
                                    <div className="rating-display">{reviewForm.rating} ⭐</div>
                                </div>

                                <div className="form-group">
                                    <label>Brief Assessment Note:</label>
                                    <textarea
                                        value={reviewForm.assessment}
                                        onChange={e => setReviewForm({ ...reviewForm, assessment: e.target.value })}
                                        placeholder="Provide constructive feedback for this month..."
                                        rows="3"
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary full-width-btn">Submit Target Review</button>
                            </form>
                        </section>

                        <div className="dashboard-stacked-sections">
                            <section className="dashboard-section glass-card">
                                <h2>🚀 Quick HR Actions</h2>
                                <div className="quick-actions">
                                    <a href="/employees" className="action-btn glass-btn">👥 Onboard Staff</a>
                                    <a href="/attendance" className="action-btn glass-btn">📅 Check Attendance</a>
                                    <a href="/performance-reviews" className="action-btn glass-btn">📝 Appraisals</a>
                                    <a href="/reports" className="action-btn glass-btn">📈 HR Reports</a>
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRDashboard;
