// Document manager component
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, empsRes] = await Promise.all([
        api.get('/api/documents'),
        api.get('/api/employees')
      ]);

      setDocuments(docsRes.data.data || []);
      setEmployees(empsRes.data.data || []);
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
      // Prepare data - remove empty optional fields
      const dataToSend = { ...formData };
      if (!dataToSend.employee || dataToSend.employee === '') {
        delete dataToSend.employee;
      }
      if (!dataToSend.description || dataToSend.description === '') {
        delete dataToSend.description;
      }

      console.log('Sending document data:', dataToSend);

      await api.post('/api/documents', dataToSend);
      alert('Document uploaded successfully');
      setFormData({
        name: '',
        type: 'Other',
        employee: '',
        fileUrl: '',
        description: '',
        fileType: 'Other',
      });
      // Refresh documents list
      const docsRes = await api.get('/api/documents');
      setDocuments(docsRes.data.data || []);
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
        <div className="form-group">
          <label>Document Name *</label>
          <input
            type="text"
            name="name"
            placeholder="Document Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Type *</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="Project Document">Project Document</option>
            <option value="Employee Document">Employee Document</option>
            <option value="Contract">Contract</option>
            <option value="Report">Report</option>
            <option value="Invoice">Invoice</option>
            <option value="Policy">Policy</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>File Type</label>
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
        </div>

        <div className="form-group">
          <label>Employee (Optional)</label>
          <select name="employee" value={formData.employee} onChange={handleChange}>
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName} ({emp.employeeId})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>File URL *</label>
          <input
            type="text"
            name="fileUrl"
            placeholder="File URL"
            value={formData.fileUrl}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">Upload Document</button>
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
              <td>{doc.employee ? `${doc.employee.firstName} ${doc.employee.lastName}` : '-'}</td>
              <td>{doc.uploadedBy ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` : 'Unknown'}</td>
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
