import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, DollarSign, MapPin,
  Star, CheckCircle, Clock, XCircle, ToggleLeft, ToggleRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/client';
import toast from 'react-hot-toast';
import '../customer/CustomerDashboard.css';

const NAV_ITEMS = [
  {
    label: 'Main',
    items: [
      { name: 'Overview', path: '/provider', icon: <LayoutDashboard size={18} /> },
      { name: 'My Jobs', path: '/provider/jobs', icon: <Briefcase size={18} /> },
      { name: 'Earnings', path: '/provider/earnings', icon: <DollarSign size={18} /> },
    ],
  },
  {
    label: 'Settings',
    items: [
      { name: 'Profile', path: '/provider/profile', icon: <MapPin size={18} /> },
    ],
  },
];

function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning', accepted: 'badge-info', started: 'badge-info',
    completed: 'badge-success', cancelled: 'badge-danger', disputed: 'badge-danger',
  };
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
}

/* ── Overview ── */
function Overview() {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAssignedJobs().then(d => Array.isArray(d) ? d : d?.data || []).catch(() => []),
      api.getMyProviderProfile().catch(() => null),
    ]).then(([j, p]) => {
      setJobs(j);
      setProfile(p);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => ['accepted', 'started'].includes(j.status)).length,
    completed: jobs.filter(j => j.status === 'completed').length,
    pending: jobs.filter(j => j.status === 'pending').length,
  };

  return (
    <div>
      <div className="dash-header">
        <h1>Provider Dashboard</h1>
        <p>Manage your jobs and track performance</p>
      </div>

      {profile && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="stat-icon teal"><Star size={24} /></div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {Number(profile.rating_avg).toFixed(1)} ★
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {profile.rating_count} reviews · {profile.skill_category}
              </div>
            </div>
          </div>
          <StatusBadge status={profile.verification_status} />
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon teal"><Briefcase size={24} /></div>
          <div className="stat-info"><h3>{stats.total}</h3><p>Total Jobs</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Clock size={24} /></div>
          <div className="stat-info"><h3>{stats.pending}</h3><p>Pending</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Star size={24} /></div>
          <div className="stat-info"><h3>{stats.active}</h3><p>In Progress</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={24} /></div>
          <div className="stat-info"><h3>{stats.completed}</h3><p>Completed</p></div>
        </div>
      </div>
    </div>
  );
}

/* ── My Jobs ── */
function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = () => {
    api.getAssignedJobs()
      .then(d => setJobs(Array.isArray(d) ? d : d?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadJobs(); }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === 'accept') await api.acceptBooking(id);
      else if (action === 'start') await api.startBooking(id);
      else if (action === 'complete') await api.completeBooking(id);
      toast.success(`Job ${action}ed!`);
      loadJobs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>My Jobs</h1>
        <p>View and manage assigned service requests</p>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <h3>No jobs assigned</h3>
          <p>New job requests will appear here</p>
        </div>
      ) : (
        <div className="bookings-list">
          {jobs.map((b) => (
            <div key={b.id} className="booking-card card">
              <div className="booking-card-header">
                <div>
                  <h3>{b.address}</h3>
                  <p className="booking-meta">
                    Job #{b.id.slice(0, 8)} · {b.booking_type} · ৳{Number(b.total_price).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="booking-card-actions">
                {b.status === 'pending' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleAction(b.id, 'accept')}>
                    <CheckCircle size={16} /> Accept
                  </button>
                )}
                {b.status === 'accepted' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleAction(b.id, 'start')}>
                    <Clock size={16} /> Start Work
                  </button>
                )}
                {b.status === 'started' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleAction(b.id, 'complete')}>
                    <CheckCircle size={16} /> Mark Complete
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

/* ── Earnings ── */
function Earnings() {
  const [dashboard, setDashboard] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPaymentDashboard().catch(() => null),
      api.getMyEarnings().then(d => Array.isArray(d) ? d : d?.data || []).catch(() => []),
    ]).then(([d, e]) => {
      setDashboard(d);
      setEarnings(e);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>Earnings</h1>
        <p>Track your income and payment history</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><DollarSign size={24} /></div>
          <div className="stat-info">
            <h3>৳{dashboard?.total_earned ? Number(dashboard.total_earned).toLocaleString() : '0'}</h3>
            <p>Total Earned</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Clock size={24} /></div>
          <div className="stat-info">
            <h3>৳{dashboard?.pending_amount ? Number(dashboard.pending_amount).toLocaleString() : '0'}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><XCircle size={24} /></div>
          <div className="stat-info">
            <h3>৳{dashboard?.commission_total ? Number(dashboard.commission_total).toLocaleString() : '0'}</h3>
            <p>Commission Paid</p>
          </div>
        </div>
      </div>

      {earnings.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Commission</th>
                <th>Net</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((e) => (
                <tr key={e.id}>
                  <td>৳{Number(e.amount).toLocaleString()}</td>
                  <td>৳{Number(e.commission_amount).toLocaleString()}</td>
                  <td><strong>৳{Number(e.provider_amount).toLocaleString()}</strong></td>
                  <td><StatusBadge status={e.status} /></td>
                  <td>{new Date(e.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Profile ── */
function ProviderProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    nid_number: '', skill_category: 'electrician', experience_years: 1, bio: '', area: '',
  });

  useEffect(() => {
    api.getMyProviderProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const p = await api.createProviderProfile(formData);
      setProfile(p);
      toast.success('Profile created! Awaiting verification.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      await api.updateProviderLocation({
        current_latitude: profile?.current_latitude || 23.8103,
        current_longitude: profile?.current_longitude || 90.4125,
        is_available: !profile.is_available,
      });
      setProfile((p) => ({ ...p, is_available: !p.is_available }));
      toast.success(profile.is_available ? 'Marked unavailable' : 'Marked available');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  if (!profile) {
    return (
      <div>
        <div className="dash-header">
          <h1>Create Profile</h1>
          <p>Set up your service provider profile to start receiving jobs</p>
        </div>
        <div className="card" style={{ maxWidth: 500, padding: 'var(--space-xl)' }}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">NID Number</label>
              <input className="form-input" required value={formData.nid_number}
                onChange={e => setFormData(p => ({ ...p, nid_number: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Skill Category</label>
              <select className="form-select" value={formData.skill_category}
                onChange={e => setFormData(p => ({ ...p, skill_category: e.target.value }))}>
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="ac_mechanic">AC Mechanic</option>
                <option value="carpenter">Carpenter</option>
                <option value="painter">Painter</option>
                <option value="welder">Welder</option>
                <option value="mason">Mason</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Experience (years)</label>
              <input type="number" className="form-input" min="0" value={formData.experience_years}
                onChange={e => setFormData(p => ({ ...p, experience_years: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Area</label>
              <input className="form-input" placeholder="e.g., Mirpur, Dhaka" value={formData.area}
                onChange={e => setFormData(p => ({ ...p, area: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" placeholder="Tell customers about yourself..." value={formData.bio}
                onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="dash-header">
        <h1>My Profile</h1>
        <p>Manage your service provider profile</p>
      </div>

      <div className="card" style={{ padding: 'var(--space-xl)', maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <h3>Availability</h3>
          <button className="btn btn-ghost" onClick={toggleAvailability}>
            {profile.is_available ? (
              <><ToggleRight size={24} color="var(--success)" /> <span style={{ color: 'var(--success)' }}>Available</span></>
            ) : (
              <><ToggleLeft size={24} /> <span>Unavailable</span></>
            )}
          </button>
        </div>
        <div className="booking-card-body" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="booking-detail"><span className="bd-label">Skill</span><span className="bd-value">{profile.skill_category}</span></div>
          <div className="booking-detail"><span className="bd-label">Experience</span><span className="bd-value">{profile.experience_years} years</span></div>
          <div className="booking-detail"><span className="bd-label">Area</span><span className="bd-value">{profile.area || 'Not set'}</span></div>
          <div className="booking-detail"><span className="bd-label">Rating</span><span className="bd-value">{Number(profile.rating_avg).toFixed(1)} ★ ({profile.rating_count})</span></div>
          <div className="booking-detail"><span className="bd-label">Verification</span><StatusBadge status={profile.verification_status} /></div>
          <div className="booking-detail"><span className="bd-label">NID</span><span className="bd-value">{profile.nid_number}</span></div>
        </div>
      </div>
    </div>
  );
}

export default function ProviderDashboard() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Service Provider">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="jobs" element={<MyJobs />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="profile" element={<ProviderProfile />} />
        <Route path="*" element={<Navigate to="/provider" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
