// Document manager component
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    documentName: '',
    documentType: 'other',
    employeeId: '',
    fileURL: '',
    description: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(response.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/documents', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({
        documentName: '',
        documentType: 'other',
        employeeId: '',
        fileURL: '',
        description: '',
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="document-manager">
      <h1>Document Manager</h1>
      <form onSubmit={handleSubmit} className="document-form">
        <input
          type="text"
          name="documentName"
          placeholder="Document Name"
          value={formData.documentName}
          onChange={handleChange}
          required
        />
        <select name="documentType" value={formData.documentType} onChange={handleChange}>
          <option value="offer-letter">Offer Letter</option>
          <option value="appointment">Appointment</option>
          <option value="salary-slip">Salary Slip</option>
          <option value="other">Other</option>
        </select>
        <input
          type="text"
          name="employeeId"
          placeholder="Employee ID"
          value={formData.employeeId}
          onChange={handleChange}
        />
        <input
          type="text"
          name="fileURL"
          placeholder="File URL"
          value={formData.fileURL}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <button type="submit">Upload Document</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Document Name</th>
            <th>Type</th>
            <th>Employee</th>
            <th>Uploaded By</th>
            <th>Upload Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc._id}>
              <td>{doc.documentName}</td>
              <td>{doc.documentType}</td>
              <td>{doc.employeeId?.firstName} {doc.employeeId?.lastName}</td>
              <td>{doc.uploadedBy?.username}</td>
              <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
              <td>
                <a href={doc.fileURL} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentManager;
