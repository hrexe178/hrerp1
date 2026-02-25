import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    onboardingStatus: 'Pending',
    offboardingStatus: 'Not Started',
    exitDate: '',
    exitReason: '',
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
            onboardingStatus: emp.onboardingStatus || 'Pending',
            offboardingStatus: emp.offboardingStatus || 'Not Started',
            exitDate: emp.exitDate ? emp.exitDate.split('T')[0] : '',
            exitReason: emp.exitReason || '',
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
        onboardingStatus: formData.onboardingStatus,
        offboardingStatus: formData.offboardingStatus,
        exitDate: formData.exitDate || undefined,
        exitReason: formData.exitReason,
      };
      if (id) {
        await api.put(`/api/employees/${id}`, submitData);
        toast.success('Employee updated successfully');
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
      toast.error(errorMsg);
    }
  };

  return (
    <div className="dashboard-page animate-fade-in employee-form">
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
      <form onSubmit={handleSubmit} className="form-group" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Personal Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>First Name *</label>
              <input type="text" className="modern-input" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Last Name *</label>
              <input type="text" className="modern-input" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Email *</label>
              <input type="email" className="modern-input" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Phone</label>
              <input type="text" className="modern-input" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Date of Birth</label>
              <input type="date" className="modern-input" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Gender</label>
              <select className="modern-input" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Employment Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Role / Position</label>
              <select className="modern-input" name="position" value={formData.position} onChange={handleChange}>
                <option value="">Select Position</option>
                <option value="HR Executive">HR Executive</option>
                <option value="Manager">Manager</option>
                <option value="HR">HR</option>
                <option value="Employee">Employee</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Designation</label>
              <input type="text" className="modern-input" name="designation" placeholder="e.g. Senior Developer" value={formData.designation} onChange={handleChange} />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Department</label>
              <input type="text" className="modern-input" name="department" placeholder="e.g. Engineering" value={formData.department} onChange={handleChange} />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Employment Type</label>
              <select className="modern-input" name="employmentType" value={formData.employmentType} onChange={handleChange}>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Joining Date *</label>
              <input type="date" className="modern-input" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Work Location</label>
              <input type="text" className="modern-input" name="workLocation" placeholder="e.g. New York Office" value={formData.workLocation} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Financial Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Base Salary</label>
              <input type="number" className="modern-input" name="salary" placeholder="Amount" value={formData.salary} onChange={handleChange} />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Currency</label>
              <select className="modern-input" name="currency" value={formData.currency} onChange={handleChange}>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Payment Frequency</label>
              <select className="modern-input" name="paymentFrequency" value={formData.paymentFrequency} onChange={handleChange}>
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Daily">Daily</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem', flex: '1 1 300px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Residential Address</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem'}}>Street Address</label>
                <input type="text" className="modern-input" name="street" value={formData.street} onChange={handleChange} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem'}}>City</label>
                  <input type="text" className="modern-input" name="city" value={formData.city} onChange={handleChange} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem'}}>State / Province</label>
                  <input type="text" className="modern-input" name="state" value={formData.state} onChange={handleChange} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem'}}>Country</label>
                  <input type="text" className="modern-input" name="country" value={formData.country} onChange={handleChange} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem'}}>Pin / Zip Code</label>
                  <input type="text" className="modern-input" name="pin" value={formData.pin} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem', flex: '1 1 300px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Emergency Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem'}}>Contact Name</label>
                <input type="text" className="modern-input" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem'}}>Contact Phone</label>
                <input type="text" className="modern-input" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem'}}>Relationship</label>
                <input type="text" className="modern-input" name="emergencyContactRelationship" placeholder="e.g. Spouse, Parent" value={formData.emergencyContactRelationship} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Lifecycle & Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Current Status</label>
              <select className="modern-input" name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On-Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Onboarding Tracker</label>
              <select className="modern-input" name="onboardingStatus" value={formData.onboardingStatus} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Offboarding Tracker</label>
              <select className="modern-input" name="offboardingStatus" value={formData.offboardingStatus} onChange={handleChange}>
                <option value="Not Started">Not Started</option>
                <option value="Initiated">Initiated</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {formData.offboardingStatus !== 'Not Started' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem'}}>Exit Date</label>
                <input type="date" className="modern-input" name="exitDate" value={formData.exitDate} onChange={handleChange} />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem'}}>Exit Reason / Notes</label>
                <textarea className="modern-input" name="exitReason" value={formData.exitReason} onChange={handleChange} rows="2" />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>{id ? 'Update Employee' : 'Submit & Save'}</button>
          <button type="button" className="action-btn" onClick={() => navigate('/employees')} style={{ padding: '0.75rem 2rem' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
