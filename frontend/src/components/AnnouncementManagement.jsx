import React, { useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';

const AnnouncementManagement = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'All',
    targetDept: '',
    publishDate: '',
    expiryDate: '',
  });

  const hasAccess = ['admin', 'hr'].includes(user?.role);

  const fetchAnnouncements = async () => {
    if (!hasAccess) return;
    try {
      setLoading(true);
      const response = await api.get('/api/announcements/admin/all?limit=100');
      setAnnouncements(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const createAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/api/announcements', formData);
      toast.success('Announcement created successfully');
      setFormData({
        title: '',
        message: '',
        targetAudience: 'All',
        targetDept: '',
        publishDate: '',
        expiryDate: '',
      });
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create announcement');
    }
  };

  const deactivateAnnouncement = async (id) => {
    try {
      await api.delete(`/api/announcements/${id}`);
      toast.success('Announcement deactivated successfully');
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate announcement');
    }
  };

  if (!hasAccess) {
    return <div className="dashboard-page reports animate-fade-in"><h2>Announcements</h2><p>Only HR/Admin can manage announcements.</p></div>;
  }

  return (
    <div className="dashboard-page animate-fade-in reports">
      <h2>Announcement Management</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={createAnnouncement} className="glass-card form-group" style={{ marginBottom: '2rem' }}>
        <h3>Create Announcement</h3>
        <input type="text" className="modern-input" placeholder="Title" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} required />
        <textarea placeholder="Message" className="modern-input" value={formData.message} onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))} required />
        <select value={formData.targetAudience} className="modern-input" onChange={(e) => setFormData((p) => ({ ...p, targetAudience: e.target.value }))}>
          <option value="All">All</option>
          <option value="Department">Department</option>
          <option value="Specific">Specific</option>
        </select>
        {formData.targetAudience === 'Department' && (
          <input type="text" className="modern-input" placeholder="Target Department" value={formData.targetDept} onChange={(e) => setFormData((p) => ({ ...p, targetDept: e.target.value }))} />
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>Publish Date</label>
            <input type="datetime-local" className="modern-input" value={formData.publishDate} onChange={(e) => setFormData((p) => ({ ...p, publishDate: e.target.value }))} />
          </div>
          <div>
            <label>Expiry Date</label>
            <input type="datetime-local" className="modern-input" value={formData.expiryDate} onChange={(e) => setFormData((p) => ({ ...p, expiryDate: e.target.value }))} />
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Publish Announcement</button>
      </form>

      <h3>All Announcements</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Audience</th>
                <th>Published</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((row) => (
                <tr key={row._id}>
                  <td data-label="Title">{row.title}</td>
                  <td data-label="Audience">{row.targetAudience}{row.targetDept ? ` (${row.targetDept})` : ''}</td>
                  <td data-label="Published">{formatDate(row.publishDate)}</td>
                  <td data-label="Active">{row.isActive ? 'Yes' : 'No'}</td>
                  <td data-label="Action">
                    {row.isActive && (
                      <button className="action-btn delete-btn" onClick={() => deactivateAnnouncement(row._id)}>Deactivate</button>
                    )}
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

export default AnnouncementManagement;
