import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { label: 'Dashboard', path: '/', roles: ['admin', 'hr', 'manager', 'employee'] },
        { label: 'Staff Directory', path: '/employees', roles: ['admin', 'hr', 'manager'] },
        { label: 'Attendance', path: '/attendance', roles: ['admin', 'hr', 'manager'] },
        { label: 'Leave Requests', path: '/leaves', roles: ['admin', 'hr', 'manager'] },
        { label: 'Projects', path: '/projects', roles: ['admin', 'hr', 'manager', 'employee'] },
        { label: 'Documents', path: '/documents', roles: ['admin', 'hr', 'manager', 'employee'] },
        { label: 'Expenses', path: '/expenses', roles: ['admin', 'hr', 'manager', 'employee'] },
        { label: 'Performance', path: '/performance-reviews', roles: ['admin', 'hr', 'manager'] },
        { label: 'Announcements', path: '/announcements', roles: ['admin', 'hr', 'manager', 'employee'] },
        { label: 'Holidays', path: '/holidays', roles: ['admin', 'hr', 'manager', 'employee'] },
        { label: 'System Reports', path: '/reports', roles: ['admin', 'hr'] },
        { label: 'Global Settings', path: '/settings', roles: ['admin', 'hr'] },
    ];

    if (!isAuthenticated) return null;

    return (
        <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
            <div className="sidebar-container">
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo" onClick={toggleSidebar}>
                        <img src="https://ui-avatars.com/api/?name=Katalyx+Solution&background=6366f1&color=fff&size=128&bold=true" alt="KS Logo" style={{ borderRadius: '8px', width: '40px', height: '40px' }} />
                        <span>KatalyxSolution</span>
                    </Link>
                </div>

                <nav className="sidebar-menu">
                    <div className="sidebar-items">
                        {menuItems.filter(item => item.roles.includes(user?.role)).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={toggleSidebar}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user?.firstName} {user?.lastName}</div>
                            <div className="user-role">{user?.role}</div>
                        </div>
                        <NotificationBell />
                    </div>
                    <button onClick={handleLogout} className="logout-btn full-width-btn">
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
