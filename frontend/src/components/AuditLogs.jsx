import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import '../styles/App.css';

const AuditLogs = () => {
    const { user } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/audit-logs?limit=500');
            setLogs(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load audit logs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchLogs();
        } else {
            setError("Unauthorized access.");
            setLoading(false);
        }
    }, [user]);

    const filteredLogs = logs.filter(log => {
        const matchesModule = moduleFilter ? log.module === moduleFilter : true;
        const matchesAction = actionFilter ? log.action === actionFilter : true;

        const searchStr = `${log.targetName} ${log.performedBy?.firstName} ${log.performedBy?.lastName}`.toLowerCase();
        const matchesSearch = searchTerm ? searchStr.includes(searchTerm.toLowerCase()) : true;

        return matchesModule && matchesAction && matchesSearch;
    });

    const modules = [...new Set(logs.map(log => log.module).filter(Boolean))];
    const actions = [...new Set(logs.map(log => log.action).filter(Boolean))];

    const exportCsv = () => {
        const headers = ['Date', 'Action', 'Module', 'Target', 'User', 'IP Address'];
        const rows = filteredLogs.map(log => [
            new Date(log.createdAt).toLocaleString(),
            log.action,
            log.module,
            log.targetName || log.targetId || '-',
            log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : 'System',
            log.ipAddress || '-'
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'audit_logs_export.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="loading skeleton skeleton-card">Loading...</div>;
    if (error) return <div className="error-alert">{error}</div>;

    return (
        <div className="dashboard-page animate-fade-in">
            <div className="dashboard-header">
                <h1>Security Audit Logs</h1>
                <p className="text-muted">System-wide tracking of critical data mutations.</p>
            </div>

            <div className="filters-container glass-card" style={{ marginBottom: '20px', padding: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search Target or User..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: '1 1 200px' }}
                />
                <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
                    <option value="">All Modules</option>
                    {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                </select>
                <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                    <option value="">All Actions</option>
                    {actions.map(act => <option key={act} value={act}>{act}</option>)}
                </select>
                <button onClick={exportCsv} className="btn" style={{ marginLeft: 'auto' }}>Export CSV</button>
            </div>

            <div className="glass-card full-width">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date / Time</th>
                            <th>Action</th>
                            <th>Module</th>
                            <th>Target Record</th>
                            <th>Performed By</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length > 0 ? filteredLogs.map(log => (
                            <tr key={log._id}>
                                <td data-label="Date / Time">{new Date(log.createdAt).toLocaleString()}</td>
                                <td data-label="Action">
                                    <span style={{
                                        color: log.action === 'CREATE' ? '#34d399' : log.action === 'DELETE' ? '#f87171' : '#60a5fa',
                                        fontWeight: 'bold'
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td data-label="Module">{log.module}</td>
                                <td data-label="Target Record">{log.targetName || log.targetId || '-'}</td>
                                <td data-label="Performed By">{log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : 'System / Self Registration'}</td>
                                <td data-label="IP Address">{log.ipAddress || '-'}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No audit logs recorded matching criteria.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;
