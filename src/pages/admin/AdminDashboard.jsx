import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, DollarSign, AlertTriangle,
  Shield, CheckCircle, XCircle, UserCog, BarChart3,
  TrendingUp, Activity, UserPlus, MapPin, Phone, Mail, Eye, EyeOff
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
      { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={18} /> },
      { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Complaints', path: '/admin/complaints', icon: <AlertTriangle size={18} /> },
      { name: 'Verifications', path: '/admin/verifications', icon: <Shield size={18} /> },
      { name: 'Provider Approvals', path: '/admin/provider-approvals', icon: <UserCog size={18} /> },
    ],
  },
  {
    label: 'Management',
    items: [
      { name: 'Add Area Manager', path: '/admin/add-area-manager', icon: <UserPlus size={18} /> },
    ],
  },

];

function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning', accepted: 'badge-info', started: 'badge-info',
    completed: 'badge-success', cancelled: 'badge-danger', disputed: 'badge-danger',
    open: 'badge-warning', assigned: 'badge-info', resolved: 'badge-success',
    dismissed: 'badge-neutral', verified: 'badge-success', rejected: 'badge-danger',
  };
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
}

/* ── Overview ── */
function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and system monitoring</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon teal"><Users size={24} /></div>
          <div className="stat-info">
            <h3>{stats?.total_users || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><BarChart3 size={24} /></div>
          <div className="stat-info">
            <h3>{stats?.total_bookings || 0}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><DollarSign size={24} /></div>
          <div className="stat-info">
            <h3>৳{stats?.total_revenue ? Number(stats.total_revenue).toLocaleString() : '0'}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <h3>{stats?.open_complaints || 0}</h3>
            <p>Open Complaints</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Shield size={24} /></div>
          <div className="stat-info">
            <h3>{stats?.pending_verifications || 0}</h3>
            <p>Pending Verifications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Activity size={24} /></div>
          <div className="stat-info">
            <h3>{stats?.active_providers || 0}</h3>
            <p>Active Providers</p>
          </div>
        </div>
      </div>

      {/* Platform Health Indicator */}
      <div className="card" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-md)' }}>
          <TrendingUp size={20} color="var(--success)" />
          <h3 style={{ fontSize: '1.1rem' }}>Platform Health</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
          <div className="booking-detail">
            <span className="bd-label">Customers</span>
            <span className="bd-value">{stats?.total_customers || 0}</span>
          </div>
          <div className="booking-detail">
            <span className="bd-label">Service Providers</span>
            <span className="bd-value">{stats?.total_providers || 0}</span>
          </div>
          <div className="booking-detail">
            <span className="bd-label">Area Managers</span>
            <span className="bd-value">{stats?.total_area_managers || 0}</span>
          </div>
          <div className="booking-detail">
            <span className="bd-label">Completion Rate</span>
            <span className="bd-value">{stats?.completion_rate || '0'}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Users Management ── */
function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadUsers = () => {
    api.getAdminUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggle = async (user) => {
    try {
      if (user.is_active) {
        await api.deactivateUser(user.id);
        toast.success('User deactivated');
      } else {
        await api.activateUser(user.id);
        toast.success('User activated');
      }
      loadUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.role === filter);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>User Management</h1>
        <p>Manage all platform users</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        {['all', 'customer', 'service_provider', 'area_manager', 'admin'].map(r => (
          <button key={r} className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(r)}>
            {r === 'all' ? 'All' : r.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.full_name}</strong></td>
                <td>{u.phone_number}</td>
                <td><span className="badge badge-neutral">{u.role}</span></td>
                <td>
                  <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  {u.role === 'admin' ? (
                    <span className="badge badge-neutral">—</span>
                  ) : (
                    <button
                      className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => handleToggle(u)}
                    >
                      {u.is_active ? <><XCircle size={14} /> Deactivate</> : <><CheckCircle size={14} /> Activate</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Complaints ── */
function ComplaintsManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllComplaints()
      .then((data) => setComplaints(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>Complaints</h1>
        <p>Monitor and manage customer complaints</p>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>No complaints</h3>
          <p>All clear! No complaints have been filed.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {complaints.map((c) => (
            <div key={c.id} className="booking-card card">
              <div className="booking-card-header">
                <div>
                  <h3>{c.subject}</h3>
                  <p className="booking-meta">
                    #{c.id} · Filed by {c.filed_by?.slice(0, 8)} · {new Date(c.created_at).toLocaleDateString()}
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
        <h1>Provider Verifications</h1>
        <p>Review and verify pending service provider registrations</p>
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
                  <h3>Provider #{p.id}</h3>
                  <p className="booking-meta">
                    NID: {p.nid_number} · Skill: {p.skill_category} · {p.experience_years}y exp
                  </p>
                </div>
                <StatusBadge status={p.verification_status} />
              </div>
              {p.bio && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>{p.bio}</p>}
              <div className="booking-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleVerify(p.id, 'verified')}>
                  <CheckCircle size={16} /> Verify
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

/* ── Provider Approvals ── */
function ProviderApprovals() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProviders = () => {
    api.getVerifiedProviders()
      .then((data) => setProviders(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProviders(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.approveProvider(id);
      toast.success('Provider approved successfully');
      loadProviders();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>Provider Approvals</h1>
        <p>Approve verified service providers to grant full platform access</p>
      </div>

      {providers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>All caught up!</h3>
          <p>No providers waiting for admin approval</p>
        </div>
      ) : (
        <div className="bookings-list">
          {providers.map((p) => (
            <div key={p.id} className="booking-card card">
              <div className="booking-card-header">
                <div>
                  <h3>{p.full_name || `Provider #${p.id}`}</h3>
                  <p className="booking-meta">
                    NID: {p.nid_number} · Skill: {p.skill_category} · {p.experience_years}y exp · Area: {p.area || 'N/A'}
                  </p>
                </div>
                <span className="badge badge-success">Verified</span>
              </div>
              {p.bio && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>{p.bio}</p>
              )}
              <div className="booking-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleApprove(p.id)}>
                  <CheckCircle size={16} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Add Area Manager ── */
function AddAreaManager() {
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: '',
    area: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createAreaManager(form);
      toast.success('Area manager created successfully');
      setForm({ full_name: '', phone_number: '', email: '', password: '', area: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="dash-header">
        <h1>Add Area Manager</h1>
        <p>Create a new area manager account</p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 560, padding: 'var(--space-xl)' }}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <div className="input-with-icon">
            <Phone size={16} />
            <input
              className="form-input"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="e.g. 017XXXXXXXX"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="input-with-icon">
            <Mail size={16} />
            <input
              className="form-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-with-icon">
            <input
              className="form-input"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
            <button type="button" className="btn-icon" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', padding: '0 8px', cursor: 'pointer' }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Assigned Area</label>
          <div className="input-with-icon">
            <MapPin size={16} />
            <input
              className="form-input"
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder="e.g. Dhaka, Mirpur"
              required
            />
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: 'var(--space-lg)' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : <><UserPlus size={16} /> Create Area Manager</>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Admin">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="complaints" element={<ComplaintsManagement />} />
        <Route path="verifications" element={<Verifications />} />
        <Route path="provider-approvals" element={<ProviderApprovals />} />
        <Route path="add-area-manager" element={<AddAreaManager />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
