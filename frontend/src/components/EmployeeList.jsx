// Employee list component
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        const token = localStorage.getItem('token');
        await axios.delete(`/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Employee deleted successfully');
        fetchEmployees();
      } catch (err) {
        alert('Error deleting employee: ' + err.message);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="employee-list">
      <h1>Employees</h1>
      <Link to="/employees/create" className="btn">
        Add Employee
      </Link>
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
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td>{employee.employeeId}</td>
              <td>{employee.firstName} {employee.lastName}</td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
              <td>{employee.designation}</td>
              <td>{employee.employmentStatus || employee.status}</td>
              <td>
                <Link to={`/employees/${employee._id}`} className="action-link">View</Link>
                <Link to={`/employees/${employee._id}/edit`} className="action-link">Edit</Link>
                <button onClick={() => handleDelete(employee._id)} className="action-btn delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
