// Attendance management component
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkInTime: '',
    checkOutTime: '',
    remarks: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [attendanceRes, employeesRes] = await Promise.all([
        axios.get(`${API_URL}/api/attendance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setAttendance(attendanceRes.data.data || []);
      setEmployees(employeesRes.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.length >= 3) {
      const filtered = employees.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(value.toLowerCase()) ||
          emp.lastName.toLowerCase().includes(value.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees([]);
    }
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setSearchInput(`${emp.firstName} ${emp.lastName} (${emp.employeeId})`);
    setFormData({ ...formData, employee: emp._id });
    setFilteredEmployees([]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee) {
      alert('Please select an employee');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/attendance`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Attendance marked successfully');
      setFormData({
        employee: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
        checkInTime: '',
        checkOutTime: '',
        remarks: '',
      });
      setSearchInput('');
      setSelectedEmployee(null);
      fetchData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="attendance-management">
      <h1>Attendance Management</h1>
      <form onSubmit={handleSubmit} className="attendance-form">
        <div className="form-group">
          <label>Employee (Start typing name or ID)</label>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search employee by name or ID (min 3 chars)"
              value={searchInput}
              onChange={handleSearchChange}
              required={!selectedEmployee}
            />
            {filteredEmployees.length > 0 && (
              <ul className="suggestions-dropdown">
                {filteredEmployees.map((emp) => (
                  <li key={emp._id} onClick={() => handleSelectEmployee(emp)}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedEmployee && (
            <p style={{ marginTop: '5px', color: 'green' }}>
              ✓ Selected: {selectedEmployee.firstName} {selectedEmployee.lastName}
            </p>
          )}
        </div>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Half-Day">Half Day</option>
          <option value="Leave">Leave</option>
          <option value="Holiday">Holiday</option>
          <option value="Weekend">Weekend</option>
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

      <h2>Attendance Records</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Status</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => (
            <tr key={record._id}>
              <td>{record.employee?.firstName} {record.employee?.lastName}</td>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>{record.status}</td>
              <td>{record.checkInTime || '-'}</td>
              <td>{record.checkOutTime || '-'}</td>
              <td>{record.remarks || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceManagement;
