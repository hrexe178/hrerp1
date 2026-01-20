import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useParams } from 'react-router-dom';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/api/projects/${id}`);
        setProject(response.data.data || response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!project) return <p>Project not found</p>;

  return (
    <div className="project-details">
      <h1>{project.projectName}</h1>
      <div className="details-container">
        <p><strong>Description:</strong> {project.description}</p>
        <p><strong>Status:</strong> {project.status}</p>
        <p><strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Budget:</strong> ${project.budget}</p>
        <p><strong>Progress:</strong> {project.progressPercentage}%</p>
        <p><strong>Manager:</strong> {project.manager?.firstName} {project.manager?.lastName}</p>
        <p><strong>Priority:</strong> {project.priority}</p>
        <h3>Team Members</h3>
        <ul>
          {project.teamMembers?.map((member) => (
            <li key={member._id}>{member.firstName} {member.lastName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectDetails;
