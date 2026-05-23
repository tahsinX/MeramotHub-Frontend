import { useEffect } from 'react';
import './AboutPage.css';

const STATS = [
  { value: '500+', label: 'Verified Workers' },
  { value: '10k+', label: 'Happy Customers' },
  { value: '50+', label: 'Service Types' },
  { value: '4.8★', label: 'Average Rating' },
];

const DIFFERENTIATORS = [
  {
    title: 'NID Verification',
    desc: 'Every specialist undergoes mandatory national ID screening and area manager approval.',
  },
  {
    title: 'Escrow Lock',
    desc: 'Funds are securely held and only released to providers when you confirm total satisfaction.',
  },
  {
    title: 'GPS Match',
    desc: 'Instantly locate local specialists closest to your coordinates for rapid arrivals.',
  },
  {
    title: 'Transparent Tariffs',
    desc: 'Fixed pricing metrics for every service type. Zero hidden costs or sudden charges.',
  },
  {
    title: 'Area Oversight',
    desc: 'Dedicated local managers monitor quality indices and arbitrate disputes.',
  },
  {
    title: 'Saved Workshops',
    desc: 'Maintain a premium list of your favorite local specialists for immediate bookings.',
  },
];

export default function AboutPage() {
  // Intersection Observer scroll animation
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
  }, []);

  return (
    <div className="dot-grid">
      {/* ═══ HERO SECTION ═══ */}
      <section className="about-hero-section">
        <div className="container">
          <div className="about-hero-grid reveal">
            <div className="about-hero-left">
              <span className="caption-text" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                MeramotHub Platform
              </span>
              <h1>MAKING SERVICES TRUSTWORTHY</h1>
            </div>
            <div className="about-hero-right">
              <p>
                We connect NID-verified local service workers with households across Bangladesh, 
                eliminating typical negotiation friction through transparent pricing structures and escrow protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MISSION & VISION & VALUES ═══ */}
      <section className="section about-mission-section">
        <div className="container">
          <div className="reveal">
            <div className="mission-row">
              <div className="mission-label">Our Mission</div>
              <div className="mission-content">
                <h3>Empowering Local Skillsets</h3>
                <p>
                  To empower skilled local workers by providing a unified digital interface 
                  to showcase their craftsmanship and secure fair, reliable compensation.
                </p>
              </div>
            </div>

            <div className="mission-row">
              <div className="mission-label">Our Vision</div>
              <div className="mission-content">
                <h3>Sustained Service Integrity</h3>
                <p>
                  To cultivate the most trusted service ecosystems in the region, 
                  characterized by total verification, fixed pricing matrices, and unmatched customer trust.
                </p>
              </div>
            </div>

            <div className="mission-row">
              <div className="mission-label">Our Values</div>
              <div className="mission-content">
                <h3>Absolute Transparency</h3>
                <p>
                  We are guided by transparency, safety through escrow-backed transactions, 
                  and rigorous local accountability structures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT MAKES US DIFFERENT ═══ */}
      <section className="section about-diff-section">
        <div className="container">
          <div className="reveal">
            <h2 className="h2-title">OUR CORE INTEGRITIES</h2>
            <p className="caption-text" style={{ marginTop: '8px' }}>The standards we uphold across every request</p>
          </div>

          <div className="about-diff-grid reveal">
            {DIFFERENTIATORS.map((diff, i) => (
              <div className="about-diff-item" key={i}>
                <h4>{diff.title}</h4>
                <p>{diff.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS SECTION ═══ */}
      <section className="about-stats-section">
        <div className="container">
          <div className="about-stats-grid reveal">
            {STATS.map((stat, i) => (
              <div className="about-stat-box" key={i}>
                <span className="about-stat-num">{stat.value}</span>
                <span className="about-stat-lbl">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
