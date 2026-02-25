import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';
import Modal from './Modal';

const AttendanceManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Single marking state
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [status, setStatus] = useState('Present');
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('18:00');

  // Bulk marking state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({
    status: 'Present',
    date: new Date().toISOString().split('T')[0],
    category: 'All'
  });

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/api/employees?limit=500');
      setEmployees(res.data.data || []);
    } catch (err) {
      toast.error('Error fetching employees');
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/attendance?startDate=${filterDate}&endDate=${filterDate}`);
      setAttendanceRecords(res.data.data || []);
    } catch (err) {
      toast.error('Error fetching attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return toast.error('Please select an employee');

    try {
      await api.post('/api/attendance', {
        employee: selectedEmployee,
        date: filterDate,
        status,
        checkInTime: status === 'Present' ? checkIn : undefined,
        checkOutTime: status === 'Present' ? checkOut : undefined,
        location: 'Office'
      });
      toast.success('Attendance marked successfully');
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleBulkSubmit = async () => {
    try {
      const employeesToMark = employees.map(e => e._id);
      await api.post('/api/attendance/bulk', {
        employees: employeesToMark,
        date: bulkConfig.date,
        status: bulkConfig.status
      });
      toast.success('Bulk attendance processed');
      setShowBulkModal(false);
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk marking failed');
    }
  };

  return (
    <div className="attendance-management animate-fade-in">
      <div className="page-header">
        <h2>Attendance Tracking</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowBulkModal(true)}>Bulk Mark Today</button>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="date-picker-compact"
          />
        </div>
      </div>

      <div className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <section className="glass-card">
          <h3>Mark Single Entry</h3>
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
              <label>Employee</label>
              <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                <option value="">Choose Employee...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half-Day">Half-Day</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
            {status === 'Present' && (
              <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>In</label>
                  <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Out</label>
                  <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>
            )}
            <button type="submit" className="btn-primary full-width-btn">Save Record</button>
          </form>
        </section>

        <section className="glass-card">
          <h3>Attendance List - {formatDate(filterDate)}</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>In/Out</th>
                  <th>Work Hours</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="loading">Updating records...</td></tr>
                ) : attendanceRecords.length > 0 ? attendanceRecords.map(record => (
                  <tr key={record._id}>
                    <td><strong>{record.employee?.firstName} {record.employee?.lastName}</strong><br /><small>{record.employee?.department}</small></td>
                    <td>
                      <span className={`status-badge ${record.status.toLowerCase().replace(' ', '-')}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.checkInTime || '--'} - {record.checkOutTime || '--'}</td>
                    <td>{record.workHours || '0'} hrs</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center' }}>No records found for this date.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Bulk Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Mark Attendance"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkSubmit}>Execute Bulk Marking</button>
          </>
        }
      >
        <div className="form-container">
          <p>Mark all active employees as <strong>{bulkConfig.status}</strong> for <strong>{formatDate(bulkConfig.date)}</strong>.</p>
          <div className="form-group">
            <label>Target Status</label>
            <select value={bulkConfig.status} onChange={(e) => setBulkConfig({ ...bulkConfig, status: e.target.value })}>
              <option value="Present">Present (Shift Default)</option>
              <option value="Absent">Absent</option>
              <option value="Holiday">Public Holiday</option>
            </select>
          </div>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Note: This will skip employees who already have a record for this date.</p>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceManagement;
