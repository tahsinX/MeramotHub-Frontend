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
      {/* Mobile sidebar toggle */}
      <button
        className="sidebar-mobile-toggle btn btn-ghost btn-icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        id="sidebar-toggle"
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`} id="dashboard-sidebar">
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
                <div className="sidebar-section-title">{section.label}</div>
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
