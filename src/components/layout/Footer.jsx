import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, PhoneCall } from 'lucide-react';
import logo from '../../assets/Meramot hub icon.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-container" id="footer">
      <div className="container footer-inner-wrapper">
        <div className="footer-top-grid">
          
          {/* Left: Brand & Tagline */}
          <div className="footer-brand-column">
            <Link to="/" className="footer-logo-brand">
              <img src={logo} alt="MeramotHub" className="footer-logo-img" />
            </Link>
            <p className="footer-brand-description">
              Bangladesh's premium local home service marketplace. Booking verified electricians, plumbers, and mechanics with full escrow payment protection.
            </p>
            <div className="footer-badge-tag">
              <ShieldCheck size={14} className="badge-tag-icon" />
              <span>NID-Verified & Escrow Protected</span>
            </div>
          </div>

          {/* Right: Quick Links Grouped */}
          <div className="footer-links-columns">
            <div className="footer-links-group">
              <h4 className="footer-group-title">Company</h4>
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/about" className="footer-link">About Platform</Link>
              <Link to="/services" className="footer-link">All Services</Link>
            </div>
            
            <div className="footer-links-group">
              <h4 className="footer-group-title">Vetted Professionals</h4>
              <Link to="/register" className="footer-link">Apply as Specialist</Link>
              <Link to="/login" className="footer-link">Provider Login</Link>
              <Link to="/about" className="footer-link">Code of Integrity</Link>
            </div>

            <div className="footer-links-group">
              <h4 className="footer-group-title">Contact Help</h4>
              <span className="footer-contact-item">
                <PhoneCall size={12} />
                <span>+880 1700-000000</span>
              </span>
              <span className="footer-contact-item">
                <Mail size={12} />
                <span>support@meramothub.com</span>
              </span>
            </div>
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="footer-bottom-copyright">
          <p className="copyright-text">
            © {new Date().getFullYear()} MeramotHub. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <a href="#" className="legal-link">Terms of Service</a>
            <span className="legal-dot">•</span>
            <a href="#" className="legal-link">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
