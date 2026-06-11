import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Shield, AlertTriangle,
  CheckCircle, XCircle, BarChart3, RotateCcw, ThumbsUp, DollarSign
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ProfilePage from '../shared/ProfilePage';
import '../customer/CustomerDashboard.css';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    items: [
      { name: 'Overview', path: '/manager', icon: <LayoutDashboard size={18} /> },
      { name: 'Verifications', path: '/manager/verifications', icon: <Shield size={18} /> },
      { name: 'Complaints', path: '/manager/complaints', icon: <AlertTriangle size={18} /> },
    ],
  },

];

function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning', verified: 'badge-success', rejected: 'badge-danger',
    open: 'badge-warning', assigned: 'badge-info', resolved: 'badge-success',
    dismissed: 'badge-neutral', pending_approval: 'badge-warning', prog: 'badge-info',
    refunded: 'badge-danger', rework: 'badge-warning',
  };
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
}

/* ── Overview ── */
function Overview() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAreaManagerStats().catch(() => null),
      api.getAreaManagerRecentActivity().catch(() => null),
    ]).then(([s, a]) => {
      setStats(s);
      setRecentActivity(a);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>Area Manager Dashboard</h1>
        <p>Monitor and verify service providers in your area</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon teal"><Shield size={24} /></div>
          <div className="stat-info">
            <h3>{stats?.pending_verifications || 0}</h3>
            <p>Pending Verifications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <h3>{stats?.assigned_complaints || 0}</h3>
            <p>Assigned Complaints</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <h3>{stats?.resolved_complaints || 0}</h3>
            <p>Resolved</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><BarChart3 size={24} /></div>
          <div className="stat-info">
            <h3>{stats?.verified_providers || 0}</h3>
            <p>Verified Providers</p>
          </div>
        </div>
      </div>

      <div className="dash-section" style={{ marginTop: 48 }}>
        <h2>Recent Activity</h2>
        {(!recentActivity || (!recentActivity.pending_verifications?.length && !recentActivity.recent_complaints?.length)) ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No recent activity</h3>
            <p>Pending verifications and complaints will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {recentActivity.pending_verifications?.length > 0 && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={18} /> Pending Verifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentActivity.pending_verifications.map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.full_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{p.skill_category}</div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {recentActivity.recent_complaints?.length > 0 && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={18} /> Recent Complaints
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentActivity.recent_complaints.map((c) => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.subject}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusBadge status={c.status} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Verifications ── */
function Verifications() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPending = () => {
    api.getPendingProviders()
      .then((data) => setPending(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPending(); }, []);

  const handleVerify = async (id, action) => {
    try {
      await api.verifyProvider(id, { action });
      toast.success(`Provider ${action}`);
      loadPending();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>Verify Service Providers</h1>
        <p>Review NID and credentials of new service providers</p>
      </div>

      {pending.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>All caught up!</h3>
          <p>No pending verification requests</p>
        </div>
      ) : (
        <div className="bookings-list">
          {pending.map((p) => (
            <div key={p.id} className="booking-card card">
              <div className="booking-card-header">
                <div>
                  <h3>Provider #{p.id} — {p.skill_category}</h3>
                  <p className="booking-meta">
                    NID: {p.nid_number} · Experience: {p.experience_years} years · Area: {p.area || 'N/A'}
                  </p>
                </div>
                <StatusBadge status={p.verification_status} />
              </div>
              {p.bio && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8, lineHeight: 1.5 }}>
                  {p.bio}
                </p>
              )}
              <div className="booking-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleVerify(p.id, 'verified')}>
                  <CheckCircle size={16} /> Approve
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleVerify(p.id, 'rejected')}>
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Complaints ── */
function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadComplaints = () => {
    api.getAllComplaints()
      .then((data) => setComplaints(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadComplaints(); }, []);

  const handleResolve = async (id, resolution) => {
    try {
      if (resolution === 'rework') {
        await api.reworkBooking(id);
        toast.success('Rework approved — booking rebooked, check dashboards for pending work');
      } else {
        await api.resolveComplaint(id, {
          resolution,
          resolution_note: resolution === 'refund'
            ? 'Refund initiated — customer gets 90% back, 10% commission held'
            : 'Resolved — work completed, provider paid',
        });
        toast.success(resolution === 'refund' ? 'Sent for admin approval' : 'Complaint resolved');
      }
      loadComplaints();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>Handle Complaints</h1>
        <p>Investigate and resolve customer complaints</p>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>No complaints</h3>
          <p>No complaints assigned to you</p>
        </div>
      ) : (
        <div className="bookings-list">
          {complaints.map((c) => (
            <div key={c.id} className="booking-card card">
              <div className="booking-card-header">
                <div>
                  <h3>{c.subject}</h3>
                  <p className="booking-meta">
                    #{c.id} · Booking: {String(c.booking_id).slice(0, 8)} · {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>
                {c.description}
              </p>
              {c.status !== 'resolved' && c.status !== 'dismissed' && c.status !== 'pending_approval' && c.status !== 'refunded' && c.status !== 'rework' && (
                <div className="booking-card-actions">
                  <button className="btn btn-danger btn-sm" onClick={() => handleResolve(c.id, 'refund')}>
                    <DollarSign size={14} /> Refund
                  </button>
                  <button className="btn btn-warning btn-sm" onClick={() => handleResolve(c.id, 'rework')}>
                    <RotateCcw size={14} /> Rework
                  </button>
                  <button className="btn btn-success btn-sm" onClick={() => handleResolve(c.id, 'resolve')}>
                    <ThumbsUp size={14} /> Resolve
                  </button>
                </div>
              )}
              {c.status === 'pending_approval' && (
                <div className="booking-detail" style={{ marginTop: 12 }}>
                  <span className="bd-label">Status</span>
                  <span className="bd-value" style={{ color: 'var(--warning)' }}>
                    Awaiting admin approval — 90% refund to customer (10% commission) will execute once approved
                  </span>
                </div>
              )}
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

export default function ManagerDashboard() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Area Manager">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="verifications" element={<Verifications />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/manager" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
