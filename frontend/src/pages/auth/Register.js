import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [form, setForm]     = useState({ email: '', password: '', confirm: '', role: 'student' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await authAPI.register({ email: form.email, password: form.password, role: form.role });
      saveAuth(data.token, data.user);
      navigate(form.role === 'company' ? '/company' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 440 }}>

        {/* BACK BUTTON */}
        <div style={{ textAlign: 'left', marginBottom: 10 }}>
          <Link to="/" style={{ fontSize: '0.9rem', textDecoration: 'none', color: 'var(--accent-primary)' }}>
            ← Back to Home
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: 8 }}>
            StudentBridge
          </div>
          <h2>Create your account</h2>
          <p style={{ marginTop: 8 }}>Join thousands of students and companies</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[['student', '🎓 Student'], ['company', '🏢 Company']].map(([r, label]) => (
              <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                className={`btn ${form.role === r ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'center' }}>
                {label}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="At least 6 characters" />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" required value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="Repeat your password" />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}