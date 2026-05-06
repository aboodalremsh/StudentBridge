import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { studentAPI } from '../../services';

export default function StudentProfile() {
  const [profile,  setProfile]  = useState(null);
  const [form,     setForm]     = useState({});
  const [loading,  setLoading]  = useState(true);
  const [edit,     setEdit]     = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState({ type: '', text: '' });

  const [avatarMode,   setAvatarMode]   = useState('url');
  const avatarInputRef = useRef(null);

  useEffect(() => {
    studentAPI.getProfile()
      .then(({ data }) => {
        setProfile(data.profile);
        setForm(data.profile);
        if (data.profile?.avatar_url?.startsWith('data:')) setAvatarMode('file');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await studentAPI.updateProfile(form);
      const { data } = await studentAPI.getProfile();
      setProfile(data.profile);
      setForm(data.profile);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      setEdit(false);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Save failed.' });
    } finally { setSaving(false); }
  }

  function handleAvatarFile(e) {
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
        setForm(f => ({ ...f, avatar_url: compressed }));
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

  const fields = [profile?.full_name, profile?.university, profile?.major, profile?.skills, profile?.bio, profile?.cv_link];
  const pct    = Math.round((fields.filter(f => f?.toString().trim()).length / fields.length) * 100);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>My Profile</h1>
        <p className="subtitle">Keep your profile complete to attract more companies</p>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

      {/* TOP CARD */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="avatar"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)' }}
                onError={e => e.target.style.display = 'none'} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-green))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                {form.full_name?.slice(0,1)?.toUpperCase() || 'S'}
              </div>
            )}
          </div>
          <div>
            <h2>{form.full_name || 'Your Name'}</h2>
            <p style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{form.major || 'Major'}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{form.university || 'University'}</p>
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

      <div className="grid-2" style={{ gap: 24 }}>
        {/* LEFT — Form */}
        {edit ? (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 16 }}>Basic Information</h4>
              {[
                { key: 'full_name',  label: 'Full Name',    placeholder: 'Your full name' },
                { key: 'university', label: 'University',    placeholder: 'e.g. Lebanese American University' },
                { key: 'major',      label: 'Major / Field', placeholder: 'e.g. Computer Science' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label>{f.label}</label>
                  <input value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
                </div>
              ))}
              <div className="form-group">
                <label>Bio / About Me</label>
                <textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell companies about yourself..." style={{ minHeight: 100 }} />
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 16 }}>Skills & Links</h4>
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input value={form.skills || ''} onChange={e => setForm({ ...form, skills: e.target.value })}
                  placeholder="React, Node.js, MySQL, Python..." />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Used for job matching.</small>
              </div>
              {[
                { key: 'cv_link',      label: 'CV / Resume Link', placeholder: 'https://drive.google.com/...' },
                { key: 'linkedin_url', label: 'LinkedIn URL',      placeholder: 'https://linkedin.com/in/...' },
                { key: 'github_url',   label: 'GitHub URL',        placeholder: 'https://github.com/...' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label>{f.label}</label>
                  <input value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
                </div>
              ))}

              {/* Avatar — URL or File upload */}
              <div className="form-group">
                <label>Profile Avatar</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <button type="button" className={`btn btn-sm ${avatarMode === 'url' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setAvatarMode('url')}>🔗 Use URL</button>
                  <button type="button" className={`btn btn-sm ${avatarMode === 'file' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => { setAvatarMode('file'); setTimeout(() => avatarInputRef.current?.click(), 50); }}>📁 Upload File</button>
                </div>
                {avatarMode === 'url' ? (
                  <input value={form.avatar_url || ''} onChange={e => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://..." />
                ) : (
                  <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => avatarInputRef.current?.click()}>
                    <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFile} />
                    {form.avatar_url?.startsWith('data:') ? (
                      <>
                        <img src={form.avatar_url} alt="preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />
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
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : '✓ Save Profile'}
            </button>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="card">
            {form.bio && (
              <div style={{ marginBottom: 16 }}>
                <h4>About</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{form.bio}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {form.cv_link      && <a className="btn btn-primary btn-sm" href={form.cv_link}      target="_blank" rel="noreferrer">📄 CV</a>}
              {form.linkedin_url && <a className="btn btn-ghost btn-sm"   href={form.linkedin_url} target="_blank" rel="noreferrer">💼 LinkedIn</a>}
              {form.github_url   && <a className="btn btn-ghost btn-sm"   href={form.github_url}   target="_blank" rel="noreferrer">💻 GitHub</a>}
            </div>
          </div>
        )}

        {/* RIGHT — Strength + Skills */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h4 style={{ marginBottom: 14 }}>Profile Strength</h4>
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Completeness</span>
              <span style={{ fontWeight: 800, color: pct >= 80 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)', fontFamily: 'var(--font-display)' }}>
                {pct}%
              </span>
            </div>
            <div className="progress-bar" style={{ height: 12, marginBottom: 12 }}>
              <div className="progress-fill" style={{ width: `${pct}%`, height: 12, background: pct >= 80 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)' }} />
            </div>
            <p style={{ fontSize: '0.83rem' }}>
              {pct >= 80 ? '🟢 Strong profile! Companies can fully evaluate you.'
               : pct >= 50 ? '🟡 Getting there — add more info to boost visibility.'
               : '🔴 Your profile needs more information.'}
            </p>
          </div>

          {form.skills && (
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>Your Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
