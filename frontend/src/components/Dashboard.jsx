import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import HRDashboard from './HRDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="loading">Loading dashboard...</div>;
  }

  // Route to the appropriate dashboard based on role
  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else if (user.role === 'hr') {
    return <HRDashboard />;
  } else if (user.role === 'manager') {
    return <ManagerDashboard />;
  }

  return <EmployeeDashboard />;
};

export default Dashboard;
