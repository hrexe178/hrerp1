import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

const MyAttendance = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/attendance/mine?limit=100');
        setRows(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="attendance-management">
      <h2>My Attendance</h2>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div>Loading attendance...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work Hours</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id}>
                <td data-label="Date">{formatDate(row.date)}</td>
                <td data-label="Status">{row.status}</td>
                <td data-label="Check In">{row.checkInTime || '-'}</td>
                <td data-label="Check Out">{row.checkOutTime || '-'}</td>
                <td data-label="Work Hours">{row.workHours || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyAttendance;
