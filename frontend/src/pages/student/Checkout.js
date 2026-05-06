import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { learningAPI } from '../../services';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [msg,       setMsg]       = useState({ type:'', text:'' });
  const [payForm,   setPayForm]   = useState({
    card_number: '', card_name: '', expiry: '', cvv: '',
  });

  useEffect(() => {
    learningAPI.getCourse(id)
      .then(({ data: d }) => {
        if (d.is_enrolled) {
          navigate(`/student/course/${id}`, { replace: true });
          return;
        }
        setData(d);
      })
      .catch(() => navigate('/student/learning'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setEnrolling(true);
    setMsg({ type:'', text:'' });
    try {
      const payload = data.course.price > 0 ? payForm : {};
      await learningAPI.enroll(id, payload);
      setMsg({ type:'success', text:'🎉 Enrolled successfully! Redirecting to your course…' });
      setTimeout(() => navigate(`/student/course/${id}`), 1400);
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Enrollment failed. Please try again.',
      });
      setEnrolling(false);
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="loading-screen"><div className="spinner"/></div>
    </DashboardLayout>
  );

  const { course } = data || {};
  const isFree = course?.price === 0 || !course?.price;

  return (
    <DashboardLayout>
      <div style={{ marginBottom:20 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/student/learning')}
        >
          ← Back to Learning Hub
        </button>
      </div>

      <div style={{ maxWidth:600, margin:'0 auto' }}>

        {/* Course summary card */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="flex-between">
            <div style={{ flex:1, minWidth:0, marginRight:16 }}>
              <div style={{
                fontSize:'0.72rem', color:'var(--text-muted)',
                textTransform:'uppercase', fontWeight:700, marginBottom:4,
              }}>
                Enrolling in
              </div>
              <h3 style={{ marginBottom:4 }}>{course?.title}</h3>
              <p style={{ fontSize:'0.83rem', color:'var(--text-muted)' }}>
                {course?.category}
                {course?.duration ? ` · ${course.duration}` : ''}
                {course?.lesson_count != null ? ` · ${course.lesson_count} lessons` : ''}
              </p>
            </div>
            <div style={{
              fontSize:'1.8rem', fontWeight:800, flexShrink:0,
              color: isFree ? 'var(--accent-green)' : 'var(--accent-amber)',
            }}>
              {isFree ? 'FREE' : `$${course.price}`}
            </div>
          </div>
        </div>

        {/* Payment / confirmation card */}
        <div className="card">
          <h3 style={{ marginBottom:20 }}>
            {isFree ? '✅ Confirm Free Enrollment' : '💳 Payment Details'}
          </h3>

          {msg.text && (
            <div className={`alert alert-${msg.type}`} style={{ marginBottom:16 }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isFree && (
              <div style={{
                background:'var(--bg-surface)', borderRadius:'var(--radius-md)',
                padding:20, border:'1px solid var(--border)', marginBottom:20,
              }}>
                <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--accent-amber)', marginBottom:16 }}>
                  💳 Simulated Visa Payment
                </div>

                <div className="form-group" style={{ marginBottom:14 }}>
                  <label>Card Number</label>
                  <input
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                    value={payForm.card_number}
                    onChange={e => setPayForm(p => ({ ...p, card_number: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ marginBottom:14 }}>
                  <label>Cardholder Name</label>
                  <input
                    placeholder="JOHN DOE"
                    required
                    value={payForm.card_name}
                    onChange={e => setPayForm(p => ({ ...p, card_name: e.target.value }))}
                  />
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label>Expiry (MM/YY)</label>
                    <input
                      placeholder="12/27"
                      maxLength={5}
                      required
                      value={payForm.expiry}
                      onChange={e => setPayForm(p => ({ ...p, expiry: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label>CVV</label>
                    <input
                      placeholder="123"
                      maxLength={4}
                      type="password"
                      required
                      value={payForm.cvv}
                      onChange={e => setPayForm(p => ({ ...p, cvv: e.target.value }))}
                    />
                  </div>
                </div>

                <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:12 }}>
                  🔒 Simulated payment — no real card data is processed or stored.
                </p>
              </div>
            )}

            {isFree && (
              <p style={{ color:'var(--text-secondary)', lineHeight:1.75, marginBottom:20 }}>
                This course is completely free. Click <strong>Enroll for Free</strong> below to
                get instant access to all lessons and start learning right away.
              </p>
            )}

            <div style={{
              background:'var(--bg-surface)', borderRadius:'var(--radius-md)',
              padding:'12px 16px', border:'1px solid var(--border)', marginBottom:20,
              display:'flex', justifyContent:'space-between', alignItems:'center',
            }}>
              <span style={{ fontWeight:600 }}>Total</span>
              <span style={{
                fontWeight:800, fontSize:'1.1rem',
                color: isFree ? 'var(--accent-green)' : 'var(--accent-amber)',
              }}>
                {isFree ? 'Free' : `$${course.price}`}
              </span>
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button
                type="button"
                className="btn btn-ghost btn-full"
                onClick={() => navigate('/student/learning')}
                disabled={enrolling}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={enrolling}
              >
                {enrolling
                  ? 'Processing…'
                  : isFree
                    ? 'Enroll for Free'
                    : `Pay $${course.price} & Enroll`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}