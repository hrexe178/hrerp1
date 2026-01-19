// Attendance management component
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    checkInTime: '',
    checkOutTime: '',
    remarks: '',
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/attendance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(response.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/attendance', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        checkInTime: '',
        checkOutTime: '',
        remarks: '',
      });
      fetchAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="attendance-management">
      <h1>Attendance Management</h1>
      <form onSubmit={handleSubmit} className="attendance-form">
        <input
          type="text"
          name="employeeId"
          placeholder="Employee ID"
          value={formData.employeeId}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="half-day">Half Day</option>
          <option value="leave">Leave</option>
        </select>
        <input
          type="time"
          name="checkInTime"
          value={formData.checkInTime}
          onChange={handleChange}
        />
        <input
          type="time"
          name="checkOutTime"
          value={formData.checkOutTime}
          onChange={handleChange}
        />
        <input
          type="text"
          name="remarks"
          placeholder="Remarks"
          value={formData.remarks}
          onChange={handleChange}
        />
        <button type="submit">Mark Attendance</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Status</th>
            <th>Check In</th>
            <th>Check Out</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => (
            <tr key={record._id}>
              <td>{record.employeeId?.firstName} {record.employeeId?.lastName}</td>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>{record.status}</td>
              <td>{record.checkInTime}</td>
              <td>{record.checkOutTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceManagement;
