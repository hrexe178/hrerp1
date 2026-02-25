import React, { useContext, Suspense, lazy } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = lazy(() => import('./AdminDashboard.jsx'));
const HRDashboard = lazy(() => import('./HRDashboard.jsx'));
const ManagerDashboard = lazy(() => import('./ManagerDashboard.jsx'));
const EmployeeDashboard = lazy(() => import('./EmployeeDashboard.jsx'));

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <Suspense fallback={<div className="loading">Loading dashboard...</div>}>
      {(() => {
        if (user.role === 'admin') {
          return <AdminDashboard />;
        } else if (user.role === 'hr') {
          return <HRDashboard />;
        } else if (user.role === 'manager') {
          return <ManagerDashboard />;
        }
        return <EmployeeDashboard />;
      })()}
    </Suspense>
  );
};

export default Dashboard;
