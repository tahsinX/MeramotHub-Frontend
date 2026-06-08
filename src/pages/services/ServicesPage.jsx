import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, Wrench, Tag, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import './ServicesPage.css';

const STATIC_CATEGORIES = [
  { id: 'electrician', name: 'Electrical Services' },
  { id: 'plumber', name: 'Plumbing Services' },
  { id: 'ac_mechanic', name: 'AC Services' },
  { id: 'carpenter', name: 'Carpentry Services' },
  { id: 'painter', name: 'Painting Services' }
];

const STATIC_SERVICES = [
  // Electrical
  { id: 1, name: 'Fan Installation & Repair', category_id: 'electrician', base_price: 400, unit: 'per unit' },
  { id: 2, name: 'Whole House Wiring Check', category_id: 'electrician', base_price: 1000, unit: 'per visit' },
  { id: 3, name: 'Switch/Socket Replacement', category_id: 'electrician', base_price: 200, unit: 'per unit' },
  { id: 4, name: 'Circuit Breaker Repair', category_id: 'electrician', base_price: 600, unit: 'per unit' },
  
  // Plumbing
  { id: 5, name: 'Tap Leak Repair', category_id: 'plumber', base_price: 300, unit: 'per job' },
  { id: 6, name: 'Commode Installation', category_id: 'plumber', base_price: 1200, unit: 'per unit' },
  { id: 7, name: 'Pipe Fitting', category_id: 'plumber', base_price: 500, unit: 'per job' },
  { id: 8, name: 'Water Tank Cleaning', category_id: 'plumber', base_price: 1500, unit: 'per tank' },
  
  // AC
  { id: 9, name: 'AC Master Service', category_id: 'ac_mechanic', base_price: 1500, unit: 'per unit' },
  { id: 10, name: 'AC Gas Refill', category_id: 'ac_mechanic', base_price: 2500, unit: 'per unit' },
  { id: 11, name: 'AC Installation', category_id: 'ac_mechanic', base_price: 3000, unit: 'per unit' },
  
  // Carpentry
  { id: 12, name: 'Door Lock Repair', category_id: 'carpenter', base_price: 350, unit: 'per unit' },
  { id: 13, name: 'Furniture Assembly', category_id: 'carpenter', base_price: 800, unit: 'per job' },
  { id: 14, name: 'Cabinet Repair', category_id: 'carpenter', base_price: 500, unit: 'per cabinet' },
  
  // Painting
  { id: 15, name: 'Room Painting (per wall)', category_id: 'painter', base_price: 1500, unit: 'per wall' },
  { id: 16, name: 'Waterproofing', category_id: 'painter', base_price: 2000, unit: 'per sq ft' }
];

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isCustomer } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const activeCategory = searchParams.get('category');

  // Match category IDs between backend and front-end static representation
  const getBackendCategoryMatch = (cats, activeCatId) => {
    if (!activeCatId) return null;
    return cats.find(c => String(c.id) === String(activeCatId) || 
                          c.name.toLowerCase().includes(activeCatId.toLowerCase()) ||
                          activeCatId.toLowerCase().includes(c.id.toString()));
  };

  useEffect(() => {
    api.getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        if (list.length > 0) {
          setCategories(list);
        } else {
          setCategories(STATIC_CATEGORIES);
        }
      })
      .catch(() => {
        setCategories(STATIC_CATEGORIES);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    
    // Resolve matching backend category ID if name strings are used (e.g. "ac_mechanic" vs integer ID)
    let searchId = activeCategory;
    const activeCatObj = categories.find(c => String(c.id) === String(activeCategory));
    
    api.getServiceItems(activeCategory)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items || data?.data || [];
        if (list.length > 0) {
          setItems(list);
        } else {
          // Empty list from API -> try static fallback
          let filtered = STATIC_SERVICES;
          if (activeCategory) {
            // Find static category name matching active category ID/name
            const currentCat = categories.find(c => String(c.id) === String(activeCategory)) || 
                               STATIC_CATEGORIES.find(c => String(c.id) === String(activeCategory));
            
            const catNameLower = currentCat ? currentCat.name.toLowerCase() : '';
            
            filtered = STATIC_SERVICES.filter(item => {
              const itemCat = String(item.category_id);
              // Match exact static ID or keyword inside the category name
              return itemCat === String(activeCategory) || 
                     (catNameLower.includes('electric') && itemCat === 'electrician') ||
                     (catNameLower.includes('plumb') && itemCat === 'plumber') ||
                     (catNameLower.includes('ac') && itemCat === 'ac_mechanic') ||
                     (catNameLower.includes('carpent') && itemCat === 'carpenter') ||
                     (catNameLower.includes('paint') && itemCat === 'painter');
            });
          }
          setItems(filtered);
        }
      })
      .catch(() => {
        // API fetch failed -> static fallback
        let filtered = STATIC_SERVICES;
        if (activeCategory) {
          const currentCat = categories.find(c => String(c.id) === String(activeCategory)) || 
                             STATIC_CATEGORIES.find(c => String(c.id) === String(activeCategory));
          
          const catNameLower = currentCat ? currentCat.name.toLowerCase() : '';
          
          filtered = STATIC_SERVICES.filter(item => {
            const itemCat = String(item.category_id);
            return itemCat === String(activeCategory) || 
                   (catNameLower.includes('electric') && itemCat === 'electrician') ||
                   (catNameLower.includes('plumb') && itemCat === 'plumber') ||
                   (catNameLower.includes('ac') && itemCat === 'ac_mechanic') ||
                   (catNameLower.includes('carpent') && itemCat === 'carpenter') ||
                   (catNameLower.includes('paint') && itemCat === 'painter');
          });
        }
        setItems(filtered);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, categories]);

  // Scroll reveals
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
  }, [items, loading]);

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

  const activeCategoryObj = categories.find((c) => String(c.id) === String(activeCategory)) || 
                            STATIC_CATEGORIES.find((c) => String(c.id) === String(activeCategory));

  return (
    <div className="dot-grid page-wrapper">
      {/* ═══ HEADER HERO ═══ */}
      <section className="services-hero-section">
        <div className="container">
          <div className="services-hero-inner reveal">
            <h1>OUR SERVICES</h1>
            <p>Browse local professional home services with fixed, upfront pricing.</p>
            <div className="services-search-wrapper">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search home services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="services-search"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MAIN LAYOUT ═══ */}
      <section className="section" style={{ paddingTop: '48px' }}>
        <div className="container">
          <div className="services-page-layout">
            
            {/* Left Sidebar Filters */}
            <aside className="services-sidebar-wrap reveal">
              <h3 className="services-sidebar-title">
                <Filter size={12} /> CATEGORIES
              </h3>
              <div className="services-cat-list">
                <button
                  className={`services-cat-btn ${!activeCategory ? 'active' : ''}`}
                  onClick={() => { searchParams.delete('category'); setSearchParams(searchParams); }}
                >
                  All Services
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`services-cat-btn ${String(cat.id) === activeCategory ? 'active' : ''}`}
                    onClick={() => selectCategory(String(cat.id))}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Services List */}
            <main className="services-main-wrap reveal">
              <div className="services-main-header">
                <h2>
                  {activeCategoryObj ? activeCategoryObj.name : 'ALL SERVICES'}
                  <span className="services-count-badge">{filteredItems.length} available</span>
                </h2>
              </div>

              {loading ? (
                <div className="loader">
                  <div className="spinner" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3>No services matched</h3>
                  <p>Try searching in a different category or change your keywords.</p>
                </div>
              ) : (
                <div className="services-items-grid">
                  {filteredItems.map((item) => (
                    <div className="service-item-box" key={item.id}>
                      <div className="service-item-top">
                        <div className="service-item-icon-box">
                          <Wrench size={14} />
                        </div>
                        <div className="service-item-unit-badge">
                          <Tag size={10} style={{ marginRight: '4px' }} /> {item.unit}
                        </div>
                      </div>
                      <h3 className="service-item-name">{item.name}</h3>
                      {item.provider_name && (
                        <div className="service-item-provider">
                          by <strong>{item.provider_name}</strong>
                        </div>
                      )}
                      <div className="service-item-price-row">
                        <span className="symbol">৳</span>
                        <span className="val">{Number(item.base_price).toLocaleString()}</span>
                        <span className="unit">/ {item.unit}</span>
                      </div>
                      <div className="service-item-actions">
                        <Link to={`/customer/book?service=${item.id}`} className="btn btn-primary btn-sm service-item-book-btn">
                          Book Now <ChevronRight size={14} />
                        </Link>
                        {item.provider_id && isCustomer && (
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/customer/messages/${item.provider_id}`)}>
                            <MessageCircle size={14} /> Chat
                          </button>
                        )}
                      </div>
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
