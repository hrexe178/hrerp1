import React, { useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import Modal from './Modal';
import { toast } from 'react-toastify';
import './Modal.css';

const PerformanceReviewManagement = () => {
  const { user } = useContext(AuthContext);
  const [mine, setMine] = useState([]);
  const [all, setAll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'self', 'manager', 'complete', 'create'
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalData, setModalData] = useState({ text: '', rating: 3 });

  const [formData, setFormData] = useState({
    employee: '',
    reviewCycle: '',
    reviewPeriodStart: '',
    reviewPeriodEnd: '',
  });

  const canManage = ['admin', 'hr', 'manager'].includes(user?.role);
  const canCreate = ['admin', 'hr'].includes(user?.role);

  const fetchData = async () => {
    try {
      setLoading(true);
      const requests = [api.get('/api/performance-reviews/mine?limit=50')];
      if (canManage) requests.push(api.get('/api/performance-reviews?limit=100'));
      if (canCreate) requests.push(api.get('/api/employees?limit=200'));
      const responses = await Promise.all(requests);

      setMine(responses[0].data?.data || []);
      if (canManage) setAll(responses[1].data?.data || []);
      if (canCreate) setEmployees(responses[responses.length - 1].data?.data || []);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reviews');
      toast.error('Error loading performance reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const openModal = (type, review = null) => {
    setModalType(type);
    setSelectedReview(review);
    setModalData({ text: '', rating: 3 });
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    try {
      if (modalType === 'self') {
        await api.put(`/api/performance-reviews/${selectedReview._id}/self-submit`, { selfAssessment: modalData.text });
        toast.success('Self assessment submitted successfully');
      } else if (modalType === 'manager') {
        await api.put(`/api/performance-reviews/${selectedReview._id}/manager-review`, { managerAssessment: modalData.text });
        toast.success('Manager review updated');
      } else if (modalType === 'complete') {
        await api.put(`/api/performance-reviews/${selectedReview._id}/complete`, {
          finalRating: modalData.rating,
          overallRating: modalData.rating
        });
        toast.success('Review finalized and completed');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const createReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/performance-reviews', {
        employee: formData.employee,
        reviewCycle: formData.reviewCycle,
        reviewPeriod: {
          startDate: formData.reviewPeriodStart,
          endDate: formData.reviewPeriodEnd,
        },
      });
      toast.success('Performance review cycle created');
      setFormData({ employee: '', reviewCycle: '', reviewPeriodStart: '', reviewPeriodEnd: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create review');
    }
  };

  if (loading && mine.length === 0) return <div className="loading">Loading reviews...</div>;

  return (
    <div className="reports animate-fade-in">
      <div className="page-header">
        <h2>Performance Management</h2>
        <div className="role-badge">{user?.role}</div>
      </div>

      {canCreate && (
        <section className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3>Initiate New Review Cycle</h3>
          <form onSubmit={createReview} className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group">
              <label>Employee</label>
              <select value={formData.employee} onChange={(e) => setFormData((p) => ({ ...p, employee: e.target.value }))} required>
                <option value="">Select recipient</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cycle Name</label>
              <input type="text" placeholder="e.g. Annual 2026" value={formData.reviewCycle} onChange={(e) => setFormData((p) => ({ ...p, reviewCycle: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={formData.reviewPeriodStart} onChange={(e) => setFormData((p) => ({ ...p, reviewPeriodStart: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={formData.reviewPeriodEnd} onChange={(e) => setFormData((p) => ({ ...p, reviewPeriodEnd: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-primary">Create Cycle</button>
          </form>
        </section>
      )}

      <div className="dashboard-stacked-sections">
        <section className="glass-card">
          <h3>My Performance Reviews</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mine.length > 0 ? mine.map((review) => (
                  <tr key={review._id}>
                    <td><strong>{review.reviewCycle}</strong></td>
                    <td>{formatDate(review.reviewPeriod?.startDate)} - {formatDate(review.reviewPeriod?.endDate)}</td>
                    <td>
                      <span className={`status-badge ${review.status.toLowerCase().replace(' ', '-')}`}>
                        {review.status}
                      </span>
                    </td>
                    <td>
                      {review.status === 'Draft' && (
                        <button className="btn btn-primary" onClick={() => openModal('self', review)}>Submit Self-Assessment</button>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No reviews assigned to you.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {canManage && (
          <section className="glass-card">
            <h3>Team Performance Queue</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Cycle</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {all.map((review) => (
                    <tr key={review._id}>
                      <td>{review.employee?.firstName} {review.employee?.lastName}</td>
                      <td>{review.reviewCycle}</td>
                      <td>
                        <span className={`status-badge ${review.status.toLowerCase().replace(' ', '-')}`}>
                          {review.status}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        {['Submitted', 'Under Review'].includes(review.status) && (
                          <button className="btn btn-secondary" onClick={() => openModal('manager', review)}>Review</button>
                        )}
                        {['Under Review'].includes(review.status) && ['admin', 'hr'].includes(user?.role) && (
                          <button className="btn btn-primary" onClick={() => openModal('complete', review)}>Finalize</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === 'self' ? 'Submit Self-Assessment' :
            modalType === 'manager' ? 'Add Manager Feedback' :
              modalType === 'complete' ? 'Finalize Employee Rating' : ''
        }
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleModalSubmit}>Submit Changes</button>
          </>
        }
      >
        <div className="form-container">
          {modalType === 'complete' ? (
            <div className="form-group">
              <label>Overall Rating (1-5 Stars)</label>
              <div className="rating-selector" style={{ display: 'flex', gap: '10px', fontSize: '1.5rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => setModalData({ ...modalData, rating: star })}
                    style={{ color: star <= modalData.rating ? 'var(--warning)' : 'var(--text-muted)' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label>Assessment Notes</label>
              <textarea
                rows="5"
                placeholder="Type your feedback/notes here..."
                value={modalData.text}
                onChange={(e) => setModalData({ ...modalData, text: e.target.value })}
              ></textarea>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PerformanceReviewManagement;
