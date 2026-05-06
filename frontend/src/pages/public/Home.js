// src/pages/public/Home.js
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from '../public/Footer';

/* ─── Reveal Hook ─────────────────────────────────────── */
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

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Animated counter ────────────────────────────────── */
function Counter({ to, suffix = '+', label }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(to / 55);
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(t); }
      else setCount(start);
    }, 18);
    return () => clearInterval(t);
  }, [visible, to]);
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '2.6rem',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-green))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {count}{suffix}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

/* ─── Feature card with hover effect ─────────────────── */
function FeatureCard({ icon, title, desc, accent, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${hovered ? accent + '66' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '28px 24px',
          cursor: 'default',
          transition: 'transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
          transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${accent}22`
            : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            background: accent + '18',
            border: `1px solid ${accent}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: 18,
            transition: 'background 0.22s ease',
            ...(hovered ? { background: accent + '28' } : {}),
          }}
        >
          {icon}
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1rem',
            marginBottom: 8,
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
          {desc}
        </p>
        <div
          style={{
            marginTop: 18,
            fontSize: '0.78rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            color: hovered ? accent : 'var(--text-muted)',
            transition: 'color 0.22s ease',
          }}
        >
          Learn more →
        </div>
      </div>
    </Reveal>
  );
}

/* ─── Main Component ──────────────────────────────────── */
export default function Home() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const dashboards = { student: '/student', company: '/company', admin: '/admin' };
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    {
      icon: '💼',
      title: 'Smart Job Matching',
      desc:  'Our algorithm calculates a skill-based match score for every job posting — so you apply with confidence, not guesswork.',
      accent: 'var(--accent-primary)',
    },
    {
      icon: '🧠',
      title: 'AI Career Advisor',
      desc:  'Get personalised career recommendations, gap analysis, and a curated roadmap powered by GROQ AI — tailored to your chosen goal.',
      accent: 'var(--accent-green)',
    },
    {
      icon: '📄',
      title: 'CV Analyzer',
      desc:  'Upload your CV and receive instant AI feedback — strengths, weaknesses, missing keywords, and actionable suggestions.',
      accent: 'var(--accent-amber)',
    },
    {
      icon: '📚',
      title: 'Learning Hub',
      desc:  'Enroll in expert-led courses, complete lessons, earn industry-recognised certificates, and close your skill gaps fast.',
      accent: 'var(--accent-primary)',
    },
    {
      icon: '🤝',
      title: 'Mentorship Programs',
      desc:  'Apply to structured mentorship programs run by top companies. Get guided by senior professionals in your target field.',
      accent: 'var(--accent-green)',
    },
    {
      icon: '🗺️',
      title: 'Career Roadmap',
      desc:  'Follow a 7-step guided journey — from completing your profile to receiving your first job offer — tracked step by step.',
      accent: 'var(--accent-amber)',
    },
  ];

  /* Button hover state */
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── NAVBAR ───────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed', top: 0, width: '100%', height: 70, zIndex: 999,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 48px',
          backdropFilter: 'blur(20px)',
          background: scrolled ? 'rgba(12,15,26,0.92)' : 'rgba(12,15,26,0.5)',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-green))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: '#fff',
            }}
          >
            StudentBridge
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-green))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            StudentBridge
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[['About', '/about'], ['Contact', '/contact']].map(([label, to]) => (
            <Link
              key={to} to={to}
              style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'var(--font-display)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {label}
            </Link>
          ))}

          {user ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(dashboards[user.role])}
            >
              Dashboard →
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link
                to="/login"
                style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'var(--font-display)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none' }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '120px 40px 80px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Background glow blobs */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <div
            style={{
              position: 'absolute', top: '10%', left: '15%', width: 500, height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(79,142,247,0.13) 0%, transparent 70%)',
              animation: 'float1 8s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(52,217,155,0.1) 0%, transparent 70%)',
              animation: 'float2 10s ease-in-out infinite',
            }}
          />
          {/* Dot grid */}
          <div
            style={{
              position: 'absolute', inset: 0, opacity: 0.25,
              backgroundImage: 'radial-gradient(circle, rgba(99,120,180,0.3) 1px, transparent 1px)',
              backgroundSize: '34px 34px',
            }}
          />
        </div>

        <style>{`
          @keyframes float1 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-22px); } }
          @keyframes float2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
        `}</style>

        <div style={{ maxWidth: 800, textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <Reveal>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 18px', borderRadius: 24,
                  background: 'rgba(79,142,247,0.1)',
                  border: '1px solid rgba(79,142,247,0.25)',
                  color: 'var(--accent-primary)',
                  fontSize: '0.78rem', fontFamily: 'var(--font-display)', fontWeight: 600,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', boxShadow: '0 0 8px var(--accent-green)' }} />
                Built for University Students
              </span>
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={0.1}>
            <h1
              style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                lineHeight: 1.1, letterSpacing: '-0.03em',
                marginBottom: 20,
              }}
            >
              Bridge the Gap Between{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-green) 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >
                Talent
              </span>
              {' '}and Opportunity
            </h1>
          </Reveal>

          {/* Sub-headline */}
          <Reveal delay={0.2}>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                maxWidth: 600, margin: '0 auto 36px',
              }}
            >
              StudentBridge connects ambitious students with companies through
              smart job matching, AI career advice, expert courses, and a complete
              toolkit to launch your career — all in one place.
            </p>
          </Reveal>

          {/* CTA buttons */}
          <Reveal delay={0.3}>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              {user ? (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(dashboards[user.role])}
                  style={{ padding: '13px 32px', fontSize: '0.95rem', borderRadius: 10 }}
                >
                  Go to Dashboard →
                </button>
              ) : (
                <>
                  <Link
                    to="/register"
                    style={{
                      display: 'inline-block', textDecoration: 'none',
                      padding: '13px 32px', borderRadius: 10,
                      background: 'linear-gradient(135deg, var(--accent-primary), #3a7de0)',
                      color: '#fff',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
                      boxShadow: '0 6px 24px rgba(79,142,247,0.4)',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(79,142,247,0.55)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(79,142,247,0.4)'; }}
                  >
                    Start for Free
                  </Link>
                  <Link
                    to="/login"
                    style={{
                      display: 'inline-block', textDecoration: 'none',
                      padding: '13px 32px', borderRadius: 10,
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-strong)',
                      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem',
                      transition: 'color 0.18s ease, border-color 0.18s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </Reveal>

          {/* Social proof */}
          <Reveal delay={0.45}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 32 }}>
              <div style={{ display: 'flex' }}>
                {['#4F8EF7', '#34D99B', '#F5A623', '#F46E6E', '#A78BFA'].map((c, i) => (
                  <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: '2px solid var(--bg-base)', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', color: '#fff', fontWeight: 700 }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Joined by <strong style={{ color: 'var(--text-secondary)' }}>30k+ students</strong> across Lebanon
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '40px 40px',
        }}
      >
        <div
          style={{
            maxWidth: 800, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          }}
        >
          {[
            { to: 150, suffix: '+', label: 'Students Registered' },
            { to: 48,  suffix: '+', label: 'Companies Hiring' },
            { to: 6,   suffix: '',  label: 'Expert Courses' },
            { to: 320, suffix: '+', label: 'Applications Sent' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                padding: '0 16px',
              }}
            >
              <Counter to={s.to} suffix={s.suffix} label={s.label} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <span
                style={{
                  display: 'inline-block', padding: '5px 16px', borderRadius: 20,
                  background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)',
                  color: 'var(--accent-primary)', fontSize: '0.76rem',
                  fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.06em',
                  textTransform: 'uppercase', marginBottom: 16,
                }}
              >
                Platform Features
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 'clamp(1.7rem, 3vw, 2.4rem)', marginBottom: 12,
                }}
              >
                Everything You Need to{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-green))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}
                >
                  Launch Your Career
                </span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.7 }}>
                One platform for students to grow, learn, apply, and get hired — with tools built around your success.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 40px' }}>
        <Reveal>
          <div
            style={{
              maxWidth: 720, margin: '0 auto', textAlign: 'center',
              padding: '60px 48px', borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(79,142,247,0.08) 0%, rgba(52,217,155,0.06) 100%)',
              border: '1px solid rgba(79,142,247,0.18)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(79,142,247,0.14) 0%, transparent 70%)',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '2.2rem', marginBottom: 16 }}>🚀</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2.1rem)', marginBottom: 12 }}>
                Ready to Start Your Journey?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 32px' }}>
                Join StudentBridge today — completely free for students. Setup takes less than 2 minutes.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-block', textDecoration: 'none',
                    padding: '13px 32px', borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--accent-primary), #3a7de0)',
                    color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
                    boxShadow: '0 6px 24px rgba(79,142,247,0.35)',
                    transition: 'transform 0.18s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Create Student Account
                </Link>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-block', textDecoration: 'none',
                    padding: '13px 32px', borderRadius: 10,
                    background: 'transparent', color: 'var(--text-secondary)',
                    border: '1px solid var(--border-strong)',
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem',
                    transition: 'color 0.18s, border-color 0.18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                >
                  Register as Company
                </Link>
              </div>
              <p style={{ marginTop: 18, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                ✓ Free for students &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Setup in 2 minutes
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}