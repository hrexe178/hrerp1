import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="layout-root">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="mobile-nav-header">
                <div className="sidebar-logo">
                    <img src="https://ui-avatars.com/api/?name=Katalyx+Solution&background=6366f1&color=fff&size=128&bold=true" alt="KS Logo" style={{ borderRadius: '4px', width: '24px', height: '24px' }} />
                    <span>KatalyxSolution</span>
                </div>
                <button className={`hamburger ${isSidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>
            </div>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
