import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        padding: '60px 40px 32px',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Top row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-green))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: '#fff',
                }}
              >
                Social_Media
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-green))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                StudentBridge
              </span>
            </div>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
                maxWidth: 300,
                marginBottom: 20,
              }}
            >
              Bridging the gap between university students and their dream careers.
              Smart job matching, AI-powered guidance, and industry-recognised certificates.
            </p>
            {/* Social links */}
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'LinkedIn', href: 'https://linkedin.com/' },
                { label: 'GitHub',   href: 'https://github.com/' },
                { label: 'Twitter',  href: 'https://x.com/' },
                { label: 'Instagram',  href: 'https://instagram.com/' },
                { label: 'Facebook',  href: 'https://facebook.com/' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    padding: '5px 12px',
                    borderRadius: 20,
                    border: '1px solid var(--border)',
                    transition: 'color 0.18s, border-color 0.18s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--accent-primary)';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 16,
              }}
            >
              Quick Links
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Home',     to: '/' },
                { label: 'About',    to: '/about' },
                { label: 'Contact',  to: '/contact' },
                { label: 'Sign In',  to: '/login' },
                { label: 'Register', to: '/register' },
              ].map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    transition: 'color 0.18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 16,
              }}
            >
              Contact
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="mailto:contact@studentbridge.com"
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                📧 contact@studentbridge.com
              </a>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                🎓 Graduation Project 2026
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                🌍 Lebanon
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            © 2026 StudentBridge — All rights reserved.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Built with React · Node.js · MySQL · GROQ AI
          </p>
        </div>
      </div>
    </footer>
  );
}