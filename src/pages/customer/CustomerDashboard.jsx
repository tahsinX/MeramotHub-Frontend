import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, Star, AlertTriangle, X,
  MessageCircle, Heart, Clock, CheckCircle, XCircle, Megaphone, ThumbsUp
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LocationPicker from '../../components/LocationPicker';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ProfilePage from '../shared/ProfilePage';
import ChatPage from '../shared/ChatPage';
import './CustomerDashboard.css';

const NAV_ITEMS = [
  {
    label: 'Main',
    items: [
      { name: 'Overview', path: '/customer', icon: <LayoutDashboard size={18} /> },
      { name: 'My Bookings', path: '/customer/bookings', icon: <CalendarCheck size={18} /> },
      { name: 'My Reviews', path: '/customer/reviews', icon: <Star size={18} /> },
    ],
  },
  {
    label: 'Support',
    items: [
      { name: 'Messages', path: '/customer/messages', icon: <MessageCircle size={18} /> },
      { name: 'My Complaints', path: '/customer/complaints', icon: <AlertTriangle size={18} /> },
      { name: 'Browse Services', path: '/customer/ads', icon: <Megaphone size={18} /> },
      { name: 'AI Chatbot', path: '/customer/chat', icon: <MessageCircle size={18} /> },
      { name: 'Priyo Workshop', path: '/customer/priyo', icon: <Heart size={18} /> },
    ],
  },

];

/* ── Overview ── */
function Overview() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyBookings()
      .then((data) => setBookings(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    active: bookings.filter(b => ['accepted', 'started'].includes(b.status)).length,
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon teal"><CalendarCheck size={24} /></div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Clock size={24} /></div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Star size={24} /></div>
          <div className="stat-info">
            <h3>{stats.active}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="dash-section">
        <h2>Recent Bookings</h2>
        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No bookings yet</h3>
            <p>Browse our services and book your first service provider</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.address}</strong></td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>৳{Number(b.total_price).toLocaleString()}</td>
                    <td>{new Date(b.created_at).toLocaleDateString()}</td>
                    <td>
                      {b.status === 'pending' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => api.cancelBooking(b.id).then(() => { toast.success('Cancelled'); window.location.reload(); })}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Bookings ── */
function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [complaintTarget, setComplaintTarget] = useState(null);
  const [complaintForm, setComplaintForm] = useState({ subject: '', description: '' });

  const loadBookings = () => {
    api.getMyBookings()
      .then((data) => setBookings(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBookings(); }, []);

  const handleConfirm = async (id) => {
    try {
      await api.confirmBooking(id);
      toast.success('Job confirmed! Leave a review below.');
      loadBookings();
      setReviewTarget(id);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;
    setSubmitting(true);
    try {
      await api.createReview({
        booking_id: reviewTarget,
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined,
      });
      toast.success('Review submitted!');
      setReviewTarget(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileComplaint = async (e) => {
    e.preventDefault();
    if (!complaintTarget || !complaintForm.subject || !complaintForm.description) {
      toast.error('Please fill in subject and description');
      return;
    }
    setSubmitting(true);
    try {
      await api.fileComplaint({
        booking_id: complaintTarget,
        subject: complaintForm.subject,
        description: complaintForm.description,
      });
      toast.success('Complaint filed! Admin and area manager will review it.');
      setComplaintTarget(null);
      setComplaintForm({ subject: '', description: '' });
      loadBookings();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>My Bookings</h1>
        <p>View and manage all your service bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No bookings yet</h3>
          <p>Go to Services to book a provider</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((b) => (
            <div key={b.id} className="booking-card card">
              <div className="booking-card-header">
                <div>
                  <h3>{b.address}</h3>
                  <p className="booking-meta">
                    Booking #{b.id.slice(0, 8)} · {b.booking_type} · {new Date(b.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="booking-card-body">
                <div className="booking-detail">
                  <span className="bd-label">Price</span>
                  <span className="bd-value">৳{Number(b.total_price).toLocaleString()}</span>
                </div>
                {b.scheduled_at && (
                  <div className="booking-detail">
                    <span className="bd-label">Scheduled</span>
                    <span className="bd-value">{new Date(b.scheduled_at).toLocaleString()}</span>
                  </div>
                )}
                {b.notes && (
                  <div className="booking-detail">
                    <span className="bd-label">Notes</span>
                    <span className="bd-value">{b.notes}</span>
                  </div>
                )}
                {b.provider_name && (
                  <div className="booking-detail">
                    <span className="bd-label">Provider</span>
                    <span className="bd-value">{b.provider_name}</span>
                  </div>
                )}
              </div>
              <div className="booking-card-actions">
                {b.provider_id && ['accepted', 'assigned', 'started', 'pending_completion'].includes(b.status) && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/customer/messages/${b.provider_id}`)}
                  >
                    <MessageCircle size={16} /> Chat
                  </button>
                )}
                {b.status === 'pending' && (
                  <button className="btn btn-danger btn-sm"
                    onClick={() => api.cancelBooking(b.id).then(() => { toast.success('Cancelled'); window.location.reload(); })}
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                )}
                {b.status === 'pending_completion' && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => handleConfirm(b.id)}>
                      <ThumbsUp size={16} /> Confirm & Review
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => setComplaintTarget(b.id)}>
                      <AlertTriangle size={16} /> File Complaint
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <div className="modal-overlay" onClick={() => setReviewTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2>Leave a Review</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setReviewTarget(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <Star size={28} fill={star <= reviewForm.rating ? '#fbbf24' : 'none'}
                          color={star <= reviewForm.rating ? '#fbbf24' : '#cbd5e1'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment (optional)</label>
                  <textarea className="form-textarea" placeholder="Share your experience..."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setReviewTarget(null)}>Skip</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Form */}
      {complaintTarget && (
        <div className="modal-overlay" onClick={() => { setComplaintTarget(null); setComplaintForm({ subject: '', description: '' }); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>File a Complaint</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => { setComplaintTarget(null); setComplaintForm({ subject: '', description: '' }); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleFileComplaint}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input className="form-input" placeholder="Brief title of the issue"
                    value={complaintForm.subject}
                    onChange={e => setComplaintForm(f => ({ ...f, subject: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea className="form-textarea" placeholder="Describe the issue in detail..."
                    value={complaintForm.description}
                    onChange={e => setComplaintForm(f => ({ ...f, description: e.target.value }))} rows={4} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => { setComplaintTarget(null); setComplaintForm({ subject: '', description: '' }); }}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reviews ── */
function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyReviews()
      .then((data) => setReviews(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>My Reviews</h1>
        <p>Reviews you've given to service providers</p>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <h3>No reviews yet</h3>
          <p>Complete a booking to leave a review</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((r) => (
            <div key={r.id} className="card review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < r.rating ? '#fbbf24' : 'none'} color={i < r.rating ? '#fbbf24' : '#cbd5e1'} />
                ))}
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
              <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Complaints ── */
function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyComplaints()
      .then((data) => setComplaints(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>My Complaints</h1>
        <p>Track and manage your filed complaints</p>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>No complaints</h3>
          <p>You haven't filed any complaints yet</p>
        </div>
      ) : (
        <div className="bookings-list">
          {complaints.map((c) => (
            <div key={c.id} className="card booking-card">
              <div className="booking-card-header">
                <div>
                  <h3>{c.subject}</h3>
                  <p className="booking-meta">
                    Complaint #{c.id} · {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="booking-card-body">
                <p className="bd-value" style={{ fontSize: '0.9rem' }}>
                  {c.description}
                </p>
                {c.resolution_note && (
                  <div className="booking-detail">
                    <span className="bd-label">Resolution</span>
                    <span className="bd-value">{c.resolution_note}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── AI Chatbot ── */
function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I\'m your MeramotHub assistant. Describe your problem and I\'ll help you find the right service provider.' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setSending(true);

    try {
      const response = await api.chatBot(input);
      const botText = response?.reply || response?.message || response?.response || 'I can help you find services. Try describing your problem!';
      setMessages((m) => [...m, { role: 'bot', text: botText }]);
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, I\'m having trouble connecting. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="dash-header">
        <h1>AI Chatbot</h1>
        <p>Describe your problem and get service recommendations</p>
      </div>

      <div className="chat-container card">
        <div className="chat-messages" id="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="chat-avatar">
                {msg.role === 'bot' ? '🤖' : '👤'}
              </div>
              <div className="chat-bubble">{msg.text}</div>
            </div>
          ))}
          {sending && (
            <div className="chat-message bot">
              <div className="chat-avatar">🤖</div>
              <div className="chat-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>
        <form className="chat-input-bar" onSubmit={sendMessage}>
          <input
            type="text"
            className="form-input"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            id="chat-input"
          />
          <button type="submit" className="btn btn-primary" disabled={sending} id="chat-send">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Priyo ── */
function PriyoWorkshop() {
  return (
    <div>
      <div className="dash-header">
        <h1>Priyo Workshop</h1>
        <p>Save your favorite service providers for quick access</p>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">❤️</div>
        <h3>Coming Soon</h3>
        <p>Use instant booking to find Priyo-subscribed providers near you</p>
      </div>
    </div>
  );
}

/* ── Book Service ── */
function BookService() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceId = searchParams.get('service');

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(!!serviceId);
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [locationLat, setLocationLat] = useState(null);
  const [locationLng, setLocationLng] = useState(null);

  useEffect(() => {
    if (!serviceId) {
      setLoading(false);
      return;
    }
    api.getServiceItem(serviceId)
      .then((data) => setService(data))
      .catch(() => {
        toast.error('Could not load service details');
      })
      .finally(() => setLoading(false));
  }, [serviceId]);

  const handleLocationChange = (lat, lng, addr) => {
    setLocationLat(lat);
    setLocationLng(lng);
    setAddress(addr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceId || !address || !scheduledAt) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.createBooking({
        service_item_id: Number(serviceId),
        address,
        latitude: locationLat,
        longitude: locationLng,
        scheduled_at: new Date(scheduledAt).toISOString(),
        notes: notes || undefined,
      });
      toast.success('Booking created successfully!');
      navigate('/customer/bookings');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!serviceId) {
    return (
      <div>
        <div className="dash-header">
          <h1>Book a Service</h1>
          <p>No service selected</p>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🔧</div>
          <h3>No service selected</h3>
          <p>Please browse services and click "Book Now" on a service you need</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>Book a Service</h1>
        <p>Fill in the details to schedule your service</p>
      </div>

      {service && (
        <div className="card" style={{ padding: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h3>{service.name}</h3>
            {service.provider_id && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/customer/messages/${service.provider_id}`)}
              >
                <MessageCircle size={16} /> Chat
              </button>
            )}
          </div>
          {service.provider_name && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 4 }}>
              Provider: {service.provider_name}
            </p>
          )}
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Price: ৳{Number(service.base_price).toLocaleString()} / {service.unit}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form card" style={{ padding: 32 }}>
        <LocationPicker
          providerLat={service?.provider_latitude}
          providerLng={service?.provider_longitude}
          providerArea={service?.provider_area}
          onLocationChange={handleLocationChange}
        />

        <div className="form-group">
          <label className="form-label">Scheduled Date & Time *</label>
          <input
            type="datetime-local"
            className="form-input"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes (Optional)</label>
          <textarea
            className="form-textarea"
            placeholder="Any special instructions for the provider"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        <div className="form-actions" style={{ marginTop: 32 }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Browse Ads ── */
function BrowseServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getServiceItems().then(d => Array.isArray(d) ? d : d?.items || d?.data || []).catch(() => []),
      api.getCategories().then(d => Array.isArray(d) ? d : d?.data || []).catch(() => []),
    ]).then(([items, cats]) => {
      setServices(items);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = selectedCategory
    ? services.filter(s => String(s.category_id) === String(selectedCategory))
    : services;

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>Browse Services</h1>
        <p>Find the service you need and book instantly</p>
      </div>

      {categories.length > 0 && (
        <div className="form-group" style={{ maxWidth: 320, marginBottom: 32 }}>
          <label className="form-label">Filter by Category</label>
          <select className="form-select" value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔧</div>
          <h3>{selectedCategory ? 'No services in this category' : 'No services available'}</h3>
          <p>Check back later for new services</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filtered.map((s) => (
            <div key={s.id} className="booking-card card">
              <div className="booking-card-header">
                <div>
                  <h3>{s.name}</h3>
                  {s.description && (
                    <p className="booking-meta">{s.description}</p>
                  )}
                </div>
              </div>
              <div className="booking-card-body">
                <div className="booking-detail">
                  <span className="bd-label">Price</span>
                  <span className="bd-value">৳{Number(s.base_price).toLocaleString()} / {s.unit}</span>
                </div>
                {s.provider_area && (
                  <div className="booking-detail">
                    <span className="bd-label">Location</span>
                    <span className="bd-value">{s.provider_area}</span>
                  </div>
                )}
                {s.provider_name && (
                  <div className="booking-detail">
                    <span className="bd-label">Provider</span>
                    <span className="bd-value">{s.provider_name}</span>
                  </div>
                )}
              </div>
              <div className="booking-card-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/customer/book?service=${s.id}`)}
                >
                  Book Now
                </button>
                {s.provider_id && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/customer/messages/${s.provider_id}`)}
                  >
                    <MessageCircle size={16} /> Chat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Status Badge ── */
function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning',
    accepted: 'badge-info',
    started: 'badge-info',
    pending_completion: 'badge-info',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    disputed: 'badge-danger',
    open: 'badge-warning',
    assigned: 'badge-info',
    resolved: 'badge-success',
    dismissed: 'badge-neutral',
    held: 'badge-warning',
    released: 'badge-success',
    refunded: 'badge-danger',
  };

  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
}

/* ── Main Dashboard ── */
export default function CustomerDashboard() {
  return (
    <>
      <DashboardLayout navItems={NAV_ITEMS} title="Customer">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="reviews" element={<MyReviews />} />
          <Route path="complaints" element={<MyComplaints />} />
          <Route path="chat" element={<ChatBot />} />
          <Route path="book" element={<BookService />} />
          <Route path="ads" element={<BrowseServices />} />
          <Route path="priyo" element={<PriyoWorkshop />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/customer" replace />} />
        </Routes>
      </DashboardLayout>
    </>
  );
}
