// Project management component
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
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
        alert('Project deleted successfully');
        fetchProjects();
      } catch (err) {
        alert('Error deleting project: ' + err.message);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="project-management">
      <h1>Projects</h1>
      <Link to="/projects/create" className="btn">
        Create Project
      </Link>
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
          {projects.map((project) => (
            <tr key={project._id}>
              <td>{project.name || project.projectName}</td>
              <td>{project.status}</td>
              <td>{new Date(project.startDate).toLocaleDateString()}</td>
              <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</td>
              <td>{project.progressPercentage}%</td>
              <td>{project.manager?.firstName} {project.manager?.lastName}</td>
              <td>
                <Link to={`/projects/${project._id}`} className="action-link">View</Link>
                <Link to={`/projects/${project._id}/edit`} className="action-link">Edit</Link>
                <button onClick={() => handleDelete(project._id)} className="action-btn delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectManagement;
