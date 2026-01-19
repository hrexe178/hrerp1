// Document manager component
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Other',
    employee: '',
    fileUrl: '',
    description: '',
    fileType: 'Other',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/documents', {
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

      // Prepare data - remove empty optional fields
      const dataToSend = { ...formData };
      if (!dataToSend.employee || dataToSend.employee === '') {
        delete dataToSend.employee;
      }
      if (!dataToSend.description || dataToSend.description === '') {
        delete dataToSend.description;
      }

      console.log('Sending document data:', dataToSend);

      await axios.post('http://localhost:5000/api/documents', dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Document uploaded successfully');
      setFormData({
        name: '',
        type: 'Other',
        employee: '',
        fileUrl: '',
        description: '',
        fileType: 'Other',
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMsg = error.response?.data?.errors
        ? error.response.data.errors.map((e) => e.msg).join(', ')
        : error.response?.data?.message || error.message;
      alert('Error uploading document: ' + errorMsg);
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
          name="name"
          placeholder="Document Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="Project Document">Project Document</option>
          <option value="Employee Document">Employee Document</option>
          <option value="Contract">Contract</option>
          <option value="Report">Report</option>
          <option value="Invoice">Invoice</option>
          <option value="Policy">Policy</option>
          <option value="Other">Other</option>
        </select>
        <select name="fileType" value={formData.fileType} onChange={handleChange}>
          <option value="PDF">PDF</option>
          <option value="DOC">DOC</option>
          <option value="DOCX">DOCX</option>
          <option value="XLS">XLS</option>
          <option value="XLSX">XLSX</option>
          <option value="PPT">PPT</option>
          <option value="PPTX">PPTX</option>
          <option value="Image">Image</option>
          <option value="Video">Video</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          name="employee"
          placeholder="Employee ID (optional)"
          value={formData.employee}
          onChange={handleChange}
        />
        <input
          type="text"
          name="fileUrl"
          placeholder="File URL"
          value={formData.fileUrl}
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
              <td>{doc.name}</td>
              <td>{doc.type}</td>
              <td>{doc.employee?.firstName} {doc.employee?.lastName}</td>
              <td>{doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}</td>
              <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
              <td>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
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
