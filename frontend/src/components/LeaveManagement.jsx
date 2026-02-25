import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';
import '../styles/App.css';

const LeaveManagement = () => {
    const { user } = useContext(AuthContext);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/leaves?limit=500');
            if (res.data.success) {
                setLeaves(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch leaves');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleAction = async (id, action) => {
        try {
            setError('');
            const res = await api.put(`/api/leaves/${id}/${action}`, {
                remarks: `Action taken by ${user.role}`
            });
            if (res.data.success) {
                toast.success(`Leave request ${action}ed successfully`);
                fetchLeaves();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${action} leave`);
        }
    };

    if (loading) return <p>Loading leave requests...</p>;

    // Filter logic: Managers see Pending, HR/Admin see Manager Approved (or all)
    const filteredLeaves = leaves.filter(leave => {
        if (user.role === 'manager') return leave.status === 'Pending';
        if (user.role === 'hr' || user.role === 'admin') return ['Pending', 'Manager Approved'].includes(leave.status);
        return false;
    });

    return (
        <div className="reports">
            <h2>Leave Approval Queue</h2>
            {error && <div className="error">{error}</div>}

            <table className="table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLeaves.length > 0 ? filteredLeaves.map((leave) => (
                        <tr key={leave._id}>
                            <td data-label="Employee">{leave.employee?.firstName} {leave.employee?.lastName} ({leave.employee?.employeeId})</td>
                            <td data-label="Type">{leave.leaveType}</td>
                            <td data-label="From">{formatDate(leave.fromDate)}</td>
                            <td data-label="To">{formatDate(leave.toDate)}</td>
                            <td data-label="Days">{leave.totalDays}</td>
                            <td data-label="Reason">{leave.reason}</td>
                            <td data-label="Status">
                                <span className={`status-badge ${leave.status === 'Manager Approved' ? 'status-manager-approved' : leave.status.toLowerCase()}`}>
                                    {leave.status}
                                </span>
                            </td>
                            <td data-label="Actions">
                                <button className="btn btn-primary" onClick={() => handleAction(leave._id, 'approve')}>Approve</button>
                                <button className="btn delete-btn" onClick={() => handleAction(leave._id, 'reject')}>Reject</button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="8" style={{ textAlign: 'center' }}>No leaves pending for your approval</td></tr>
                    )}
                </tbody>
            </table>

            <h3 style={{ marginTop: '40px' }}>Recent Leave History</h3>
            <table className="table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.filter(l => ['Approved', 'Rejected', 'Cancelled'].includes(l.status)).slice(0, 10).map((leave) => (
                        <tr key={leave._id}>
                            <td data-label="Employee">{leave.employee?.firstName} {leave.employee?.lastName}</td>
                            <td data-label="Type">{leave.leaveType}</td>
                            <td data-label="From">{formatDate(leave.fromDate)}</td>
                            <td data-label="To">{formatDate(leave.toDate)}</td>
                            <td data-label="Status">
                                <span className={`status-badge ${leave.status.toLowerCase()}`}>
                                    {leave.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaveManagement;
