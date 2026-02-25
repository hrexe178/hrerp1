import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LayoutDashboard, Users, Clock, MailOpen, Briefcase, FileText, Receipt, Lightbulb, Mic, CalendarDays, BarChart, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { label: 'Dashboard', path: '/', roles: ['admin', 'hr', 'manager', 'employee'], icon: LayoutDashboard },
        { label: 'Staff Directory', path: '/employees', roles: ['admin', 'hr', 'manager'], icon: Users },
        { label: 'Attendance', path: '/attendance', roles: ['admin', 'hr', 'manager'], icon: Clock },
        { label: 'Leave Requests', path: '/leaves', roles: ['admin', 'hr', 'manager'], icon: MailOpen },
        { label: 'Projects', path: '/projects', roles: ['admin', 'hr', 'manager', 'employee'], icon: Briefcase },
        { label: 'Documents', path: '/documents', roles: ['admin', 'hr', 'manager', 'employee'], icon: FileText },
        { label: 'Expenses', path: '/expenses', roles: ['admin', 'hr', 'manager', 'employee'], icon: Receipt },
        { label: 'Performance', path: '/performance-reviews', roles: ['admin', 'hr', 'manager'], icon: Lightbulb },
        { label: 'Announcements', path: '/announcements', roles: ['admin', 'hr', 'manager', 'employee'], icon: Mic },
        { label: 'Holidays', path: '/holidays', roles: ['admin', 'hr', 'manager', 'employee'], icon: CalendarDays },
        { label: 'System Reports', path: '/reports', roles: ['admin', 'hr'], icon: BarChart },
        { label: 'Global Settings', path: '/settings', roles: ['admin', 'hr'], icon: Settings },
    ];

    if (!isAuthenticated) return null;

    return (
        <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
            <div className="sidebar-container">
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo" onClick={toggleSidebar}>
                        <img src="/katalyx-logo.png" alt="Katalyx Solution" style={{ maxHeight: '40px', width: 'auto' }} />
                    </Link>
                </div>

                <nav className="sidebar-menu">
                    <div className="sidebar-items">
                        {menuItems.filter(item => item.roles.includes(user?.role)).map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={toggleSidebar}
                                >
                                    <Icon size={20} className="sidebar-icon" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
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
                        <LogOut size={18} style={{ marginRight: '8px' }} />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
