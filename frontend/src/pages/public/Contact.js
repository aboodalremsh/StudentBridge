// src/pages/public/Contact.js
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../pages/public/Footer';

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function Contact() {
  // ── Keep ALL existing form state and logic exactly as-is ──
  const [form,     setForm]     = useState({ name: '', email: '', subject: '', message: '' });
  const [sending,  setSending]  = useState(false);
  const [msg,      setMsg]      = useState({ type: '', text: '' });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Keep existing submit logic exactly as-is ──────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setMsg({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    setSending(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: '✅ Message sent! We\'ll get back to you within 24 hours.' });
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to send message. Please try again.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setSending(false);
    }
  }

  const contactInfo = [
    { icon: '📧', label: 'Email',    value: 'contact@studentbridge.com', href: 'mailto:contact@studentbridge.com' },
    { icon: '📍', label: 'Location', value: 'Lebanon',                   href: null },
    { icon: '⏰', label: 'Response', value: 'Within 24 hours',           href: null },
  ];

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── NAVBAR ───────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed', top: 0, width: '100%', height: 70, zIndex: 999,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 48px',
          backdropFilter: 'blur(20px)',
          background: scrolled ? 'rgba(12,15,26,0.92)' : 'rgba(12,15,26,0.6)',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-green))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>StudentBridge</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>StudentBridge</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[['Home', '/'], ['About', '/about']].map(([label, to]) => (
            <Link key={to} to={to} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'var(--font-display)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {label}
            </Link>
          ))}
          <Link to="/login" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Sign In</Link>
        </div>
      </nav>

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <section
        style={{
          paddingTop: 140, paddingBottom: 60, paddingLeft: 40, paddingRight: 40,
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <span style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 20, background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.25)', color: 'var(--accent-primary)', fontSize: '0.76rem', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>
              Contact Us
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Get In{' '}
              <span style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Touch
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto' }}>
              Have a question, suggestion, or want to learn more about StudentBridge?
              We'd love to hear from you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <section style={{ padding: '20px 40px 80px', flex: 1 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'start' }}>

          {/* Left: contact info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Reveal>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 20px', marginBottom: 4 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 18 }}>
                  Contact Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {contactInfo.map(({ icon, label, value, href }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                        {href ? (
                          <a href={href} style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>{value}</a>
                        ) : (
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.08), rgba(52,217,155,0.06))', border: '1px solid rgba(79,142,247,0.15)', borderRadius: 'var(--radius-lg)', padding: '24px 20px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>🎓</div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 8 }}>
                  Graduation Project
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  StudentBridge is a full-stack graduation project built with React, Node.js, MySQL, and GROQ AI.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right: contact form */}
          <Reveal delay={0.1}>
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 32px',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>
                Send a Message
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 28 }}>
                Fill in the form below and we'll get back to you as soon as possible.
              </p>

              {/* ── Success / Error alert ── */}
              {msg.text && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: msg.type === 'success' ? 'rgba(52,217,155,0.1)' : 'rgba(244,110,110,0.1)',
                    border: `1px solid ${msg.type === 'success' ? 'rgba(52,217,155,0.3)' : 'rgba(244,110,110,0.3)'}`,
                    color: msg.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                  }}
                >
                  {msg.text}
                </div>
              )}

              {/* ── Form — all existing logic preserved ── */}
              <form onSubmit={handleSubmit}>
                {/* Name + Email row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>
                      Full Name <span style={{ color: 'var(--accent-red)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      disabled={sending}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>
                      Email Address <span style={{ color: 'var(--accent-red)' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      disabled={sending}
                      required
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    placeholder="What is this about?"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    disabled={sending}
                  />
                </div>

                {/* Message */}
                <div className="form-group">
                  <label>
                    Message <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <textarea
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    disabled={sending}
                    required
                    style={{ minHeight: 140, resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={sending}
                  style={{ marginTop: 4, fontSize: '0.95rem', padding: '13px 0' }}
                >
                  {sending ? 'Sending…' : '📨 Send Message'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 14, margin: '14px 0 0' }}>
                  We typically respond within 24 hours.
                </p>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}