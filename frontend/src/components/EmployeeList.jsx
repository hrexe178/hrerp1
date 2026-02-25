// Employee list component
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees?limit=500');
      setEmployees(response.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/api/employees/${id}`);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (err) {
        toast.error('Error deleting employee: ' + err.message);
      }
    }
  };

  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
  const statuses = [...new Set(employees.map(emp => emp.employmentStatus || emp.status).filter(Boolean))];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter ? emp.department === departmentFilter : true;
    const empStatus = emp.employmentStatus || emp.status;
    const matchesStatus = statusFilter ? empStatus === statusFilter : true;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const exportCsv = () => {
    const headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Department', 'Designation', 'Status'];
    const rows = filteredEmployees.map(emp => [
      emp.employeeId,
      emp.firstName,
      emp.lastName,
      emp.email,
      emp.department,
      emp.designation,
      emp.employmentStatus || emp.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employees_export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="employee-list">
      <h1>Employees</h1>

      <div className="filters-container glass-card" style={{ marginBottom: '20px', padding: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by Name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '1 1 200px' }}
        />
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        <button onClick={exportCsv} className="btn" style={{ marginLeft: 'auto' }}>Export CSV</button>
        <Link to="/employees/create" className="btn btn-primary">
          Add Employee
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length > 0 ? filteredEmployees.map((employee) => (
            <tr key={employee._id}>
              <td data-label="Employee ID">{employee.employeeId}</td>
              <td data-label="Name">{employee.firstName} {employee.lastName}</td>
              <td data-label="Email">{employee.email}</td>
              <td data-label="Department">{employee.department}</td>
              <td data-label="Designation">{employee.designation}</td>
              <td data-label="Status">{employee.employmentStatus || employee.status}</td>
              <td data-label="Actions">
                <Link to={`/employees/${employee._id}`} className="action-link">View</Link>
                <Link to={`/employees/${employee._id}/edit`} className="action-link">Edit</Link>
                <button onClick={() => handleDelete(employee._id)} className="action-btn delete-btn">Delete</button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No employees found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
