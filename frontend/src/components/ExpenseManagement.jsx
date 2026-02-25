import React, { useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';

const ExpenseManagement = () => {
  const { user } = useContext(AuthContext);
  const [myExpenses, setMyExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [reportFilters, setReportFilters] = useState({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: 'Travel',
    amount: '',
    description: '',
    receiptUrl: '',
  });

  const canApprove = ['admin', 'hr', 'manager'].includes(user?.role);

  const fetchData = async () => {
    try {
      setLoading(true);
      const requests = [api.get('/api/expenses/mine?limit=50')];
      if (canApprove) requests.push(api.get('/api/expenses?limit=100'));
      const [mineResponse, allResponse] = await Promise.all(requests);
      setMyExpenses(mineResponse.data?.data || []);
      setAllExpenses(allResponse?.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const submitExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/expenses', formData);
      toast.success('Expense submitted successfully');
      setFormData({ category: 'Travel', amount: '', description: '', receiptUrl: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit expense');
    }
  };

  const actionExpense = async (id, action) => {
    try {
      await api.put(`/api/expenses/${id}/${action}`);
      toast.success(`Expense ${action}ed successfully`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} expense`);
    }
  };

  const fetchMonthlyReport = async () => {
    try {
      const response = await api.get(`/api/expenses/report/monthly?month=${reportFilters.month}&year=${reportFilters.year}`);
      setMonthlyReport(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load monthly report');
    }
  };

  const exportMonthlyCsv = () => {
    if (monthlyReport.length === 0) return;
    const header = ['Employee ID', 'Employee Name', 'Department', 'Total Amount', 'Total Count', 'Approved Amount', 'Paid Amount'];
    const rows = monthlyReport.map((row) => [
      row.employeeId || '',
      row.employeeName || '',
      row.department || '',
      row.totalAmount || 0,
      row.totalCount || 0,
      row.approvedAmount || 0,
      row.paidAmount || 0,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-report-${reportFilters.year}-${reportFilters.month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports">
      <h2>Expense & Reimbursement</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={submitExpense}>
        <h3>Submit Expense</h3>
        <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}>
          <option value="Travel">Travel</option>
          <option value="Meals">Meals</option>
          <option value="Supplies">Supplies</option>
          <option value="Medical">Medical</option>
          <option value="Internet">Internet</option>
          <option value="Training">Training</option>
          <option value="Other">Other</option>
        </select>
        <input type="number" min="0.01" step="0.01" placeholder="Amount" value={formData.amount} onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))} required />
        <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} required />
        <input type="url" placeholder="Receipt URL (optional)" value={formData.receiptUrl} onChange={(e) => setFormData((p) => ({ ...p, receiptUrl: e.target.value }))} />
        <button type="submit">Submit</button>
      </form>

      <h3>My Expenses</h3>
      {loading ? <div>Loading...</div> : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {myExpenses.map((expense) => (
              <tr key={expense._id}>
                <td data-label="Date">{formatDate(expense.submittedOn)}</td>
                <td data-label="Category">{expense.category}</td>
                <td data-label="Amount">{expense.amount}</td>
                <td data-label="Status">
                  <span className={`status-badge ${expense.status === 'Manager Approved' ? 'status-manager-approved' : expense.status.toLowerCase()}`}>
                    {expense.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {canApprove && (
        <>
          <h3>Approval Queue</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allExpenses.map((expense) => (
                <tr key={expense._id}>
                  <td data-label="Employee">{expense.employee?.employeeId}</td>
                  <td data-label="Category">{expense.category}</td>
                  <td data-label="Amount">{expense.amount}</td>
                  <td data-label="Status">
                    <span className={`status-badge ${expense.status === 'Manager Approved' ? 'status-manager-approved' : expense.status.toLowerCase()}`}>
                      {expense.status}
                    </span>
                  </td>
                  <td data-label="Actions">
                    {['Pending', 'Manager Approved'].includes(expense.status) && (
                      <>
                        <button className="btn" onClick={() => actionExpense(expense._id, 'approve')}>Approve</button>
                        <button className="btn" onClick={() => actionExpense(expense._id, 'reject')}>Reject</button>
                      </>
                    )}
                    {expense.status === 'Approved' && (
                      <button className="btn" onClick={() => actionExpense(expense._id, 'pay')}>Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Monthly Expense Report</h3>
          <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
            <input
              type="number"
              min="1"
              max="12"
              placeholder="Month"
              value={reportFilters.month}
              onChange={(e) => setReportFilters((p) => ({ ...p, month: e.target.value }))}
            />
            <input
              type="number"
              min="2000"
              max="2100"
              placeholder="Year"
              value={reportFilters.year}
              onChange={(e) => setReportFilters((p) => ({ ...p, year: e.target.value }))}
            />
            <button className="btn" onClick={fetchMonthlyReport}>Load Report</button>
            <button className="btn" onClick={exportMonthlyCsv}>Export CSV</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Total</th>
                <th>Count</th>
                <th>Approved</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {monthlyReport.map((row, index) => (
                <tr key={`${row.employeeId}-${index}`}>
                  <td data-label="Employee">{row.employeeId} - {row.employeeName}</td>
                  <td data-label="Department">{row.department || '-'}</td>
                  <td data-label="Total">{row.totalAmount}</td>
                  <td data-label="Count">{row.totalCount}</td>
                  <td data-label="Approved">{row.approvedAmount}</td>
                  <td data-label="Paid">{row.paidAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ExpenseManagement;
