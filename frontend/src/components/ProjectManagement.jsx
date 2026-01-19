// Project management component
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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
              <td>{project.projectName}</td>
              <td>{project.status}</td>
              <td>{new Date(project.startDate).toLocaleDateString()}</td>
              <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</td>
              <td>{project.progressPercentage}%</td>
              <td>{project.manager?.firstName} {project.manager?.lastName}</td>
              <td>
                <Link to={`/projects/${project._id}`}>View</Link>
                <Link to={`/projects/${project._id}/edit`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectManagement;
