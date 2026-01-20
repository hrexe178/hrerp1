import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-brand">
          <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
            📊 HR ERP System
          </Link>
          {isAuthenticated && (
            <button className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          )}
        </div>

        {isAuthenticated ? (
          <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
            <div className="nav-items">
              <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
              <Link to="/employees" className="nav-link" onClick={() => setIsOpen(false)}>
                Employees
              </Link>
              <Link to="/projects" className="nav-link" onClick={() => setIsOpen(false)}>
                Projects
              </Link>
              <Link to="/attendance" className="nav-link" onClick={() => setIsOpen(false)}>
                Attendance
              </Link>
              <Link to="/documents" className="nav-link" onClick={() => setIsOpen(false)}>
                Documents
              </Link>
              {(user?.role === 'admin' || user?.role === 'hr') && (
                <Link to="/reports" className="nav-link" onClick={() => setIsOpen(false)}>
                  Reports
                </Link>
              )}
            </div>

            <div className="nav-user">
              <div className="user-info-mobile">
                <span className="user-name">{user?.firstName} {user?.lastName}</span>
                <span className="user-role">({user?.role})</span>
              </div>
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
