import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services';

/* ─── Reveal Hook ───────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, visible];
}

/* ─── Main Component ──────────── */
export default function Register() {
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [ref, visible] = useReveal();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);

    try {
      const { data } = await authAPI.register({
        email: form.email,
        password: form.password,
        role: form.role,
      });

      saveSession(data.token, data.user);

      const map = { student: '/student', company: '/company' };
      navigate(map[data.user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        padding: 20,
        position: 'relative',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(79,142,247,0.15), transparent 70%)',
          top: '-100px',
          left: '-100px',
        }}
      />

      {/* Card */}
      <div
        ref={ref}
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 32,
          borderRadius: 20,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.7s cubic-bezier(.22,1,.36,1)',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>
            Student<span style={{ color: 'var(--accent-primary)' }}>Bridge</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Create your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: 10,
              borderRadius: 8,
              background: 'rgba(255,0,0,0.1)',
              color: '#ff6b6b',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Role selector */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginBottom: 20,
          }}
        >
          {['student', 'company'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm({ ...form, role: r })}
              style={{
                padding: 12,
                borderRadius: 10,
                border:
                  form.role === r
                    ? '2px solid var(--accent-primary)'
                    : '1px solid var(--border)',
                background:
                  form.role === r
                    ? 'rgba(79,142,247,0.1)'
                    : 'transparent',
                color:
                  form.role === r
                    ? 'var(--accent-primary)'
                    : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {r === 'student' ? '🎓 Student' : '🏢 Company'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.8rem' }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
              placeholder="you@email.com"
              style={{
                width: '100%',
                padding: 12,
                marginTop: 4,
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-base)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.8rem' }}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
              placeholder="At least 6 characters"
              style={{
                width: '100%',
                padding: 12,
                marginTop: 4,
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-base)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Confirm */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.8rem' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
              placeholder="Repeat password"
              style={{
                width: '100%',
                padding: 12,
                marginTop: 4,
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-base)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 10,
              border: 'none',
              background: 'var(--accent-primary)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Creating account…' : `Register as ${form.role}`}
          </button>
        </form>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            marginTop: 18,
            fontSize: '0.85rem',
          }}
        >
          Already have an account?{' '}
          <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}