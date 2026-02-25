// Main App component
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

// Lazy load components
const Login = lazy(() => import('./components/Login'));
const Dashboard = lazy(() => import('./components/Dashboard.jsx'));
const EmployeeList = lazy(() => import('./components/EmployeeList'));
const EmployeeForm = lazy(() => import('./components/EmployeeForm'));
const EmployeeDetails = lazy(() => import('./components/EmployeeDetails'));
const LeaveManagement = lazy(() => import('./components/LeaveManagement'));
const AttendanceManagement = lazy(() => import('./components/AttendanceManagement'));
const ProjectManagement = lazy(() => import('./components/ProjectManagement'));
const ProjectForm = lazy(() => import('./components/ProjectForm'));
const ProjectDetails = lazy(() => import('./components/ProjectDetails'));
const DocumentManager = lazy(() => import('./components/DocumentManager'));
const Reports = lazy(() => import('./components/Reports'));
const MyProfile = lazy(() => import('./components/MyProfile'));
const MyAttendance = lazy(() => import('./components/MyAttendance'));
const MyLeaves = lazy(() => import('./components/MyLeaves'));
const MyPayslips = lazy(() => import('./components/MyPayslips'));
const ExpenseManagement = lazy(() => import('./components/ExpenseManagement'));
const ShiftManagement = lazy(() => import('./components/ShiftManagement'));
const PerformanceReviewManagement = lazy(() => import('./components/PerformanceReviewManagement'));
const AnnouncementManagement = lazy(() => import('./components/AnnouncementManagement'));
const HolidayManagement = lazy(() => import('./components/HolidayManagement'));
const AuditLogs = lazy(() => import('./components/AuditLogs'));
const GlobalSettings = lazy(() => import('./components/GlobalSettings'));


const LoadingFallback = () => (
  <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0F172A', color: 'white' }}>
    <div className="loading-spinner">Loading KatalyxSolution...</div>
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<LoadingFallback />}>
    <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Navigate to="/dashboard" />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <Layout>
              <EmployeeList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/create"
        element={
          <ProtectedRoute>
            <Layout>
              <EmployeeForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <EmployeeDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <EmployeeForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Layout>
              <AttendanceManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaves"
        element={
          <ProtectedRoute>
            <Layout>
              <LeaveManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/create"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Layout>
              <DocumentManager />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-profile"
        element={
          <ProtectedRoute>
            <Layout>
              <MyProfile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-attendance"
        element={
          <ProtectedRoute>
            <Layout>
              <MyAttendance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-leaves"
        element={
          <ProtectedRoute>
            <Layout>
              <MyLeaves />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-payslips"
        element={
          <ProtectedRoute>
            <Layout>
              <MyPayslips />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Layout>
              <ExpenseManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shifts"
        element={
          <ProtectedRoute>
            <Layout>
              <ShiftManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/performance-reviews"
        element={
          <ProtectedRoute>
            <Layout>
              <PerformanceReviewManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <Layout>
              <AnnouncementManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/holidays"
        element={
          <ProtectedRoute>
            <Layout>
              <HolidayManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <Layout>
              <AuditLogs />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <GlobalSettings />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  </Suspense>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
