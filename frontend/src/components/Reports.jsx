// Analytics & reports component
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    projects: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [employees, attendance, projects] = await Promise.all([
          axios.get('http://localhost:5000/api/employees', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/attendance', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/projects', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        // Extract data arrays from API responses
        const employeesData = employees.data.data || employees.data || [];
        const attendanceData = attendance.data.data || attendance.data || [];
        const projectsData = projects.data.data || projects.data || [];

        const today = new Date().toDateString();
        const presentToday = attendanceData.filter(
          (a) => new Date(a.date).toDateString() === today && a.status === 'Present'
        ).length;

        setReportData({
          totalEmployees: employeesData.length,
          presentToday,
          onLeave: employeesData.filter((e) => e.status === 'on-leave').length,
          projects: projectsData,
        });
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="reports">
      <h1>Reports & Analytics</h1>
      <div className="reports-summary">
        <div className="report-card">
          <h3>Total Employees</h3>
          <p className="number">{reportData.totalEmployees}</p>
        </div>
        <div className="report-card">
          <h3>Present Today</h3>
          <p className="number">{reportData.presentToday}</p>
        </div>
        <div className="report-card">
          <h3>On Leave</h3>
          <p className="number">{reportData.onLeave}</p>
        </div>
      </div>
      <h2>Project Status</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Team Size</th>
          </tr>
        </thead>
        <tbody>
          {reportData.projects.map((project) => (
            <tr key={project._id}>
              <td>{project.projectName}</td>
              <td>{project.status}</td>
              <td>{project.progressPercentage}%</td>
              <td>{project.teamMembers?.length || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
