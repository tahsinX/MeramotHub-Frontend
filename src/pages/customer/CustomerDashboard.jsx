import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, Star, AlertTriangle,
  MessageCircle, Heart, Clock, CheckCircle, XCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/client';
import toast from 'react-hot-toast';
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
      { name: 'My Complaints', path: '/customer/complaints', icon: <AlertTriangle size={18} /> },
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

  useEffect(() => {
    api.getMyBookings()
      .then((data) => setBookings(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
              </div>
              <div className="booking-card-actions">
                {b.status === 'pending' && (
                  <button className="btn btn-danger btn-sm"
                    onClick={() => api.cancelBooking(b.id).then(() => { toast.success('Cancelled'); window.location.reload(); })}
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                )}
                {b.status === 'completed' && (
                  <button className="btn btn-primary btn-sm"
                    onClick={() => window.location.href = '/customer/reviews'}
                  >
                    <Star size={16} /> Leave Review
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
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>
                {c.description}
              </p>
              {c.resolution_note && (
                <div className="booking-detail" style={{ marginTop: 12 }}>
                  <span className="bd-label">Resolution</span>
                  <span className="bd-value">{c.resolution_note}</span>
                </div>
              )}
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

/* ── Status Badge ── */
function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning',
    accepted: 'badge-info',
    started: 'badge-info',
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
    <DashboardLayout navItems={NAV_ITEMS} title="Customer">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="reviews" element={<MyReviews />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="chat" element={<ChatBot />} />
        <Route path="priyo" element={<PriyoWorkshop />} />
        <Route path="*" element={<Navigate to="/customer" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
