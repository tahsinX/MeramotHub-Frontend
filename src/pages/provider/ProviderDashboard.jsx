import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, DollarSign, PlusCircle, X,
  Star, CheckCircle, Clock, XCircle, ToggleLeft, ToggleRight, User, MessageCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ProfilePage from '../shared/ProfilePage';
import ChatPage from '../shared/ChatPage';
import LocationPicker from '../../components/LocationPicker';
import '../customer/CustomerDashboard.css';

const NAV_ITEMS = [
  {
    label: 'Main',
    items: [
      { name: 'Overview', path: '/provider', icon: <LayoutDashboard size={18} /> },
      { name: 'My Jobs', path: '/provider/jobs', icon: <Briefcase size={18} /> },
      { name: 'Post Job', path: '/provider/post-job', icon: <PlusCircle size={18} /> },
      { name: 'Earnings', path: '/provider/earnings', icon: <DollarSign size={18} /> },
    ],
  },
  {
    label: 'Communication',
    items: [
      { name: 'Messages', path: '/provider/messages', icon: <MessageCircle size={18} /> },
    ],
  },
];

function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning', accepted: 'badge-info', started: 'badge-info',
    pending_completion: 'badge-info', completed: 'badge-success',
    cancelled: 'badge-danger', disputed: 'badge-danger',
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

      <div className="dash-section">
        <h2>Recent Jobs</h2>
        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No jobs yet</h3>
            <p>New bookings will appear here once customers book your services</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 5).map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{b.id?.slice(0, 8)}...</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>৳{Number(b.total_price).toLocaleString()}</td>
                    <td>{new Date(b.created_at).toLocaleDateString()}</td>
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
                {b.status === 'pending_completion' && (
                  <span style={{ fontSize: 13, color: '#666' }}>⏳ Awaiting customer confirmation</span>
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
      api.getProviderEarningsSummary().catch(() => null),
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

/* ── Post Job ── */
function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [profile, setProfile] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    base_price: '',
    unit: 'per_unit',
    description: '',
  });
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', base_price: '', unit: '', description: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const addItem = (item) => {
    setMyItems(prev => [item, ...prev]);
  };

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getCategories().then(d => Array.isArray(d) ? d : d?.data || []).catch(() => []),
      api.getMyProviderProfile().catch(() => null),
      api.getMyServiceItems().then(d => Array.isArray(d) ? d : d?.data || []).catch(() => []),
    ]).then(([cats, prof, items]) => {
      setCategories(cats);
      setProfile(prof);
      setMyItems(items);
      if (prof?.skill_category && !form.category_id) {
        const match = cats.find(
          c => c.name.toLowerCase() === prof.skill_category.toLowerCase()
        );
        if (match) {
          setForm(f => ({ ...f, category_id: String(match.id) }));
        }
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.base_price) {
      toast.error('Please fill in name and price');
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.createServiceItem({
        name: form.name,
        category_id: Number(form.category_id),
        base_price: Number(form.base_price),
        unit: form.unit,
        description: form.description || undefined,
      });
      toast.success('Job posted successfully!');
      addItem(created);
      setForm(f => ({ ...f, name: '', base_price: '', unit: 'per_unit', description: '' }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const updated = await api.toggleServiceItemStatus(item.id);
      setMyItems(prev => prev.map(i => i.id === item.id ? updated : i));
      toast.success(updated.is_active ? 'Job is now available' : 'Job discontinued');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditClick = (item) => {
    setEditTarget(item);
    setEditForm({
      name: item.name,
      base_price: String(item.base_price),
      unit: item.unit,
      description: item.description || '',
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.base_price) {
      toast.error('Name and price are required');
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await api.editServiceItem(editTarget.id, {
        name: editForm.name,
        base_price: Number(editForm.base_price),
        unit: editForm.unit,
        description: editForm.description || undefined,
      });
      setMyItems(prev => prev.map(i => i.id === editTarget.id ? updated : i));
      toast.success('Job updated successfully');
      setEditTarget(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const categoryName = categories.find(c => String(c.id) === form.category_id)?.name;

  const missingFields = [];
  if (!user?.nid_number) missingFields.push('NID Number');
  if (!user?.area) missingFields.push('Address');
  if (!profile?.nid_image_url) missingFields.push('NID Image Upload');
  const profileIncomplete = missingFields.length > 0;

  return (
    <div>
      <div className="dash-header">
        <h1>Post a Job</h1>
        <p>Create a service listing to find customers</p>
      </div>

      {profileIncomplete && (
        <div className="card" style={{
          maxWidth: 560, marginBottom: 'var(--space-lg)', padding: 'var(--space-lg)',
          border: '1px solid #fde68a', background: '#fffbeb',
        }}>
          <h3 style={{ color: '#92400e', marginBottom: 8, fontSize: '0.95rem' }}>
            ⚠ Complete Your Profile First
          </h3>
          <p style={{ color: '#92400e', fontSize: '0.85rem', marginBottom: 12 }}>
            You must fill in the following before posting a job:
          </p>
          <ul style={{ margin: '0 0 12px 20px', color: '#92400e', fontSize: '0.85rem' }}>
            {missingFields.map(f => <li key={f}>{f}</li>)}
          </ul>
          <a href="/provider/account" className="btn btn-primary btn-sm"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Go to Profile
          </a>
        </div>
      )}

      {!profileIncomplete && (
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 560, padding: 'var(--space-xl)' }}>
        <div className="form-group">
          <label className="form-label">Service Name *</label>
          <input className="form-input" placeholder="e.g., Pipe Repair, Drain Cleaning" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <input className="form-input" value={categoryName || 'Loading...'} disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            Your skill category is fixed based on your provider profile
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Price *</label>
            <input type="number" className="form-input" placeholder="0" min="0" value={form.base_price}
              onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Unit</label>
            <select className="form-select" value={form.unit}
              onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
              <option value="per_unit">Per Unit</option>
              <option value="per_hour">Per Hour</option>
              <option value="per_visit">Per Visit</option>
              <option value="per_day">Per Day</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" placeholder="Describe what you offer..." rows={4}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div className="form-actions" style={{ marginTop: 32 }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
      )}

      {/* Posted Jobs History */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <div className="dash-header" style={{ marginBottom: 'var(--space-lg)' }}>
          <h2>Posted Jobs History</h2>
          <p>All service listings you have created</p>
        </div>

        {myItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No jobs posted yet</h3>
            <p>Use the form above to create your first service listing</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {myItems.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td><span className="badge badge-neutral">{item.category_name || categoryName}</span></td>
                    <td>৳{Number(item.base_price).toLocaleString()}</td>
                    <td>{item.unit?.replace(/_/g, ' ') || '—'}</td>
                    <td><span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {item.is_active ? 'Available' : 'Discontinued'}
                    </span></td>
                    <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(item)} title="Edit">
                          ✏️
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleToggleStatus(item)}
                          title={item.is_active ? 'Discontinue' : 'Make available'}>
                          {item.is_active ? <ToggleLeft size={18} /> : <ToggleRight size={18} color="var(--success)" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Edit Job</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setEditTarget(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input className="form-input" value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Price</label>
                  <input type="number" className="form-input" min="0" step="0.01" value={editForm.base_price}
                    onChange={e => setEditForm(f => ({ ...f, base_price: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="form-select" value={editForm.unit}
                    onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))}>
                    <option value="per_unit">Per Unit</option>
                    <option value="per_hour">Per Hour</option>
                    <option value="per_visit">Per Visit</option>
                    <option value="per_day">Per Day</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows={3} value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditTarget(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
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

/* ── Combined Onboarding (for unverified providers) ── */
function ProviderOnboarding() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploadingNid, setUploadingNid] = useState(false);
  const [nidImageUrl, setNidImageUrl] = useState(user?.nid_image_url || '');
  const [nidFileName, setNidFileName] = useState('');
  const [nidFileSize, setNidFileSize] = useState(0);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    email: user?.email || '',
    nid_number: user?.nid_number || '',
    area: user?.area || '',
    skill_category: 'electrician',
    experience_years: 1,
    bio: '',
  });
  const [locationLat, setLocationLat] = useState(user?.latitude || null);
  const [locationLng, setLocationLng] = useState(user?.longitude || null);

  useEffect(() => {
    api.getMyProviderProfile()
      .then((p) => {
        setProfile(p);
        setForm(f => ({
          ...f,
          nid_number: user?.nid_number || '',
          area: user?.area || '',
          skill_category: p.skill_category || 'electrician',
          experience_years: p.experience_years || 1,
          bio: p.bio || '',
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleLocationChange = (lat, lng, addr) => {
    setLocationLat(lat);
    setLocationLng(lng);
    setForm(f => ({ ...f, area: addr }));
  };

  const uploadNidFile = async (file) => {
    if (!file) return;
    setUploadingNid(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.upload('/providers/profile/upload-nid', formData);
      setNidImageUrl(res.url);
      setNidFileName(res.original_name || file.name);
      setNidFileSize(file.size);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingNid(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const profilePayload = {
        nid_number: form.nid_number,
        skill_category: form.skill_category,
        experience_years: Number(form.experience_years),
        bio: form.bio || undefined,
        area: form.area,
        nid_image_url: nidImageUrl || undefined,
      };

      if (!profile) {
        await api.createProviderProfile(profilePayload);
      } else {
        await api.patch('/providers/profile', {
          skill_category: form.skill_category,
          experience_years: Number(form.experience_years),
          bio: form.bio || undefined,
          nid_image_url: nidImageUrl || undefined,
        });
      }

      const userPayload = {};
      if (form.full_name !== user?.full_name) userPayload.full_name = form.full_name;
      if (form.phone_number !== user?.phone_number) userPayload.phone_number = form.phone_number;
      if (form.email !== (user?.email || '')) userPayload.email = form.email;
      if (form.area !== (user?.area || '')) userPayload.area = form.area;
      if (locationLat !== (user?.latitude || null)) userPayload.latitude = locationLat;
      if (locationLng !== (user?.longitude || null)) userPayload.longitude = locationLng;
      if (Object.keys(userPayload).length > 0) {
        const updated = await api.updateProfile(userPayload);
        updateUser?.(updated);
      }

      toast.success(profile ? 'Profile updated!' : 'Profile created! Awaiting verification.');
      if (!profile) {
        setProfile({ skill_category: form.skill_category });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1>Complete Your Profile</h1>
        <p>Fill in all details to start receiving service requests</p>
      </div>

      <div className="card" style={{ maxWidth: 600, padding: 'var(--space-xl)' }}>
        <form onSubmit={handleSave}>
          <h3 style={{ marginBottom: 16, fontSize: '1rem', color: 'var(--text-muted)' }}>Personal Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.full_name}
                onChange={e => handleChange('full_name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={form.phone_number}
                onChange={e => handleChange('phone_number', e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input type="email" className="form-input" placeholder="your@email.com" value={form.email}
              onChange={e => handleChange('email', e.target.value)} />
          </div>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
          <h3 style={{ marginBottom: 16, fontSize: '1rem', color: 'var(--text-muted)' }}>Service Provider Details</h3>

          <div className="form-group">
            <label className="form-label">NID Number</label>
            <input className="form-input" value={form.nid_number}
              onChange={e => handleChange('nid_number', e.target.value)}
              disabled={!!profile}
              style={profile ? { opacity: 0.6, cursor: 'not-allowed' } : {}} required />
          </div>

          <div className="form-group">
            <label className="form-label">NID Image</label>
            {nidImageUrl ? (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12, background: '#fff' }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 20 }}>📄</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nidFileName || 'NID image'}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {nidFileSize ? formatFileSize(nidFileSize) : 'Image'}
                  </div>
                </div>
                <div onClick={() => { setNidImageUrl(''); setNidFileName(''); setNidFileSize(0); }}
                  style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', fontSize: 16, flexShrink: 0, lineHeight: 1, userSelect: 'none' }}>✕</div>
              </div>
            ) : uploadingNid ? (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, background: '#fafafa' }}>
                <div style={{ fontWeight: 600, color: '#374151', marginBottom: 10, fontSize: 13 }}>Uploading…</div>
                <div style={{ width: '100%', height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg, #2563eb 30%, #60a5fa 50%, #2563eb 70%)', backgroundSize: '200% 100%', borderRadius: 3, animation: 'shimmer 1s infinite' }} />
                </div>
              </div>
            ) : (
              <label onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; uploadNidFile(e.dataTransfer.files[0]); }}
                style={{ border: '2px dashed #d1d5db', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', transition: 'all .2s', background: '#f9fafb', userSelect: 'none', display: 'block' }}>
                <div style={{ fontSize: 36, marginBottom: 8, lineHeight: 1 }}>📄</div>
                <p style={{ fontWeight: 600, color: '#374151', marginBottom: 4, fontSize: 14 }}>Drag & drop NID image here</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>or <span style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>click to choose file</span></p>
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { uploadNidFile(e.target.files?.[0]); if (e.target) e.target.value = ''; }} />
              </label>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Skill Category</label>
              <select className="form-select" value={form.skill_category}
                onChange={e => handleChange('skill_category', e.target.value)}>
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
              <input type="number" className="form-input" min="0" value={form.experience_years}
                onChange={e => handleChange('experience_years', parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="form-textarea" placeholder="Tell customers about yourself..." rows={3} value={form.bio}
              onChange={e => handleChange('bio', e.target.value)} />
          </div>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
          <h3 style={{ marginBottom: 16, fontSize: '1rem', color: 'var(--text-muted)' }}>Service Area</h3>

          <LocationPicker
            label="Address"
            showDistance={false}
            initialLat={user?.latitude}
            initialLng={user?.longitude}
            initialAddress={user?.area || ''}
            onLocationChange={handleLocationChange}
          />

          <div className="form-actions" style={{ marginTop: 32 }}>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Saving...' : (profile ? 'Update Profile' : 'Submit for Verification')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PendingApproval() {
  const { user } = useAuth();
  return (
    <div>
      <div className="dash-header">
        <h1>Account Pending Approval</h1>
        <p>Your account is being reviewed</p>
      </div>
      <div className="card" style={{ maxWidth: 560, padding: 'var(--space-xl)', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <h3 style={{ marginBottom: 8 }}>
          {!user?.is_verified
            ? 'Profile Created — Awaiting Area Manager Verification'
            : 'Verified — Awaiting Admin Approval'}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {!user?.is_verified
            ? 'Your provider profile has been submitted. An area manager will review your documents and verify your account. You will be notified once verified.'
            : 'Your account has been verified by an area manager. An admin will review and grant you full access shortly. Please check back later.'}
        </p>
      </div>
    </div>
  );
}

export default function ProviderDashboard() {
  const { user, isVerified, isApproved } = useAuth();

  if (!isVerified) {
    return (
      <DashboardLayout navItems={[]} title="Service Provider">
        <Routes>
          <Route index element={<ProviderOnboarding />} />
          <Route path="*" element={<Navigate to="/provider" replace />} />
        </Routes>
      </DashboardLayout>
    );
  }

  if (!isApproved) {
    const limitedNav = [
      {
        label: 'Main',
        items: [
          { name: 'Overview', path: '/provider', icon: <LayoutDashboard size={18} /> },
        ],
      },
    ];
    return (
      <DashboardLayout navItems={limitedNav} title="Service Provider">
        <Routes>
          <Route index element={<PendingApproval />} />
          <Route path="profile" element={<ProviderProfile />} />
          <Route path="account" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/provider" replace />} />
        </Routes>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Service Provider">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="jobs" element={<MyJobs />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="profile" element={<ProviderProfile />} />
        <Route path="account" element={<ProfilePage />} />
        <Route path="messages" element={<ChatPage />} />
        <Route path="messages/:userId" element={<ChatPage />} />
        <Route path="*" element={<Navigate to="/provider" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
