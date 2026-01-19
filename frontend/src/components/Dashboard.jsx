import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      if (user?.role === 'admin' || user?.role === 'hr') {
        const response = await api.get('/api/employees/stats/summary');
        setStats(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.firstName} {user?.lastName}!</h1>
        <p className="role-badge">{user?.role.toUpperCase()}</p>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          {(user?.role === 'admin' || user?.role === 'hr') && stats && (
            <div className="dashboard-grid">
              <div className="stat-card">
                <h3>Total Employees</h3>
                <p className="stat-value">{stats.totalEmployees || 0}</p>
              </div>

              <div className="stat-card">
                <h3>Active Employees</h3>
                <p className="stat-value">{stats.activeEmployees || 0}</p>
              </div>

              <div className="stat-card">
                <h3>Total Projects</h3>
                <p className="stat-value">{stats.totalProjects || 0}</p>
              </div>

              <div className="stat-card">
                <h3>In Progress Projects</h3>
                <p className="stat-value">{stats.inProgressProjects || 0}</p>
              </div>
            </div>
          )}

          <div className="dashboard-sections">
            <section className="dashboard-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                <a href="/employees" className="action-btn">
                  👥 View Employees
                </a>
                <a href="/projects" className="action-btn">
                  📊 View Projects
                </a>
                <a href="/attendance" className="action-btn">
                  📅 Attendance
                </a>
                <a href="/documents" className="action-btn">
                  📄 Documents
                </a>
                {(user?.role === 'admin' || user?.role === 'hr') && (
                  <a href="/reports" className="action-btn">
                    📈 Reports
                  </a>
                )}
              </div>
            </section>

            <section className="dashboard-section">
              <h2>Account Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Email:</label>
                  <span>{user?.email}</span>
                </div>
                <div className="info-item">
                  <label>Role:</label>
                  <span>{user?.role}</span>
                </div>
                <div className="info-item">
                  <label>Last Login:</label>
                  <span>{user?.lastLogin ? formatDate(user.lastLogin) : 'First login'}</span>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
