// Employee profile/details component
import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import { useParams } from 'react-router-dom';

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployee(response.data.data || response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!employee) return <p>Employee not found</p>;

  return (
    <div className="employee-details">
      <h1>{employee.firstName} {employee.lastName}</h1>
      <div className="details-container">
        <h3>Personal Information</h3>
        <p><strong>Employee ID:</strong> {employee.employeeId}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Phone:</strong> {employee.phone || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Gender:</strong> {employee.gender || 'N/A'}</p>

        <h3>Professional Information</h3>
        <p><strong>Position:</strong> {employee.position || 'N/A'}</p>
        <p><strong>Department:</strong> {employee.department}</p>
        <p><strong>Designation:</strong> {employee.designation}</p>
        <p><strong>Employment Type:</strong> {employee.employmentType || 'N/A'}</p>
        <p><strong>Joining Date:</strong> {new Date(employee.joiningDate).toLocaleDateString()}</p>
        <p><strong>Work Location:</strong> {employee.workLocation || 'N/A'}</p>
        <p><strong>Employment Status:</strong> {employee.employmentStatus || employee.status}</p>

        <h3>Compensation</h3>
        <p><strong>Salary:</strong> {employee.salary ? `${employee.currency || 'INR'} ${employee.salary}` : 'N/A'}</p>
        <p><strong>Payment Frequency:</strong> {employee.paymentFrequency || 'N/A'}</p>

        <h3>Address</h3>
        <p><strong>Street:</strong> {employee.address?.street || 'N/A'}</p>
        <p><strong>City:</strong> {employee.address?.city || 'N/A'}</p>
        <p><strong>State:</strong> {employee.address?.state || 'N/A'}</p>
        <p><strong>Country:</strong> {employee.address?.country || 'N/A'}</p>
        <p><strong>Pin Code:</strong> {employee.address?.pin || 'N/A'}</p>

        <h3>Emergency Contact</h3>
        <p><strong>Name:</strong> {employee.emergencyContact?.name || 'N/A'}</p>
        <p><strong>Phone:</strong> {employee.emergencyContact?.phone || 'N/A'}</p>
        <p><strong>Relationship:</strong> {employee.emergencyContact?.relationship || 'N/A'}</p>
      </div>
    </div>
  );
};

export default EmployeeDetails;
