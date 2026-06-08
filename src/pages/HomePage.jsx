import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, UserCheck, CreditCard, Clock, Star, AlertCircle, Wrench, LayoutDashboard, ShieldCheck, ClipboardList } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const STATIC_CATEGORIES = [
  { name: 'Electrical Services', desc: 'High-precision fan, light, and power wiring diagnostics.', id: 'electrician' },
  { name: 'Plumbing Services', desc: 'Expert pipe repairs, leak preventions, and fixture fittings.', id: 'plumber' },
  { name: 'AC Services', desc: 'Elite AC cleaning, installation, and compressor diagnostics.', id: 'ac_mechanic' },
  { name: 'Carpentry Services', desc: 'Fine wood repairs, premium doors, and cabinet restorations.', id: 'carpenter' },
  { name: 'Painting Services', desc: 'Premium interior finishes and flawless waterproofing layers.', id: 'painter' },
];

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Select Category & Locate',
    desc: 'Browse verified service profiles in your immediate local area with clear fixed rates.',
  },
  {
    num: '02',
    title: 'Lock Funds in Escrow',
    desc: 'Your payment is safely held in escrow. No cash negotiations, total transparency.',
  },
  {
    num: '03',
    title: 'Verify & Release',
    desc: 'Confirm the service was delivered perfectly to release funds directly to the expert.',
  },
];

const TRUST_COLUMNS = [
  {
    icon: <UserCheck size={20} className="trust-icon" />,
    title: 'Mandatory NID Screening',
    desc: 'Every professional undergoes strict national identity checks and local area manager approval.',
  },
  {
    icon: <CreditCard size={20} className="trust-icon" />,
    title: '100% Secure Escrow',
    desc: 'Funds are only released once you sign off on the quality of work. Zero upfront risk.',
  },
  {
    icon: <Clock size={20} className="trust-icon" />,
    title: 'Rapid Local Dispatch',
    desc: 'Our system routes your request to nearby checked specialists for prompt arrival.',
  },
  {
    icon: <Shield size={20} className="trust-icon" />,
    title: 'Pre-Vetted Pricing',
    desc: 'No sudden surcharges or bargaining. Pre-defined rates per unit keep costs completely predictable.',
  },
];

const TESTIMONIALS = [
  {
    quote: "During a major plumbing emergency late at night, MeramotHub connected us with a checked specialist in under 20 minutes. Exceptional professionalism and zero bargaining.",
    initials: "AH",
    name: "Afridi Hasan",
    role: "Mirpur Resident"
  },
  {
    quote: "As an independent AC mechanic, the escrow system protects my income. I focus on quality craft, knowing my compensation is already locked and guaranteed.",
    initials: "SR",
    name: "Sajid Rahman",
    role: "Vetted AC Technician"
  },
  {
    quote: "Booking was seamless. Vetted electrician arrived on time, wore a mask, and charged exactly the pre-defined matrix tariff. Outstanding experience.",
    initials: "NS",
    name: "Nusrat Sharmin",
    role: "Uttara Customer"
  }
];

function CountUp({ end, duration = 1200, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasStarted(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    
    let start = 0;
    const endNum = parseFloat(end.replace(/[^0-9.]/g, ''));
    if (isNaN(endNum)) {
      setCount(end);
      return;
    }

    const steps = 50;
    const increment = endNum / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCount(endNum);
        clearInterval(timer);
      } else {
        setCount((prev) => Math.min(endNum, Math.floor(step * increment)));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [hasStarted, end, duration]);

  return (
    <span ref={ref} className="stat-count">
      {count}
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const { user, isManager, isProvider } = useAuth();

  useEffect(() => {
    api.getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setCategories(list);
      })
      .catch(() => {});
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [categories]);

  const displayCategories = categories.length > 0 ? categories : STATIC_CATEGORIES;

  return (
    <div className="homepage-wrapper">
      {/* ═══ HERO SECTION ═══ */}
      <section className="hero-section" id="hero">
        <div className="container hero-container">
          <div className="hero-split-layout">
            
            {/* Left Content */}
            <div className="hero-left reveal">
              <div className="trusted-badge-pill animate-fade-in">
                <span className="pill-dot">⚡</span>
                <span className="pill-text">
                  {isManager ? 'Management Access' : isProvider ? 'Professional Network' : 'Trusted by 10,000+ Customers'}
                </span>
              </div>
              
              {isManager ? (
                <>
                  <h1 className="hero-headline">
                    Streamline Operations.<br />
                    Enforce Excellence.
                  </h1>
                  <p className="hero-subtext">
                    As an Area Manager, you are the backbone of MeramotHub. 
                    Verify local experts, resolve disputes, and maintain the highest standards of quality in your assigned region.
                  </p>
                  
                  <div className="hero-actions">
                    <Link to="/manager" className="btn btn-primary btn-lg">
                      Go to Dashboard
                      <LayoutDashboard size={18} style={{ marginLeft: '8px' }} />
                    </Link>
                    <div className="manager-quick-links">
                      <Link to="/manager" className="manager-mini-link">
                        <ShieldCheck size={14} /> 
                        Pending Verifications
                      </Link>
                      <Link to="/manager" className="manager-mini-link">
                        <ClipboardList size={14} /> 
                        Unresolved Complaints
                      </Link>
                    </div>
                  </div>
                </>
              ) : isProvider ? (
                <>
                  <h1 className="hero-headline">
                    Grow Your Business.<br />
                    Showcase Expertise.
                  </h1>
                  <p className="hero-subtext">
                    Join thousands of vetted professionals. Access a steady stream of local service requests, 
                    secure escrow-protected payments, and build your digital reputation.
                  </p>
                  
                  <div className="hero-actions">
                    <Link to="/provider" className="btn btn-primary btn-lg">
                      Enter Provider Portal
                      <ArrowRight size={16} />
                    </Link>
                    <div className="manager-quick-links">
                      <Link to="/provider/profile" className="manager-mini-link">
                        <UserCheck size={14} /> 
                        Complete Verification
                      </Link>
                      <Link to="/provider" className="manager-mini-link">
                        <Star size={14} /> 
                        View Your Ratings
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="hero-headline">
                    Verified professionals.<br />
                    Escrow protected.
                  </h1>
                  <p className="hero-subtext">
                    Book NID-verified electricians, plumbers, and local technicians with full financial safety.
                    Transparent pricing, zero negotiations, and reliable service guaranteed.
                  </p>
                  
                  <div className="hero-actions">
                    <Link to="/services" className="btn btn-primary btn-lg" id="hero-cta-book">
                      Book A Service Now
                      <ArrowRight size={16} />
                    </Link>
                    <Link to="/register" className="btn btn-outline btn-lg" id="hero-cta-join">
                      Join as Service Provider
                    </Link>
                  </div>
                </>
              )}

              <div className="hero-trust-indicators">
                <div className="trust-indicator-item">
                  <Shield size={14} className="indicator-icon" />
                  <span>100% NID-Verified</span>
                </div>
                <div className="trust-indicator-divider" />
                <div className="trust-indicator-item">
                  <CreditCard size={14} className="indicator-icon" />
                  <span>Escrow Payments</span>
                </div>
                <div className="trust-indicator-divider" />
                <div className="trust-indicator-item">
                  <Zap size={14} className="indicator-icon" />
                  <span>Transparent Rates</span>
                </div>
              </div>
            </div>

            {/* Right Collage */}
            <div className="hero-right reveal">
              <div className="collage-background-mesh" />
              
              {isManager && (
                <div className="manager-hero-overlay-text animate-fade-in">
                  <ShieldCheck size={20} />
                  <span>Administrative Control Panel</span>
                </div>
              )}

              {isProvider && (
                <div className="manager-hero-overlay-text animate-fade-in" style={{ borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' }}>
                  <Star size={20} />
                  <span>Verified Professional Portal</span>
                </div>
              )}

              <div className="floating-collage-container">
                {/* Card 1: Electrician */}
                <div className="floating-card card-electrician animate-float-slow">
                  <div className="card-status-row">
                    <span className="status-indicator online" />
                    <span className="status-text">Available</span>
                  </div>
                  <div className="card-body-row">
                    <div className="provider-icon bg-blue-subtle">
                      <Wrench size={16} className="text-blue" />
                    </div>
                    <div>
                      <h4 className="provider-name">Tanvir Rahman</h4>
                      <p className="provider-spec">Certified Electrician</p>
                    </div>
                  </div>
                  <div className="card-meta-row">
                    <div className="rating">
                      <Star size={12} fill="currentColor" />
                      <span>4.9</span>
                    </div>
                    <span className="price-tag">৳450/hr</span>
                  </div>
                </div>

                {/* Card 2: Plumber */}
                <div className="floating-card card-plumber animate-float-medium">
                  <div className="card-status-row">
                    <span className="status-indicator busy" />
                    <span className="status-text">On Duty</span>
                  </div>
                  <div className="card-body-row">
                    <div className="provider-icon bg-gold-subtle">
                      <Wrench size={16} className="text-gold" />
                    </div>
                    <div>
                      <h4 className="provider-name">Kamil Khan</h4>
                      <p className="provider-spec">Plumbing Specialist</p>
                    </div>
                  </div>
                  <div className="card-meta-row">
                    <div className="rating">
                      <Star size={12} fill="currentColor" />
                      <span>4.8</span>
                    </div>
                    <span className="price-tag">৳500/hr</span>
                  </div>
                </div>

                {/* Card 3: AC Mech */}
                <div className="floating-card card-ac animate-float-fast">
                  <div className="card-status-row">
                    <span className="status-indicator online" />
                    <span className="status-text">Available</span>
                  </div>
                  <div className="card-body-row">
                    <div className="provider-icon bg-navy-subtle">
                      <Wrench size={16} className="text-navy" />
                    </div>
                    <div>
                      <h4 className="provider-name">Imran Hosein</h4>
                      <p className="provider-spec">AC Diagnostics Expert</p>
                    </div>
                  </div>
                  <div className="card-meta-row">
                    <div className="rating">
                      <Star size={12} fill="currentColor" />
                      <span>5.0</span>
                    </div>
                    <span className="price-tag">৳600/hr</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ MANAGER OVERVIEW HUB ═══ */}
      {isManager && (
        <section className="section manager-ops-hub reveal">
          <div className="container">
            <div className="section-header-block">
              <h2 className="section-headline">Administrative Oversight.</h2>
              <p className="section-desc">Manage your area's performance and ensure service integrity.</p>
            </div>
            
            <div className="manager-dashboard-preview">
              <div className="preview-card">
                <ShieldCheck size={32} className="preview-icon" />
                <h3>Provider Pipeline</h3>
                <p>Track new applications from technicians in your area. Approve those with verified skills and NIDs.</p>
                <Link to="/manager" className="preview-btn">View Queue</Link>
              </div>
              
              <div className="preview-card highlight">
                <AlertCircle size={32} className="preview-icon" />
                <h3>Resolution Center</h3>
                <p>Investigate disputes and complaints. Your decisions keep the marketplace fair and trustworthy.</p>
                <Link to="/manager" className="preview-btn">Check Disputes</Link>
              </div>

              <div className="preview-card">
                <Star size={32} className="preview-icon" />
                <h3>Quality Audit</h3>
                <p>Monitor customer reviews and feedback to identify top-performing providers in your region.</p>
                <Link to="/manager" className="preview-btn">Audit Feed</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ PROVIDER GROWTH HUB ═══ */}
      {isProvider && (
        <section className="section manager-ops-hub reveal">
          <div className="container">
            <div className="section-header-block">
              <h2 className="section-headline">Provider Excellence.</h2>
              <p className="section-desc">Tools to help you dominate your local market and maximize earnings.</p>
            </div>
            
            <div className="manager-dashboard-preview">
              <div className="preview-card">
                <CreditCard size={32} className="preview-icon" style={{ color: '#22c55e' }} />
                <h3>Earnings Hub</h3>
                <p>Track your locked escrow funds, completed payments, and upcoming payouts with full transparency.</p>
                <Link to="/provider" className="preview-btn">Check Wallet</Link>
              </div>
              
              <div className="preview-card highlight" style={{ borderColor: '#22c55e' }}>
                <Zap size={32} className="preview-icon" style={{ color: '#22c55e' }} />
                <h3>Active Requests</h3>
                <p>View and accept nearby service requests instantly. Fill your schedule with high-quality leads.</p>
                <Link to="/provider" className="preview-btn">View Jobs</Link>
              </div>

              <div className="preview-card">
                <Star size={32} className="preview-icon" style={{ color: '#22c55e' }} />
                <h3>Profile Rating</h3>
                <p>Build your reputation. Collect verified reviews to rank higher in customer searches.</p>
                <Link to="/provider/profile" className="preview-btn">Edit Profile</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ STATS BAR ═══ */}
      <section className="stats-bar-section" id="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-box-item">
              <CountUp end="500" suffix="+" />
              <span className="stat-label">Verified Specialists</span>
            </div>
            <div className="stat-box-item">
              <CountUp end="10" suffix="k+" />
              <span className="stat-label">Successful Bookings</span>
            </div>
            <div className="stat-box-item">
              <CountUp end="99" suffix=".8%" />
              <span className="stat-label">Resolution Rate</span>
            </div>
            <div className="stat-box-item">
              <CountUp end="100" suffix="%" />
              <span className="stat-label">Payment Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES SECTION (ASYMMETRIC GRID) ═══ */}
      {!isProvider && (
        <section className="section services-grid-section" id="services">
          <div className="container">
            <div className="section-header-block reveal">
              <h2 className="section-headline">Services on demand.</h2>
              <p className="section-desc">Select an area of expertise to locate top nearby providers.</p>
            </div>

            <div className="services-asymmetric-grid reveal">
              {displayCategories.slice(0, 5).map((cat, idx) => {
                const bgColors = [
                  'service-bg-electrician',
                  'service-bg-plumber',
                  'service-bg-ac',
                  'service-bg-carpenter',
                  'service-bg-painting'
                ];
                const currentBg = bgColors[idx] || 'service-bg-default';
                
                return (
                  <Link 
                    to={cat.id ? `/services?category=${cat.id}` : '/services'} 
                    key={cat.id || idx} 
                    className={`service-grid-card ${currentBg}`}
                  >
                    <div className="service-card-top">
                      <span className="service-num">0{idx + 1}</span>
                      <Wrench size={16} className="service-card-icon" />
                    </div>
                    <div className="service-card-bottom">
                      <h3 className="service-card-name">{cat.name}</h3>
                      <p className="service-card-desc">{cat.description || cat.desc}</p>
                      <div className="service-card-link">
                        <span>Book Service</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ PROCESS SECTION (WATERLINE NUMBERS) ═══ */}
      {!isManager && !isProvider && (
        <section className="section process-section-light" id="process">
          <div className="container">
            <div className="section-header-block reveal">
              <h2 className="section-headline">How we operate.</h2>
              <p className="section-desc">A highly organized model designed for absolute integrity.</p>
            </div>

            <div className="process-waterline-flow reveal">
              <div className="process-line-connector" />
              {PROCESS_STEPS.map((step, idx) => (
                <div className="process-waterline-card" key={idx}>
                  <span className="waterline-large-num">{step.num}</span>
                  <div className="process-card-content">
                    <h3 className="process-step-title">{step.title}</h3>
                    <p className="process-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ WHY CHOOSE US (TRUST GRID) ═══ */}
      <section className="section trust-section" id="why-us">
        <div className="container">
          <div className="section-header-block reveal">
            <h2 className="section-headline">Why MeramotHub?</h2>
            <p className="section-desc">Setting the benchmark for secure domestic maintenance in Bangladesh.</p>
          </div>

          <div className="trust-four-grid reveal">
            {TRUST_COLUMNS.map((col, idx) => (
              <div className="trust-card-item" key={idx}>
                <div className="trust-icon-container">
                  {col.icon}
                </div>
                <h3 className="trust-card-title">{col.title}</h3>
                <p className="trust-card-desc">{col.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="section testimonials-minimal-section" id="testimonials">
        <div className="container">
          <div className="section-header-block reveal">
            <h2 className="section-headline">Customer reviews.</h2>
            <p className="section-desc">Real experiences from customers and vetted service partners.</p>
          </div>

          <div className="testimonials-three-grid reveal">
            {TESTIMONIALS.map((t, idx) => (
              <div className="testimonial-card-minimal" key={idx}>
                <p className="testimonial-card-quote">“{t.quote}”</p>
                <div className="testimonial-card-author">
                  <div className="author-avatar-initials">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="author-name">{t.name}</h4>
                    <p className="author-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="section home-cta-section" id="cta">
        <div className="container">
          <div className="cta-panel-dark reveal">
            <div className="cta-panel-mesh" />
            <h2 className="cta-panel-title">
              {isManager 
                ? "Oversee your area and maintain service quality." 
                : isProvider
                ? "Manage your business and track your earnings."
                : "Ready to hire verified local technicians with escrow security?"}
            </h2>
            <p className="cta-panel-subtitle">
              {isManager 
                ? "Access advanced tools for verification and complaint resolution." 
                : isProvider
                ? "Access your dashboard to check for new service requests."
                : "Creating an account takes less than a minute. Secure your bookings today."}
            </p>
            <div className="cta-panel-actions">
              {isManager ? (
                <Link to="/manager" className="btn btn-primary btn-lg">
                  <LayoutDashboard size={16} /> Enter Manager Dashboard
                </Link>
              ) : isProvider ? (
                <Link to="/provider" className="btn btn-primary btn-lg" style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }}>
                  <LayoutDashboard size={16} /> Go to Provider Portal
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    <Zap size={14} fill="currentColor" /> Create Your Account
                  </Link>
                  <Link to="/services" className="btn btn-outline btn-lg cta-outline-dark">
                    Explore Services
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MOBILE FLOATING CTA ═══ */}
      {!isManager && !isProvider && (
        <Link to="/services" className="mobile-floating-booking-btn" id="mobile-floating-booking-btn">
          <Zap size={14} fill="currentColor" /> Book Now
        </Link>
      )}
    </div>
  );
}
