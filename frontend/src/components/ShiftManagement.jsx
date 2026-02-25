import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [assignment, setAssignment] = useState({ shiftId: '', employeeId: '' });
  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    breakDuration: 60,
    allowedLateMins: 15,
  });

  const fetchShifts = async () => {
    try {
      const [shiftResponse, employeeResponse] = await Promise.all([
        api.get('/api/shifts?limit=100'),
        api.get('/api/employees?limit=200'),
      ]);
      setShifts(shiftResponse.data?.data || []);
      setEmployees(employeeResponse.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shifts');
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const createShift = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/shifts', formData);
      setMessage('Shift created successfully');
      setFormData({ name: '', startTime: '09:00', endTime: '18:00', breakDuration: 60, allowedLateMins: 15 });
      fetchShifts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shift');
    }
  };

  const assignShift = async (e) => {
    e.preventDefault();
    try {
      if (!assignment.shiftId || !assignment.employeeId) {
        setError('Please select both shift and employee');
        return;
      }
      await api.put(`/api/shifts/${assignment.shiftId}/assign/${assignment.employeeId}`);
      setMessage('Shift assigned successfully');
      setAssignment({ shiftId: '', employeeId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign shift');
    }
  };

  return (
    <div className="project-management">
      <h2>Shift Management</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <form onSubmit={createShift}>
        <h3>Create Shift</h3>
        <input type="text" placeholder="Shift Name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
        <input type="time" value={formData.startTime} onChange={(e) => setFormData((p) => ({ ...p, startTime: e.target.value }))} required />
        <input type="time" value={formData.endTime} onChange={(e) => setFormData((p) => ({ ...p, endTime: e.target.value }))} required />
        <input type="number" min="0" placeholder="Break (mins)" value={formData.breakDuration} onChange={(e) => setFormData((p) => ({ ...p, breakDuration: Number(e.target.value) }))} />
        <input type="number" min="0" placeholder="Allowed late (mins)" value={formData.allowedLateMins} onChange={(e) => setFormData((p) => ({ ...p, allowedLateMins: Number(e.target.value) }))} />
        <button type="submit">Create</button>
      </form>

      <form onSubmit={assignShift}>
        <h3>Assign Shift to Employee</h3>
        <select value={assignment.shiftId} onChange={(e) => setAssignment((p) => ({ ...p, shiftId: e.target.value }))} required>
          <option value="">Select shift</option>
          {shifts.filter((shift) => shift.isActive).map((shift) => (
            <option key={shift._id} value={shift._id}>{shift.name} ({shift.startTime}-{shift.endTime})</option>
          ))}
        </select>
        <select value={assignment.employeeId} onChange={(e) => setAssignment((p) => ({ ...p, employeeId: e.target.value }))} required>
          <option value="">Select employee</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.employeeId} - {employee.firstName} {employee.lastName}
            </option>
          ))}
        </select>
        <button type="submit">Assign</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Start</th>
            <th>End</th>
            <th>Break</th>
            <th>Late Buffer</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift._id}>
              <td data-label="Name">{shift.name}</td>
              <td data-label="Start">{shift.startTime}</td>
              <td data-label="End">{shift.endTime}</td>
              <td data-label="Break">{shift.breakDuration} min</td>
              <td data-label="Late Buffer">{shift.allowedLateMins} min</td>
              <td data-label="Active">{shift.isActive ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShiftManagement;
