import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { companyAPI } from '../../services';

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [form,    setForm]    = useState({});
  const [loading, setLoading] = useState(true);
  const [edit,    setEdit]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState({ type: '', text: '' });

  const [logoMode,   setLogoMode]   = useState('url');
  const fileInputRef = useRef(null);

  useEffect(() => {
    companyAPI.getProfile()
      .then(({ data }) => {
        setProfile(data.profile);
        setForm(data.profile);
        if (data.profile?.logo_url?.startsWith('data:')) setLogoMode('file');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await companyAPI.updateProfile(form);
      const { data } = await companyAPI.getProfile();
      setProfile(data.profile);
      setForm(data.profile);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      setEdit(false);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Save failed. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Image too large. Please use an image under 10MB.' });
      return;
    }
    // Compress image to max 300x300 before saving to fit in database
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 300;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else        { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        setForm(f => ({ ...f, logo_url: compressed }));
        setMsg({ type: '', text: '' });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  if (loading) return (
    <DashboardLayout>
      <div className="loading-screen"><div className="spinner" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Company Profile</h1>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      {/* TOP CARD */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <img
            src={form.logo_url || 'https://via.placeholder.com/100'}
            onError={e => { e.target.src = 'https://via.placeholder.com/100'; }}
            alt="logo"
            style={{ width: 90, height: 90, borderRadius: 12, objectFit: 'cover', border: '2px solid var(--border)' }}
          />
          <div>
            <h2>{form.company_name || 'Your Company'}</h2>
            <p style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{form.industry || 'Industry'}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{form.location || 'Location'}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {!edit ? (
              <button className="btn btn-primary btn-sm" onClick={() => setEdit(true)}>✏️ Edit</button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEdit(false); setMsg({ type: '', text: '' }); }}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODE */}
      {edit ? (
        <div className="grid-2" style={{ gap: 20 }}>
          <div className="card">
            <label>Company Name:</label>
            <input value={form.company_name || ''} onChange={e => setForm({ ...form, company_name: e.target.value })} />

            <label>Industry:</label>
            <input value={form.industry || ''} onChange={e => setForm({ ...form, industry: e.target.value })} />

            <label>Location:</label>
            <input value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} />

            <label>Description:</label>
            <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} style={{ minHeight: 100 }} />

            {/* Logo — URL or File */}
            <label>Company Logo:</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button type="button" className={`btn btn-sm ${logoMode === 'url' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setLogoMode('url')}>🔗 Use URL</button>
              <button type="button" className={`btn btn-sm ${logoMode === 'file' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setLogoMode('file'); setTimeout(() => fileInputRef.current?.click(), 50); }}>📁 Upload File</button>
            </div>

            {logoMode === 'url' ? (
              <input value={form.logo_url || ''} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://…/logo.png" />
            ) : (
              <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                {form.logo_url?.startsWith('data:') ? (
                  <>
                    <img src={form.logo_url} alt="preview" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                    <p style={{ fontSize: '0.78rem', color: 'var(--accent-green)', margin: 0 }}>✓ Image loaded. Click to change.</p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '2rem', marginBottom: 6 }}>🖼️</div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>Click to select image (PNG, JPG — max 7MB)</p>
                  </>
                )}
              </div>
            )}

            <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving} style={{ marginTop: 15 }}>
              {saving ? 'Saving...' : '💾 Save Profile'}
            </button>
          </div>

          <div className="card">
            <label>Website:</label>
            <input value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />

            <label>LinkedIn:</label>
            <input value={form.linkedin_url || ''} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} />

            <label>Twitter:</label>
            <input value={form.twitter_url || ''} onChange={e => setForm({ ...form, twitter_url: e.target.value })} />

            <label>Employees:</label>
            <input value={form.employee_count || ''} onChange={e => setForm({ ...form, employee_count: e.target.value })} />

            <label>Founded Year:</label>
            <input type="number" value={form.founded_year || ''} onChange={e => setForm({ ...form, founded_year: e.target.value })} />
          </div>
        </div>
      ) : (
        /* VIEW MODE */
        <div className="card">
          {form.description && (
            <div style={{ marginBottom: 20 }}>
              <h4>About</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{form.description}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {form.website     && <a className="btn btn-primary btn-sm" href={form.website}      target="_blank" rel="noreferrer">🌐 Website</a>}
            {form.linkedin_url && <a className="btn btn-ghost btn-sm"  href={form.linkedin_url} target="_blank" rel="noreferrer">💼 LinkedIn</a>}
            {form.twitter_url  && <a className="btn btn-ghost btn-sm"  href={form.twitter_url}  target="_blank" rel="noreferrer">🐦 Twitter</a>}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
