import React, { useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';

const HolidayManagement = () => {
  const { user } = useContext(AuthContext);
  const [holidays, setHolidays] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: String(new Date().getFullYear()),
  });
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'National',
    description: '',
  });

  const hasAccess = ['admin', 'hr'].includes(user?.role);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/holidays?year=${filters.year}&limit=200`);
      setHolidays(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.year]);

  const createHoliday = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/holidays', formData);
      toast.success('Holiday created successfully');
      setFormData({ name: '', date: '', type: 'National', description: '' });
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create holiday');
    }
  };

  const deleteHoliday = async (id) => {
    try {
      await api.delete(`/api/holidays/${id}`);
      toast.success('Holiday deleted successfully');
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete holiday');
    }
  };

  if (!hasAccess) {
    return <div className="reports"><h2>Holiday Calendar</h2><p>Only HR/Admin can manage holidays.</p></div>;
  }

  return (
    <div className="reports">
      <h2>Holiday Calendar Management</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={createHoliday}>
        <h3>Add Holiday</h3>
        <input type="text" placeholder="Holiday Name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
        <input type="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} required />
        <select value={formData.type} onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}>
          <option value="National">National</option>
          <option value="Company">Company</option>
          <option value="Optional">Optional</option>
        </select>
        <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
        <button type="submit">Add Holiday</button>
      </form>

      <h3>Holiday List</h3>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="number"
          min="2000"
          max="2100"
          value={filters.year}
          onChange={(e) => setFilters({ year: e.target.value })}
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Type</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((holiday) => (
              <tr key={holiday._id}>
                <td data-label="Date">{formatDate(holiday.date)}</td>
                <td data-label="Name">{holiday.name}</td>
                <td data-label="Type">{holiday.type}</td>
                <td data-label="Description">{holiday.description || '-'}</td>
                <td data-label="Action">
                  <button className="btn" onClick={() => deleteHoliday(holiday._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HolidayManagement;
