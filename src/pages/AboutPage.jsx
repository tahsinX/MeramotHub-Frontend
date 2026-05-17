import { Shield, Users, Zap, MapPin, Star, Heart, Award, Target } from 'lucide-react';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <span className="section-tag">About MeramotHub</span>
            <h1>Making Home Services <br /><span className="gradient-text">Trustworthy & Accessible</span></h1>
            <p>
              We connect verified local service providers with customers across Bangladesh,
              ensuring transparent pricing, secure payments, and quality service delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-card">
              <div className="about-card-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Target size={28} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To empower local service workers by giving them a digital platform to showcase
                their skills and connect with customers who need them, while ensuring fair
                compensation and quality assurance.
              </p>
            </div>
            <div className="about-card">
              <div className="about-card-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <Award size={28} />
              </div>
              <h3>Our Vision</h3>
              <p>
                To become Bangladesh's most trusted home service marketplace, where every
                service provider is verified, every price is transparent, and every customer
                is satisfied.
              </p>
            </div>
            <div className="about-card">
              <div className="about-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Heart size={28} />
              </div>
              <h3>Our Values</h3>
              <p>
                Trust through verification, fairness through escrow payments, and excellence
                through continuous quality monitoring and customer feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It's Different */}
      <section className="section" style={{ background: 'var(--bg-tertiary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why MeramotHub</span>
            <h2 className="section-title">What Makes Us Different</h2>
          </div>
          <div className="diff-grid">
            <div className="diff-item">
              <Shield size={24} color="var(--primary-600)" />
              <div>
                <h4>NID-Verified Workers</h4>
                <p>Every service provider is verified by our area managers through national ID verification.</p>
              </div>
            </div>
            <div className="diff-item">
              <Zap size={24} color="var(--primary-600)" />
              <div>
                <h4>Escrow Payment System</h4>
                <p>Payments are held securely until the job is completed to the customer's satisfaction.</p>
              </div>
            </div>
            <div className="diff-item">
              <MapPin size={24} color="var(--primary-600)" />
              <div>
                <h4>GPS-Based Matching</h4>
                <p>Find the nearest available service provider using location-based search.</p>
              </div>
            </div>
            <div className="diff-item">
              <Star size={24} color="var(--primary-600)" />
              <div>
                <h4>Transparent Pricing</h4>
                <p>Fixed prices for every service type. No hidden charges, no surprise fees.</p>
              </div>
            </div>
            <div className="diff-item">
              <Users size={24} color="var(--primary-600)" />
              <div>
                <h4>Multi-Layer Oversight</h4>
                <p>Area managers and admins continuously monitor quality and handle disputes.</p>
              </div>
            </div>
            <div className="diff-item">
              <Heart size={24} color="var(--primary-600)" />
              <div>
                <h4>Priyo Workshop</h4>
                <p>Save your favorite trusted service providers for quick rebooking.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container">
          <div className="about-stats">
            <div className="about-stat-item">
              <span className="about-stat-number">500+</span>
              <span className="about-stat-label">Verified Workers</span>
            </div>
            <div className="about-stat-item">
              <span className="about-stat-number">10,000+</span>
              <span className="about-stat-label">Happy Customers</span>
            </div>
            <div className="about-stat-item">
              <span className="about-stat-number">50+</span>
              <span className="about-stat-label">Service Types</span>
            </div>
            <div className="about-stat-item">
              <span className="about-stat-number">4.8★</span>
              <span className="about-stat-label">Average Rating</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
