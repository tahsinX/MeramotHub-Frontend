import { useState, useEffect } from 'react';
import { User, Phone, Mail, Shield, Save, MapPin, CreditCard, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LocationPicker from '../../components/LocationPicker';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    email: user?.email || '',
    nid_number: user?.nid_number || '',
    area: user?.area || '',
  });
  const [locationLat, setLocationLat] = useState(user?.latitude || null);
  const [locationLng, setLocationLng] = useState(user?.longitude || null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploadingNid, setUploadingNid] = useState(false);
  const [nidImageUrl, setNidImageUrl] = useState(user?.nid_image_url || '');
  const [nidFileName, setNidFileName] = useState('');
  const [nidFileSize, setNidFileSize] = useState(0);
  const isProvider = user?.role === 'service_provider';

  useEffect(() => {
    setForm({
      full_name: user?.full_name || '',
      phone_number: user?.phone_number || '',
      email: user?.email || '',
      nid_number: user?.nid_number || '',
      area: user?.area || '',
    });
    setNidImageUrl(user?.nid_image_url || '');
    setNidFileName('');
    setNidFileSize(0);
    setLocationLat(user?.latitude || null);
    setLocationLng(user?.longitude || null);
  }, [user]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setDirty(true);
  };

  const handleLocationChange = (lat, lng, addr) => {
    setLocationLat(lat);
    setLocationLng(lng);
    setForm(f => ({ ...f, area: addr }));
    setDirty(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (form.full_name !== user?.full_name) payload.full_name = form.full_name;
      if (form.phone_number !== user?.phone_number) payload.phone_number = form.phone_number;
      if (form.email !== (user?.email || '')) payload.email = form.email;
      if (form.nid_number !== (user?.nid_number || '')) payload.nid_number = form.nid_number;
      if (form.area !== (user?.area || '')) payload.area = form.area;
      if (locationLat !== (user?.latitude || null)) payload.latitude = locationLat;
      if (locationLng !== (user?.longitude || null)) payload.longitude = locationLng;
      const nidChanged = isProvider && nidImageUrl !== (user?.nid_image_url || '');
      if (Object.keys(payload).length === 0 && !nidChanged) { setDirty(false); return; }
      if (Object.keys(payload).length > 0) {
        const updated = await api.updateProfile(payload);
        updateUser?.(updated);
      }
      if (nidChanged) {
        await api.patch('/providers/profile', { nid_image_url: nidImageUrl || null });
        updateUser?.({ nid_image_url: nidImageUrl });
      }
      setDirty(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: user?.full_name || '',
      phone_number: user?.phone_number || '',
      email: user?.email || '',
      nid_number: user?.nid_number || '',
      area: user?.area || '',
    });
    setNidImageUrl(user?.nid_image_url || '');
    setNidFileName('');
    setNidFileSize(0);
    setLocationLat(user?.latitude || null);
    setLocationLng(user?.longitude || null);
    setDirty(false);
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
      setDirty(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingNid(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const roleMap = {
    customer: 'Customer',
    service_provider: 'Service Provider',
    area_manager: 'Area Manager',
    admin: 'Admin',
  };

  return (
    <div className="profile-page">
      <div className="dash-header">
        <h1>My Profile</h1>
        <p>Manage your personal information</p>
      </div>

      <div className="card" style={{ padding: 'var(--space-xl)' }}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 'var(--space-xl)' }}>
            <div className="sidebar-avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 4 }}>{user?.full_name}</div>
              <span className={`badge badge-neutral`}>{roleMap[user?.role] || user?.role}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <User size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              Full Name
            </label>
            <input
              className="form-input"
              value={form.full_name}
              onChange={e => handleChange('full_name', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Phone size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              Phone Number
            </label>
            <input
              className="form-input"
              value={form.phone_number}
              onChange={e => handleChange('phone_number', e.target.value)}
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Mail size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              Email
            </label>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Shield size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              Account Type
            </label>
            <input
              className="form-input"
              value={roleMap[user?.role] || user?.role}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <CreditCard size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              NID Number
            </label>
            <input
              className="form-input"
              value={form.nid_number}
              onChange={e => handleChange('nid_number', e.target.value)}
              placeholder="Enter your NID number"
              disabled={user?.role === 'service_provider'}
              style={user?.role === 'service_provider' ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
            {user?.role === 'service_provider' && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                NID is set during provider registration
              </span>
            )}
          </div>

          {isProvider && (
            <div className="form-group">
              <label className="form-label">
                <Image size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                NID Image
              </label>

              {nidImageUrl ? (
                <div style={{
                  border: '1px solid #e5e7eb', borderRadius: 12, padding: 12,
                  display: 'flex', alignItems: 'center', gap: 12, background: '#fff',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
                    background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 20 }}>📄</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {nidFileName || 'NID image'}
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {nidFileSize ? formatFileSize(nidFileSize) : 'Image'} {nidImageUrl !== (user?.nid_image_url || '') && <span style={{ color: '#22c55e', fontWeight: 600 }}>• Uploaded</span>}
                    </div>
                  </div>
                  {nidImageUrl !== (user?.nid_image_url || '') && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                  )}
                  <div onClick={() => { try { setNidImageUrl(''); setNidFileName(''); setNidFileSize(0); setDirty(true); } catch (e) { console.error(e); } }}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      color: '#6b7280', fontSize: 16, flexShrink: 0, lineHeight: 1, userSelect: 'none',
                    }}
                    title="Remove file"
                  >✕</div>
                </div>
              ) : uploadingNid ? (
                <div style={{
                  border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, background: '#fafafa',
                }}>
                  <div style={{ fontWeight: 600, color: '#374151', marginBottom: 10, fontSize: 13 }}>Uploading {nidFileName || 'image'}…</div>
                  <div style={{ width: '100%', height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: '70%', height: '100%',
                      background: 'linear-gradient(90deg, #2563eb 30%, #60a5fa 50%, #2563eb 70%)',
                      backgroundSize: '200% 100%', borderRadius: 3,
                      animation: 'shimmer 1s infinite',
                    }} />
                  </div>
                </div>
              ) : (
                <label
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; }}
                  onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; uploadNidFile(e.dataTransfer.files[0]); }}
                  style={{
                    border: '2px dashed #d1d5db', borderRadius: 12, padding: 32,
                    textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
                    background: '#f9fafb', userSelect: 'none', display: 'block',
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8, lineHeight: 1 }}>📄</div>
                  <p style={{ fontWeight: 600, color: '#374151', marginBottom: 4, fontSize: 14 }}>Drag & drop NID image here</p>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>
                    or <span style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>click to choose file</span>
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => { uploadNidFile(e.target.files?.[0]); if (e.target) e.target.value = ''; }}
                  />
                </label>
              )}
            </div>
          )}

          <LocationPicker
            label="Address"
            showDistance={false}
            initialLat={user?.latitude}
            initialLng={user?.longitude}
            initialAddress={user?.area || ''}
            onLocationChange={handleLocationChange}
          />

          <div className="form-actions" style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={saving || !dirty}>
              <Save size={16} style={{ marginRight: 6 }} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {dirty && (
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                Discard
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
