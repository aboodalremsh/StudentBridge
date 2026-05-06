import React, { useState } from 'react';
import { authAPI } from '../../services';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await authAPI.forgotPassword({ email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="card" style={{ width: 400 }}>

        <h2>Forgot Password</h2>
        <p>Enter your email to receive a reset link</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <button disabled={loading} className="btn btn-primary btn-full">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ marginTop: 15 }}>
          <Link to="/login">Back to Login</Link>
        </p>

      </div>
    </div>
  );
}