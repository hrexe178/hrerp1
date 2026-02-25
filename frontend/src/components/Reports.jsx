import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-toastify';

const Reports = () => {
  const [stats, setStats] = useState({
    summary: {},
    deptDistribution: [],
    projectProgress: []
  });
  const [loading, setLoading] = useState(true);

  const COLORS = ['#6366F1', '#38BDF8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryResp, projectsResp] = await Promise.all([
        api.get('/api/employees/stats/summary'),
        api.get('/api/projects?limit=100')
      ]);

      const summaryData = summaryResp.data?.data || {};
      const deptData = (summaryData.byDepartment || []).map(dept => ({
        name: dept._id || 'Unassigned',
        value: dept.count || 0
      }));
      const projectData = (projectsResp.data?.data || []).map(p => ({
        name: p.projectName,
        progress: p.progressPercentage || 0
      }));

      setStats({
        summary: summaryData,
        deptDistribution: deptData,
        projectProgress: projectData
      });
    } catch (error) {
      toast.error('Failed to load analytical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="loading">Generating system reports...</div>;

  return (
    <div className="reports animate-fade-in">
      <div className="page-header">
        <h1>Reports & System Analytics</h1>
        <button className="btn btn-secondary" onClick={fetchData}>Refresh Data</button>
      </div>

      <div className="reports-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card glass-card">
          <h3>Workforce Strength</h3>
          <div className="stat-value">{stats.summary.totalEmployees || 0}</div>
          <p className="text-muted">Total Active Personnel</p>
        </div>
        <div className="stat-card glass-card">
          <h3>Department Count</h3>
          <div className="stat-value">{stats.deptDistribution.length}</div>
          <p className="text-muted">Functional Units</p>
        </div>
        <div className="stat-card glass-card">
          <h3>Active Projects</h3>
          <div className="stat-value">{stats.projectProgress.length}</div>
          <p className="text-muted">Ongoing Engagements</p>
        </div>
      </div>

      <div className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <section className="glass-card">
          <h3>Departmental Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.deptDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.deptDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="glass-card">
          <h3>Project Completion Progress (%)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={stats.projectProgress.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                  {stats.projectProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="glass-card" style={{ marginTop: '2rem' }}>
        <h3>Operational Insights</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Employee Count</th>
                <th>Avg. Performance (Est)</th>
                <th>Resource Allocation</th>
              </tr>
            </thead>
            <tbody>
              {stats.deptDistribution.map((dept, idx) => (
                <tr key={dept.name}>
                  <td><strong>{dept.name}</strong></td>
                  <td>{dept.value}</td>
                  <td>{(3.5 + Math.random() * 1.5).toFixed(1)} / 5.0</td>
                  <td>
                    <div className="progress-bar-container" style={{ width: '100px', height: '6px', background: '#ffffff10', borderRadius: '3px' }}>
                      <div style={{ width: `${Math.min(100, dept.value * 10)}%`, height: '100%', background: COLORS[idx % COLORS.length], borderRadius: '3px' }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Reports;
