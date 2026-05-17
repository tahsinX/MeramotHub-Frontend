import { Link } from 'react-router-dom';
import { Wrench, Phone, Mail, MapPin, Heart } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="footer-content container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon"><Wrench size={20} /></div>
              <span>Meramot<span className="logo-accent">Hub</span></span>
            </Link>
            <p className="footer-desc">
              Connecting local service providers with customers across Bangladesh. 
              Trusted, verified, and transparent services at your fingertips.
            </p>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <Phone size={14} />
                <span>+880 1700-000001</span>
              </div>
              <div className="footer-contact-item">
                <Mail size={14} />
                <span>support@meramothub.com</span>
              </div>
              <div className="footer-contact-item">
                <MapPin size={14} />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/services" className="footer-link">Services</Link>
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/register" className="footer-link">Register</Link>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4>Services</h4>
            <Link to="/services" className="footer-link">Electrical</Link>
            <Link to="/services" className="footer-link">Plumbing</Link>
            <Link to="/services" className="footer-link">AC Repair</Link>
            <Link to="/services" className="footer-link">Carpentry</Link>
            <Link to="/services" className="footer-link">Painting</Link>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4>Support</h4>
            <Link to="/about" className="footer-link">Help Center</Link>
            <Link to="/about" className="footer-link">Privacy Policy</Link>
            <Link to="/about" className="footer-link">Terms of Service</Link>
            <Link to="/about" className="footer-link">Contact Us</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MeramotHub. All rights reserved.</p>
          <p className="footer-made">
            Made with <Heart size={14} className="heart-icon" /> in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
