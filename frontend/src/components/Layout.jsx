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
                    <img src="/katalyx-logo.png" alt="Katalyx Solution" style={{ maxHeight: '30px', width: 'auto' }} />
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
