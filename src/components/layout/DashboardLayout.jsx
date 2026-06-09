import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';
import './DashboardLayout.css';

export default function DashboardLayout({ children, navItems, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`} id="dashboard-sidebar">
        {/* Hamburger toggle at the top */}
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          id="sidebar-toggle"
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.full_name}</div>
            <div className="sidebar-user-role">{title}</div>
          </div>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {navItems.map((section, si) => (
            <div key={si}>
              {section.label && (
                <div className="sidebar-section-title">
                  <span>{section.label}</span>
                </div>
              )}
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
