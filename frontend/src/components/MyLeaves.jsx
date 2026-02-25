import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

const MyLeaves = () => {
  const [rows, setRows] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: 'Sick',
    fromDate: '',
    toDate: '',
    reason: '',
    isHalfDay: false,
    halfDaySlot: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/leaves/mine?limit=100');
      setRows(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setMessage('');
      await api.post('/api/leaves', formData);
      setMessage('Leave request submitted');
      setFormData({
        leaveType: 'Sick',
        fromDate: '',
        toDate: '',
        reason: '',
        isHalfDay: false,
        halfDaySlot: '',
      });
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-page animate-fade-in employee-list">
      <h2>My Leaves</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <form onSubmit={handleSubmit} className="glass-card form-group" style={{ marginBottom: '2rem' }}>
        <select value={formData.leaveType} className="modern-input" onChange={(e) => setFormData((p) => ({ ...p, leaveType: e.target.value }))}>
          <option value="Sick">Sick</option>
          <option value="Casual">Casual</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Maternity">Maternity</option>
          <option value="Paternity">Paternity</option>
          <option value="Compensatory">Compensatory</option>
        </select>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input type="date" className="modern-input" value={formData.fromDate} onChange={(e) => setFormData((p) => ({ ...p, fromDate: e.target.value }))} required />
          <input type="date" className="modern-input" value={formData.toDate} onChange={(e) => setFormData((p) => ({ ...p, toDate: e.target.value }))} required />
        </div>
        <textarea placeholder="Reason" className="modern-input" value={formData.reason} onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))} required />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <input type="checkbox" checked={formData.isHalfDay} onChange={(e) => setFormData((p) => ({ ...p, isHalfDay: e.target.checked }))} />
          <span>Half day</span>
        </label>
        {formData.isHalfDay && (
          <select value={formData.halfDaySlot} className="modern-input" onChange={(e) => setFormData((p) => ({ ...p, halfDaySlot: e.target.value }))}>
            <option value="">Select half day slot</option>
            <option value="First Half">First Half</option>
            <option value="Second Half">Second Half</option>
          </select>
        )}
        <button type="submit" className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>{saving ? 'Submitting...' : 'Apply Leave'}</button>
      </form>

      {loading ? (
        <div>Loading leaves...</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td data-label="Type">{row.leaveType}</td>
                  <td data-label="From">{formatDate(row.fromDate)}</td>
                  <td data-label="To">{formatDate(row.toDate)}</td>
                  <td data-label="Days">{row.totalDays}</td>
                  <td data-label="Status">
                    <span className={`status-badge ${row.status === 'Manager Approved' ? 'status-manager-approved' : row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyLeaves;
