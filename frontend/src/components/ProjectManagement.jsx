// Project management component
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects?limit=500');
      setProjects(response.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/api/projects/${id}`);
        toast.success('Project deleted successfully');
        fetchProjects();
      } catch (err) {
        toast.error('Error deleting project: ' + err.message);
      }
    }
  };

  const statuses = [...new Set(projects.map(p => p.status).filter(Boolean))];

  const filteredProjects = projects.filter((project) => {
    const nameStr = (project.name || project.projectName || '').toLowerCase();
    const managerStr = `${project.manager?.firstName || ''} ${project.manager?.lastName || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = nameStr.includes(searchLower) || managerStr.includes(searchLower);
    const matchesStatus = statusFilter ? project.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const exportCsv = () => {
    const headers = ['Project Name', 'Status', 'Start Date', 'End Date', 'Progress', 'Manager'];
    const rows = filteredProjects.map(project => [
      project.name || project.projectName || '',
      project.status,
      new Date(project.startDate).toLocaleDateString(),
      project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A',
      `${project.progressPercentage}%`,
      `${project.manager?.firstName || ''} ${project.manager?.lastName || ''}`.trim()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'projects_export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="dashboard-page animate-fade-in project-management">
      <h1>Projects</h1>

      <div className="filters-container glass-card" style={{ marginBottom: '20px', padding: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by Project or Manager..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '1 1 200px' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        <button onClick={exportCsv} className="btn" style={{ marginLeft: 'auto' }}>Export CSV</button>
        <Link to="/projects/create" className="btn btn-primary">
          Create Project
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Progress</th>
              <th>Manager</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? filteredProjects.map((project) => (
              <tr key={project._id}>
                <td data-label="Project Name">{project.name || project.projectName}</td>
                <td data-label="Status">{project.status}</td>
                <td data-label="Start Date">{new Date(project.startDate).toLocaleDateString()}</td>
                <td data-label="End Date">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</td>
                <td data-label="Progress">{project.progressPercentage}%</td>
                <td data-label="Manager">{project.manager?.firstName} {project.manager?.lastName}</td>
                <td data-label="Actions">
                  <Link to={`/projects/${project._id}`} className="action-link">View</Link>
                  <Link to={`/projects/${project._id}/edit`} className="action-link">Edit</Link>
                  <button onClick={() => handleDelete(project._id)} className="action-btn delete-btn">Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>No projects found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectManagement;
