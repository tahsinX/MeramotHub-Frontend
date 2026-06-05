import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu, X, Wrench, LogOut, User, LayoutDashboard,
  ChevronDown, Zap, Sun, Moon
} from 'lucide-react';
import './Navbar.css';

export default function Navbar({ isDashboard }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = ['/customer', '/provider', '/admin', '/manager'].some(
    (p) => location.pathname.startsWith(p)
  );

  // Dark/Light Theme State
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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

  const getProfilePath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/profile';
      case 'area_manager': return '/manager/profile';
      case 'service_provider': return '/provider/account';
      default: return '/customer/profile';
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
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
        <div className="navbar-inner container">
          {/* Logo */}
          <Link to="/" className="navbar-logo" id="navbar-logo">
            <div className="logo-icon">
              <Wrench size={16} />
            </div>
            <span>
              <span className="logo-text-meramot">Meramot</span>
              <span className="logo-text-hub">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {!isDashboard && (
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
          )}

          {/* Right side actions */}
          <div className="navbar-actions">
            {/* Theme Toggle */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

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
                  <ChevronDown size={14} className={`chevron ${profileOpen ? 'open' : ''}`} />
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
                        <LayoutDashboard size={14} />
                        Dashboard
                      </Link>
                      <Link to={getDashboardPath()} className="dropdown-item">
                        <User size={14} />
                        My Profile
                      </Link>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item danger" onClick={handleLogout}>
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm signin-link" id="login-btn">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="register-btn">
                  <Zap size={14} />
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            {!isDashboard && (
              <button
                className="mobile-hamburger"
                onClick={() => setMobileOpen(!mobileOpen)}
                id="mobile-menu-toggle"
                aria-label="Toggle navigation menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
          <span className="logo-text">
            Meramot<span className="logo-accent">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        {!isDashboard && (
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
        )}

        {/* Right side */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} className="btn btn-outline btn-lg" style={{ width: '100%' }}>
                Dashboard
              </Link>
              <button className="btn btn-outline btn-lg danger" onClick={handleLogout} style={{ width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                Sign Out
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
                    <Link to={getProfilePath()} className="dropdown-item">
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
              <Link to="/login" className="btn btn-outline btn-lg" style={{ width: '100%' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu" id="mobile-menu">
          {!isDashboard && (
            <>
              <Link to="/" className="mobile-link">Home</Link>
              <Link to="/services" className="mobile-link">Services</Link>
              <Link to="/about" className="mobile-link">About</Link>
            </>
          )}
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} className="mobile-link">Dashboard</Link>
              <Link to={getProfilePath()} className="mobile-link">Profile</Link>
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
/*end of file */