import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Zap, User, Briefcase } from 'lucide-react';
import logo from '../../assets/Meramot hub icon.png';
import toast from 'react-hot-toast';
import './Auth.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-container">
        <div className="auth-visual register-visual">
          <div className="auth-visual-content">
            <div className="auth-visual-icon">
              <img src={logo} alt="MeramotHub" className="auth-logo-img" />
            </div>
            <h2>Join<br /><span>MeramotHub</span></h2>
            <p>Create your account and connect with verified service professionals across Bangladesh.</p>
            <div className="auth-visual-features">
              <div className="avf-item"><Zap size={16} /> Quick Registration</div>
              <div className="avf-item"><Zap size={16} /> Free for Customers</div>
              <div className="avf-item"><Zap size={16} /> Start Earning Today</div>
            </div>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h1>Create Account</h1>
              <p>Fill in your details to get started</p>
            </div>

            {/* Role Selection */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${formData.role === 'customer' ? 'active' : ''}`}
                onClick={() => update('role', 'customer')}
                id="role-customer"
              >
                <User size={20} />
                <span>Customer</span>
                <small>Book services</small>
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'service_provider' ? 'active' : ''}`}
                onClick={() => update('role', 'service_provider')}
                id="role-provider"
              >
                <Briefcase size={20} />
                <span>Service Provider</span>
                <small>Offer services</small>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" id="register-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => update('full_name', e.target.value)}
                  required
                  id="register-name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="01XXXXXXXXX"
                  value={formData.phone_number}
                  onChange={(e) => update('phone_number', e.target.value)}
                  required
                  id="register-phone"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  id="register-email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => update('password', e.target.value)}
                    required
                    id="register-password"
                  />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={loading}
                id="register-submit"
              >
                {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
