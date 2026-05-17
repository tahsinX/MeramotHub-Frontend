import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Filter, Star, MapPin, ChevronRight,
  Zap, Droplets, Wind, Hammer, Paintbrush, Wrench, Tag
} from 'lucide-react';
import api from '../../api/client';
import './ServicesPage.css';

const SKILL_ICONS = {
  electrician: <Zap size={22} />,
  plumber: <Droplets size={22} />,
  ac_mechanic: <Wind size={22} />,
  carpenter: <Hammer size={22} />,
  painter: <Paintbrush size={22} />,
};

const SKILL_COLORS = {
  electrician: '#f59e0b',
  plumber: '#3b82f6',
  ac_mechanic: '#06b6d4',
  carpenter: '#8b5cf6',
  painter: '#ec4899',
};

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const activeCategory = searchParams.get('category');

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getServiceItems(activeCategory)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items || data?.data || [];
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectCategory = (catId) => {
    if (catId === activeCategory) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const activeCategoryObj = categories.find((c) => String(c.id) === activeCategory);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <section className="services-hero">
        <div className="container">
          <div className="services-hero-content">
            <h1>Our Services</h1>
            <p>Browse all available home services with transparent, fixed pricing</p>
            <div className="services-search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="services-search"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'var(--space-xl)' }}>
        <div className="container">
          <div className="services-layout">
            {/* Sidebar - Categories */}
            <aside className="services-sidebar">
              <div className="sidebar-card card">
                <h3 className="sidebar-title">
                  <Filter size={18} /> Categories
                </h3>
                <div className="category-list">
                  <button
                    className={`category-item ${!activeCategory ? 'active' : ''}`}
                    onClick={() => { searchParams.delete('category'); setSearchParams(searchParams); }}
                  >
                    <div className="cat-icon-small" style={{ background: '#f1f5f9', color: '#64748b' }}>
                      <Wrench size={16} />
                    </div>
                    <span>All Services</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`category-item ${String(cat.id) === activeCategory ? 'active' : ''}`}
                      onClick={() => selectCategory(String(cat.id))}
                    >
                      <div
                        className="cat-icon-small"
                        style={{
                          background: `${SKILL_COLORS[cat.skill_required] || '#64748b'}18`,
                          color: SKILL_COLORS[cat.skill_required] || '#64748b',
                        }}
                      >
                        {SKILL_ICONS[cat.skill_required] || <Wrench size={16} />}
                      </div>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main className="services-main">
              <div className="services-toolbar">
                <h2>
                  {activeCategoryObj ? activeCategoryObj.name : 'All Services'}
                  <span className="item-count">{filteredItems.length} services</span>
                </h2>
              </div>

              {loading ? (
                <div className="loader"><div className="spinner" /></div>
              ) : filteredItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3>No services found</h3>
                  <p>Try a different category or search term</p>
                </div>
              ) : (
                <div className="items-grid">
                  {filteredItems.map((item, i) => (
                    <div
                      key={item.id}
                      className="item-card card card-interactive animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="item-card-top">
                        <div className="item-icon">
                          <Wrench size={20} />
                        </div>
                        <div className="item-badge">
                          <Tag size={12} /> {item.unit}
                        </div>
                      </div>
                      <h3 className="item-name">{item.name}</h3>
                      <div className="item-price">
                        <span className="price-symbol">৳</span>
                        <span className="price-value">{Number(item.base_price).toLocaleString()}</span>
                        <span className="price-unit">/ {item.unit}</span>
                      </div>
                      <Link to={`/customer/book?service=${item.id}`} className="btn btn-primary btn-sm item-book-btn">
                        Book Now <ChevronRight size={16} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
