// src/pages/public/About.js
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

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function TechBadge({ label, color }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 20px',
        borderRadius: 12,
        background: hovered ? color + '22' : color + '12',
        border: `1px solid ${hovered ? color + '55' : color + '30'}`,
        color: color,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '0.875rem',
        transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        cursor: 'default',
      }}
    >
      {label}
    </div>
  );
}

export default function About() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const techStack = [
    { label: '⚛️  React 18',       color: 'var(--accent-primary)' },
    { label: '🟢 Node.js',          color: 'var(--accent-green)'   },
    { label: '🗄️  MySQL 8',         color: 'var(--accent-amber)'   },
    { label: '⚡ Socket.io',         color: 'var(--accent-primary)' },
    { label: '🤖 GROQ AI',           color: 'var(--accent-green)'   },
    { label: '📧 SendGrid',          color: 'var(--accent-amber)'   },
    { label: '🔐 JWT Auth',          color: 'var(--accent-primary)' },
    { label: '📦 Express.js',        color: 'var(--accent-green)'   },
  ];

  const teamValues = [
    { icon: '🎯', title: 'Purpose-Driven',  desc: 'Every feature exists to solve a real problem students face when entering the workforce.' },
    { icon: '🤝', title: 'Student-First',   desc: 'We designed the platform from the ground up around the student experience and career journey.' },
    { icon: '⚡', title: 'AI-Powered',      desc: 'We leverage modern AI to give every student access to career guidance that was once only available to the privileged few.' },
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
          {[['Home', '/'], ['Contact', '/contact']].map(([label, to]) => (
            <Link key={to} to={to} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'var(--font-display)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {label}
            </Link>
          ))}
          <Link to="/login" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Sign In</Link>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────── */}
      <section
        style={{
          paddingTop: 160, paddingBottom: 80, paddingLeft: 40, paddingRight: 40,
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <span style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 20, background: 'rgba(52,217,155,0.1)', border: '1px solid rgba(52,217,155,0.25)', color: 'var(--accent-green)', fontSize: '0.76rem', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>
              About Us
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 20 }}>
              Built to Close the{' '}
              <span style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Student-to-Career Gap
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 580, margin: '0 auto' }}>
              StudentBridge is a full-stack graduation project — a real-world career platform
              designed to help university students land their first job through smart technology,
              AI-powered tools, and meaningful connections with companies.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────────── */}
      <section style={{ padding: '60px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <Reveal>
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(244,110,110,0.2)',
                  borderLeft: '4px solid var(--accent-red)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 28px',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>⚠️</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: 14, color: 'var(--accent-red)' }}>
                  The Problem
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.925rem', marginBottom: 12 }}>
                  University students across Lebanon and the MENA region face a consistent challenge:
                  they graduate with strong theoretical knowledge but struggle to break into the job market.
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.925rem' }}>
                  They lack guidance on what skills companies actually need, have no structured way
                  to discover opportunities that match their abilities, and receive no feedback on how
                  to present themselves professionally.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(52,217,155,0.2)',
                  borderLeft: '4px solid var(--accent-green)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 28px',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>✅</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: 14, color: 'var(--accent-green)' }}>
                  Our Solution
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.925rem', marginBottom: 12 }}>
                  StudentBridge is a unified platform that handles the entire student career journey —
                  from building a profile and discovering skill gaps, to applying for jobs and earning certificates.
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.925rem' }}>
                  By combining smart job matching, AI-powered career advice, a learning hub, and
                  direct company connections, we give every student the tools that were previously
                  only available through expensive career coaching.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── WHAT IS STUDENTBRIDGE ────────────────────────── */}
      <section style={{ padding: '60px 40px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', marginBottom: 12 }}>
                What Is StudentBridge?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}>
                A complete career ecosystem connecting three types of users under one platform.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                icon: '🎓',
                title: 'Students',
                color: 'var(--accent-primary)',
                points: [
                  'Build a complete career profile',
                  'Get AI-matched to relevant jobs',
                  'Take skill assessments',
                  'Enroll in certified courses',
                  'Receive AI career advice',
                  'Analyze and improve their CV',
                  'Apply to mentorship programs',
                  'Track progress via roadmap',
                ],
              },
              {
                icon: '🏢',
                title: 'Companies',
                color: 'var(--accent-green)',
                points: [
                  'Post and manage job listings',
                  'Browse matched applicants',
                  'View skill match scores',
                  'Update application statuses',
                  'Create mentorship programs',
                  'View hiring analytics',
                  'Message candidate students',
                ],
              },
              {
                icon: '⚙️',
                title: 'Admins',
                color: 'var(--accent-amber)',
                points: [
                  'Manage all users and roles',
                  'Create and publish courses',
                  'Build skill assessments',
                  'Issue and track certificates',
                  'Monitor enrollments',
                  'View platform statistics',
                  'Suspend or remove accounts',
                ],
              },
            ].map((role, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 20px', height: '100%' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{role.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: role.color, marginBottom: 14 }}>{role.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {role.points.map((point, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: role.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ───────────────────────────────────── */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', marginBottom: 12 }}>
                Technologies Used
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
                StudentBridge is built on a modern, production-grade full-stack architecture.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 40 }}>
              {techStack.map((tech, i) => (
                <TechBadge key={i} label={tech.label} color={tech.color} />
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[
                { layer: 'Frontend',  detail: 'React 18 with functional components, React Router v6, and a custom CSS design system with dark theme variables.' },
                { layer: 'Backend',   detail: 'Node.js + Express.js REST API with JWT authentication, bcrypt password hashing, and Socket.io for real-time communication.' },
                { layer: 'Database',  detail: 'MySQL 8 with 23 relational tables covering users, jobs, courses, assessments, gamification, mentorship, and more.' },
                { layer: 'AI & Email',detail: 'GROQ API (llama3-8b-8192) for chatbot, CV analysis, and career advice. SendGrid for transactional password-reset emails.' },
              ].map(({ layer, detail }, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px 22px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{layer}</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{detail}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────── */}
      <section style={{ padding: '60px 40px 80px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)', textAlign: 'center', marginBottom: 40 }}>
              Our Values
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {teamValues.map((v, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{v.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>{v.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal delay={0.2}>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.95rem' }}>
                Ready to experience StudentBridge for yourself?
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-primary), #3a7de0)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 18px rgba(79,142,247,0.35)' }}>
                  Get Started Free
                </Link>
                <Link to="/contact" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 28px', borderRadius: 10, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
                  Contact Us
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}