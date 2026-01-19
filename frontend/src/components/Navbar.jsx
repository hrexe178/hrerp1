import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          📊 HR ERP System
        </Link>

        {isAuthenticated ? (
          <div className="nav-menu">
            <div className="nav-items">
              <Link to="/" className="nav-link">
                Dashboard
              </Link>
              <Link to="/employees" className="nav-link">
                Employees
              </Link>
              <Link to="/projects" className="nav-link">
                Projects
              </Link>
              <Link to="/attendance" className="nav-link">
                Attendance
              </Link>
              <Link to="/documents" className="nav-link">
                Documents
              </Link>
              {(user?.role === 'admin' || user?.role === 'hr') && (
                <Link to="/reports" className="nav-link">
                  Reports
                </Link>
              )}
            </div>

            <div className="nav-user">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">({user?.role})</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="nav-link login-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
