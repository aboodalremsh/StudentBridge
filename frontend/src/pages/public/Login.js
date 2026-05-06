// pages/public/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services';

export default function Login() {
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      saveSession(data.token, data.user);

      const map = { student:'/student', company:'/company', admin:'/admin' };
      navigate(map[data.user.role]);
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card fade-in">

        <div className="auth-logo">Student<span>Bridge</span></div>

        <h2 style={{ marginBottom:20 }}>Welcome Back</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          <input type="email" placeholder="Email"
            value={form.email}
            onChange={e => setForm({...form, email:e.target.value})}
          />

          <input type="password" placeholder="Password"
            value={form.password}
            onChange={e => setForm({...form, password:e.target.value})}
          />

          <button className="btn btn-primary btn-full">
            {loading ? 'Signing in...' : 'Login'}
          </button>

        </form>

        <p style={{ marginTop:20 }}>
          Don’t have account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}