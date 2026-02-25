import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    address: { street: '', city: '', state: '', pin: '', country: '' },
    emergencyContact: { name: '', phone: '', relationship: '' },
    bankDetails: { accountNumber: '', ifsc: '', bankName: '', accountHolderName: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/employees/me');
      const data = response.data.data;
      setProfile(data);
      setFormData({
        phone: data.phone || '',
        address: data.address || { street: '', city: '', state: '', pin: '', country: '' },
        emergencyContact: data.emergencyContact || { name: '', phone: '', relationship: '' },
        bankDetails: data.bankDetails || { accountNumber: '', ifsc: '', bankName: '', accountHolderName: '' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setMessage('');
      const response = await api.put('/api/employees/me', formData);
      setProfile(response.data.data);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="employee-list">Loading profile...</div>;

  return (
    <div className="employee-list">
      <h2>My Profile</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {profile && (
        <div className="details-container" style={{ marginBottom: '1rem' }}>
          <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
          <p><strong>Employee ID:</strong> {profile.employeeId}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Department:</strong> {profile.department || '-'}</p>
          <p><strong>Position:</strong> {profile.position || '-'}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <h3>Contact</h3>
        <input type="text" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />

        <h3>Address</h3>
        <input type="text" placeholder="Street" value={formData.address.street || ''} onChange={(e) => handleNestedChange('address', 'street', e.target.value)} />
        <input type="text" placeholder="City" value={formData.address.city || ''} onChange={(e) => handleNestedChange('address', 'city', e.target.value)} />
        <input type="text" placeholder="State" value={formData.address.state || ''} onChange={(e) => handleNestedChange('address', 'state', e.target.value)} />
        <input type="text" placeholder="PIN" value={formData.address.pin || ''} onChange={(e) => handleNestedChange('address', 'pin', e.target.value)} />
        <input type="text" placeholder="Country" value={formData.address.country || ''} onChange={(e) => handleNestedChange('address', 'country', e.target.value)} />

        <h3>Emergency Contact</h3>
        <input type="text" placeholder="Name" value={formData.emergencyContact.name || ''} onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)} />
        <input type="text" placeholder="Phone" value={formData.emergencyContact.phone || ''} onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)} />
        <input type="text" placeholder="Relationship" value={formData.emergencyContact.relationship || ''} onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)} />

        <h3>Bank Details</h3>
        <input type="text" placeholder="Account Number" value={formData.bankDetails.accountNumber || ''} onChange={(e) => handleNestedChange('bankDetails', 'accountNumber', e.target.value)} />
        <input type="text" placeholder="IFSC" value={formData.bankDetails.ifsc || ''} onChange={(e) => handleNestedChange('bankDetails', 'ifsc', e.target.value)} />
        <input type="text" placeholder="Bank Name" value={formData.bankDetails.bankName || ''} onChange={(e) => handleNestedChange('bankDetails', 'bankName', e.target.value)} />
        <input type="text" placeholder="Account Holder Name" value={formData.bankDetails.accountHolderName || ''} onChange={(e) => handleNestedChange('bankDetails', 'accountHolderName', e.target.value)} />

        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
};

export default MyProfile;
