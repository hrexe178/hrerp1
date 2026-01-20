import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [credentials, setCredentials] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    position: '',
    designation: '',
    department: '',
    employmentType: 'Full-Time',
    joiningDate: '',
    workLocation: '',
    salary: '',
    currency: 'INR',
    paymentFrequency: 'Monthly',
    street: '',
    city: '',
    state: '',
    country: '',
    pin: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    status: 'Active',
  });

  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        try {
          const response = await api.get(`/api/employees/${id}`);
          const emp = response.data.data || response.data;
          setFormData({
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            email: emp.email || '',
            phone: emp.phone || '',
            dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
            gender: emp.gender || '',
            position: emp.position || '',
            designation: emp.designation || '',
            department: emp.department || '',
            employmentType: emp.employmentType || 'Full-Time',
            joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
            workLocation: emp.workLocation || '',
            salary: emp.salary || '',
            currency: emp.currency || 'INR',
            paymentFrequency: emp.paymentFrequency || 'Monthly',
            street: emp.address?.street || '',
            city: emp.address?.city || '',
            state: emp.address?.state || '',
            country: emp.address?.country || '',
            pin: emp.address?.pin || '',
            emergencyContactName: emp.emergencyContact?.name || '',
            emergencyContactPhone: emp.emergencyContact?.phone || '',
            emergencyContactRelationship: emp.emergencyContact?.relationship || '',
            status: emp.employmentStatus || 'Active',
          });
        } catch (error) {
          console.error('Error fetching employee:', error);
        }
      };
      fetchEmployee();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        position: formData.position,
        designation: formData.designation,
        department: formData.department,
        employmentType: formData.employmentType,
        joiningDate: formData.joiningDate,
        workLocation: formData.workLocation,
        salary: formData.salary,
        currency: formData.currency,
        paymentFrequency: formData.paymentFrequency,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pin: formData.pin,
        },
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        },
        employmentStatus: formData.status,
      };
      if (id) {
        await api.put(`/api/employees/${id}`, submitData);
        alert('Employee updated successfully');
        navigate('/employees');
      } else {
        const response = await api.post('/api/employees', submitData);
        if (response.data.credentials) {
          setCredentials(response.data.credentials);
        } else {
          navigate('/employees');
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      const errorMsg = error.response?.data?.errors
        ? error.response.data.errors.map((e) => e.msg).join(', ')
        : error.response?.data?.message || 'Error saving employee';
      alert(errorMsg);
    }
  };

  return (
    <div className="employee-form">
      {credentials && (
        <div className="credentials-modal">
          <div className="credentials-content">
            <h2>✅ Account Created Successfully!</h2>
            <p>Credentials have been generated for the new employee:</p>
            <div className="credentials-box">
              <p><strong>Position:</strong> {credentials.position}</p>
              <p><strong>Role:</strong> {credentials.role}</p>
              <p><strong>Email:</strong> {credentials.email}</p>
              <p><strong>Temporary Password:</strong> <code>{credentials.tempPassword}</code></p>
            </div>
            <p className="warning">⚠️ Please share these credentials with the employee. They should change the password on first login.</p>
            <button onClick={() => navigate('/employees')} className="btn">Done</button>
          </div>
        </div>
      )}
      <h1>{id ? 'Edit Employee' : 'Add Employee'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dateOfBirth"
          placeholder="Date of Birth"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <select
          name="position"
          value={formData.position}
          onChange={handleChange}
        >
          <option value="">Select Position</option>
          <option value="HR Executive">HR Executive</option>
          <option value="Manager">Manager</option>
          <option value="HR">HR</option>
          <option value="Employee">Employee</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={formData.designation}
          onChange={handleChange}
        />
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
        />
        <select
          name="employmentType"
          value={formData.employmentType}
          onChange={handleChange}
        >
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Contract">Contract</option>
          <option value="Intern">Intern</option>
        </select>
        <input
          type="date"
          name="joiningDate"
          value={formData.joiningDate}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="workLocation"
          placeholder="Work Location"
          value={formData.workLocation}
          onChange={handleChange}
        />
        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
        />
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
        >
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
        <select
          name="paymentFrequency"
          value={formData.paymentFrequency}
          onChange={handleChange}
        >
          <option value="Monthly">Monthly</option>
          <option value="Weekly">Weekly</option>
          <option value="Bi-weekly">Bi-weekly</option>
          <option value="Daily">Daily</option>
        </select>

        <h3>Address</h3>
        <input
          type="text"
          name="street"
          placeholder="Street"
          value={formData.street}
          onChange={handleChange}
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
        />
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
        />
        <input
          type="text"
          name="pin"
          placeholder="Pin Code"
          value={formData.pin}
          onChange={handleChange}
        />

        <h3>Emergency Contact</h3>
        <input
          type="text"
          name="emergencyContactName"
          placeholder="Emergency Contact Name"
          value={formData.emergencyContactName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="emergencyContactPhone"
          placeholder="Emergency Contact Phone"
          value={formData.emergencyContactPhone}
          onChange={handleChange}
        />
        <input
          type="text"
          name="emergencyContactRelationship"
          placeholder="Relationship"
          value={formData.emergencyContactRelationship}
          onChange={handleChange}
        />

        <h3>Status</h3>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="On-Leave">On Leave</option>
          <option value="Fired">Fired</option>
          <option value="Terminated">Terminated</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default EmployeeForm;
