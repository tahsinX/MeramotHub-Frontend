import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Shield, Star, ArrowRight, MapPin, Clock,
  Wrench, Droplets, Wind, Hammer, Paintbrush, Users,
  CheckCircle, MessageCircle, Search, ChevronRight
} from 'lucide-react';
import api from '../api/client';
import './HomePage.css';

const SKILL_ICONS = {
  electrician: <Zap size={28} />,
  plumber: <Droplets size={28} />,
  ac_mechanic: <Wind size={28} />,
  carpenter: <Hammer size={28} />,
  painter: <Paintbrush size={28} />,
  welder: <Wrench size={28} />,
  mason: <Wrench size={28} />,
  other: <Wrench size={28} />,
};

const SKILL_COLORS = {
  electrician: '#f59e0b',
  plumber: '#3b82f6',
  ac_mechanic: '#06b6d4',
  carpenter: '#8b5cf6',
  painter: '#ec4899',
  welder: '#ef4444',
  mason: '#6366f1',
  other: '#64748b',
};

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: <Search size={28} />,
    title: 'Search Service',
    desc: 'Browse from verified electricians, plumbers, AC mechanics and more in your area.',
  },
  {
    step: '02',
    icon: <Users size={28} />,
    title: 'Choose Provider',
    desc: 'Compare ratings, reviews, and pricing. Pick the best professional for your needs.',
  },
  {
    step: '03',
    icon: <Clock size={28} />,
    title: 'Book & Schedule',
    desc: 'Schedule at your convenience or get instant help with emergency booking.',
  },
  {
    step: '04',
    icon: <CheckCircle size={28} />,
    title: 'Get It Done',
    desc: 'Service completed with escrow protection. Pay only when you are satisfied.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Rafiq Ahmed',
    role: 'Customer, Dhaka',
    text: 'MeramotHub saved me during an AC emergency. The technician arrived within 30 minutes and fixed it perfectly!',
    rating: 5,
  },
  {
    name: 'Shahid Hasan',
    role: 'Electrician',
    text: 'As a service provider, MeramotHub gives me steady work and fair payments. The escrow system builds trust.',
    rating: 5,
  },
  {
    name: 'Fatema Begum',
    role: 'Customer, Chittagong',
    text: 'I love the transparent pricing. No more haggling or worrying about overcharging. Highly recommended!',
    rating: 4,
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="page-wrapper">
      {/* ═══ HERO ═══ */}
      <section className="hero" id="hero-section">
        <div className="hero-bg">
          <div className="hero-gradient" />
          <div className="hero-pattern" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <div className="hero-content container">
          <div className="hero-text">
            <div className="hero-badge animate-fade-in-up">
              <Zap size={14} />
              <span>Trusted by 10,000+ Customers</span>
            </div>
            <h1 className="hero-title animate-fade-in-up stagger-1">
              Your Trusted
              <span className="hero-highlight"> Home Service</span>
              <br />Partner in Bangladesh
            </h1>
            <p className="hero-subtitle animate-fade-in-up stagger-2">
              Book verified electricians, plumbers, AC mechanics & more. 
              Transparent pricing, secure payments, and quality guaranteed.
            </p>
            <div className="hero-actions animate-fade-in-up stagger-3">
              <Link to="/services" className="btn btn-primary btn-lg" id="hero-cta-services">
                Explore Services
                <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg" id="hero-cta-register">
                Join as Provider
              </Link>
            </div>
            <div className="hero-stats animate-fade-in-up stagger-4">
              <div className="hero-stat">
                <span className="hero-stat-value">500+</span>
                <span className="hero-stat-label">Verified Workers</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">50+</span>
                <span className="hero-stat-label">Service Types</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">4.8★</span>
                <span className="hero-stat-label">Avg. Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-visual animate-fade-in-up stagger-3">
            <div className="hero-card-stack">
              <div className="hero-floating-card card-1">
                <div className="hfc-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div className="hfc-title">Escrow Protected</div>
                  <div className="hfc-desc">100% secure payment</div>
                </div>
              </div>
              <div className="hero-floating-card card-2">
                <div className="hfc-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <Star size={20} />
                </div>
                <div>
                  <div className="hfc-title">Top Rated</div>
                  <div className="hfc-desc">4.8/5 average rating</div>
                </div>
              </div>
              <div className="hero-floating-card card-3">
                <div className="hfc-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="hfc-title">Near You</div>
                  <div className="hfc-desc">GPS-based search</div>
                </div>
              </div>
              <div className="hero-main-visual">
                <div className="hmv-inner">
                  <Wrench size={64} />
                  <h3>MeramotHub</h3>
                  <p>Your service, simplified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="section" id="services-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Services</span>
            <h2 className="section-title">What We Offer</h2>
            <p className="section-subtitle">
              Professional, verified service providers for all your home maintenance needs
            </p>
          </div>

          <div className="services-grid">
            {categories.length > 0
              ? categories.map((cat, i) => (
                  <Link
                    to={`/services?category=${cat.id}`}
                    key={cat.id}
                    className="service-card card card-interactive animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div
                      className="service-icon"
                      style={{
                        background: `${SKILL_COLORS[cat.skill_required] || '#64748b'}18`,
                        color: SKILL_COLORS[cat.skill_required] || '#64748b',
                      }}
                    >
                      {SKILL_ICONS[cat.skill_required] || <Wrench size={28} />}
                    </div>
                    <h3>{cat.name}</h3>
                    <p>{cat.description}</p>
                    <span className="service-card-link">
                      View Services <ChevronRight size={16} />
                    </span>
                  </Link>
                ))
              : /* Fallback static categories */
                [
                  { name: 'Electrical Services', desc: 'Fan, light and wiring solutions', icon: 'electrician' },
                  { name: 'Plumbing Services', desc: 'Fixing leaks, pipes and fittings', icon: 'plumber' },
                  { name: 'AC Services', desc: 'Installation, repair and maintenance', icon: 'ac_mechanic' },
                  { name: 'Carpentry Services', desc: 'Furniture repair, door/window fixing', icon: 'carpenter' },
                  { name: 'Painting Services', desc: 'Wall painting and waterproofing', icon: 'painter' },
                ].map((cat, i) => (
                  <Link
                    to="/services"
                    key={i}
                    className="service-card card card-interactive animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div
                      className="service-icon"
                      style={{
                        background: `${SKILL_COLORS[cat.icon]}18`,
                        color: SKILL_COLORS[cat.icon],
                      }}
                    >
                      {SKILL_ICONS[cat.icon]}
                    </div>
                    <h3>{cat.name}</h3>
                    <p>{cat.desc}</p>
                    <span className="service-card-link">
                      View Services <ChevronRight size={16} />
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="section how-it-works-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">Simple 4-Step Process</h2>
            <p className="section-subtitle">
              From search to service completion — all in a few taps
            </p>
          </div>

          <div className="steps-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={i}
                className="step-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="step-number">{step.step}</div>
                <div className="step-icon-wrap">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="section features-section" id="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why Choose Us</span>
            <h2 className="section-title">Built for Trust & Transparency</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Shield size={24} />
              </div>
              <h3>Escrow Payment</h3>
              <p>Your money is held securely until the job is done right. No risk, no worries.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <CheckCircle size={24} />
              </div>
              <h3>Verified Workers</h3>
              <p>Every service provider is NID-verified by our area managers before they start.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Star size={24} />
              </div>
              <h3>Transparent Pricing</h3>
              <p>Fixed pricing for every service. No hidden charges, no surprise fees.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                <MapPin size={24} />
              </div>
              <h3>GPS-Based Search</h3>
              <p>Find nearby verified workers instantly based on your location.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#fce7f3', color: '#db2777' }}>
                <MessageCircle size={24} />
              </div>
              <h3>AI Chatbot</h3>
              <p>Our AI assistant helps you find the right service provider for your needs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#fee2e2', color: '#dc2626' }}>
                <Zap size={24} />
              </div>
              <h3>Emergency Service</h3>
              <p>Need urgent help? Use our instant booking for immediate assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="section testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">What Our Users Say</h2>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card card animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill={j < t.rating ? '#fbbf24' : 'none'} color={j < t.rating ? '#fbbf24' : '#cbd5e1'} />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cta-section" id="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg-pattern" />
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of satisfied customers and trusted service providers on MeramotHub.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary-700)', fontWeight: 700 }}>
                Create Account
                <ArrowRight size={18} />
              </Link>
              <Link to="/services" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}>
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
