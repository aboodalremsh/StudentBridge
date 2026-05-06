import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authAPI.login(form);
      saveAuth(data.token, data.user);

      const routes = {
        student: '/student',
        company: '/company',
        admin: '/admin'
      };

      navigate(routes[data.user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 20
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>

        {/* BACK BUTTON */}
        <div style={{ textAlign: 'left', marginBottom: 10 }}>
          <Link to="/" style={{ fontSize: '0.9rem', textDecoration: 'none', color: 'var(--accent-primary)' }}>
            ← Back to Home
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--accent-primary)',
            marginBottom: 8
          }}>
            StudentBridge
          </div>
          <h2>Welcome back</h2>
          <p style={{ marginTop: 8 }}>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Your password"
            />
          </div>

          {/* ✅ FORGOT PASSWORD LINK */}
          <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 15 }}>
            <Link
              to="/forgot-password"
              style={{
                fontSize: '0.85rem',
                color: 'var(--accent-primary)',
                textDecoration: 'none'
              }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

      </div>
    </div>
  );
}