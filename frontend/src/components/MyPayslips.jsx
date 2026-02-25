import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const MyPayslips = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/payroll/mine?limit=100');
        setRows(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payslips');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-page animate-fade-in reports">
      <h2>My Payslips</h2>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div>Loading payslips...</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Status</th>
                <th>Gross</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td data-label="Month">{row.month}</td>
                  <td data-label="Year">{row.year}</td>
                  <td data-label="Status">
                    <span className={`status-badge ${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td data-label="Gross">${row.grossSalary || 0}</td>
                  <td data-label="Net">${row.netSalary || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyPayslips;
