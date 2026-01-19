// Add/Edit project form component
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planning',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: {
      estimated: '',
      actual: '',
      currency: 'INR',
    },
    progressPercentage: 0,
    manager: '',
    priority: 'Medium',
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await api.get(`/api/projects/${id}`);
      const proj = response.data.data || response.data;
      setFormData({
        name: proj.name || '',
        description: proj.description || '',
        status: proj.status || 'Planning',
        startDate: proj.startDate ? proj.startDate.split('T')[0] : '',
        endDate: proj.endDate ? proj.endDate.split('T')[0] : '',
        budget: proj.budget || { estimated: '', actual: '', currency: 'INR' },
        progressPercentage: proj.progressPercentage || 0,
        manager: proj.manager?._id || '',
        priority: proj.priority || 'Medium',
      });
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('budget.')) {
      const budgetField = name.split('.')[1];
      setFormData({
        ...formData,
        budget: { ...formData.budget, [budgetField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      // Prepare data - ensure dates are proper Date objects and budget fields are numbers
      const dataToSend = {
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        progressPercentage: Number(formData.progressPercentage) || 0,
      };

      // Add optional endDate if provided
      if (formData.endDate) {
        dataToSend.endDate = new Date(formData.endDate);
      }

      // Add optional manager if provided
      if (formData.manager && formData.manager !== '') {
        dataToSend.manager = formData.manager;
      }

      // Add budget only if values are provided
      const budgetObj = {};
      if (formData.budget.estimated && formData.budget.estimated !== '') {
        budgetObj.estimated = Number(formData.budget.estimated);
      }
      if (formData.budget.actual && formData.budget.actual !== '') {
        budgetObj.actual = Number(formData.budget.actual);
      }
      if (formData.budget.currency) {
        budgetObj.currency = formData.budget.currency;
      }
      if (Object.keys(budgetObj).length > 0) {
        dataToSend.budget = budgetObj;
      }

      if (id) {
        await api.put(`/api/projects/${id}`, dataToSend);
        alert('Project updated successfully');
      } else {
        await api.post('/api/projects', dataToSend);
        alert('Project created successfully');
      }
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      const errorMsg = error.response?.data?.errors
        ? error.response.data.errors.map((e) => e.msg).join(', ')
        : error.response?.data?.message || error.message;
      alert('Error saving project: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-form">
      <h1>{id ? 'Edit Project' : 'Create Project'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Project Name *</label>
          <input
            type="text"
            name="name"
            placeholder="Project Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            placeholder="Project Description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Estimated Budget</label>
            <input
              type="number"
              name="budget.estimated"
              placeholder="Estimated Budget"
              value={formData.budget.estimated}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Actual Budget</label>
            <input
              type="number"
              name="budget.actual"
              placeholder="Actual Budget"
              value={formData.budget.actual}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Currency</label>
            <input
              type="text"
              name="budget.currency"
              placeholder="Currency"
              value={formData.budget.currency}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Progress (%)</label>
            <input
              type="number"
              name="progressPercentage"
              min="0"
              max="100"
              placeholder="Progress Percentage"
              value={formData.progressPercentage}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Project Manager</label>
          <select name="manager" value={formData.manager} onChange={handleChange}>
            <option value="">Select Project Manager</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName} ({emp.employeeId})
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Project' : 'Create Project'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/projects')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
