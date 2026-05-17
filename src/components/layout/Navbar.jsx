import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu, X, Wrench, LogOut, User, LayoutDashboard,
  ChevronDown, Zap
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'area_manager': return '/manager';
      case 'service_provider': return '/provider';
      default: return '/customer';
    }
  };

  const getRoleName = () => {
    if (!user) return '';
    const map = {
      customer: 'Customer',
      service_provider: 'Service Provider',
      area_manager: 'Area Manager',
      admin: 'Admin',
    };
    return map[user.role] || user.role;
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <div className="logo-icon">
            <Wrench size={22} />
          </div>
          <span className="logo-text">
            Meramot<span className="logo-accent">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/services" className={`nav-link ${location.pathname.startsWith('/services') ? 'active' : ''}`}>
            Services
          </Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
            About
          </Link>
        </div>

        {/* Right side */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="profile-menu">
              <button
                className="profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
                id="profile-menu-trigger"
              >
                <div className="profile-avatar">
                  {user.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="profile-info">
                  <span className="profile-name">{user.full_name}</span>
                  <span className="profile-role">{getRoleName()}</span>
                </div>
                <ChevronDown size={16} className={`chevron ${profileOpen ? 'open' : ''}`} />
              </button>

              {profileOpen && (
                <>
                  <div className="profile-overlay" onClick={() => setProfileOpen(false)} />
                  <div className="profile-dropdown" id="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        {user.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="dropdown-name">{user.full_name}</div>
                        <div className="dropdown-phone">{user.phone_number}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to={getDashboardPath()} className="dropdown-item">
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <Link to={getDashboardPath()} className="dropdown-item">
                      <User size={16} />
                      My Profile
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" id="login-btn">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="register-btn">
                <Zap size={16} />
                Get Started
              </Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu" id="mobile-menu">
          <Link to="/" className="mobile-link">Home</Link>
          <Link to="/services" className="mobile-link">Services</Link>
          <Link to="/about" className="mobile-link">About</Link>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} className="mobile-link">Dashboard</Link>
              <button className="mobile-link danger" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link">Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{ margin: '8px 24px' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
