import { Link } from 'react-router-dom';
import { Zap, Link2, BarChart3, Shield, Globe, Copy } from 'lucide-react';
import { useAppSelector } from '../store/hooks';

const features = [
  { icon: Link2, title: 'Instant short links', desc: 'Shorten any URL in milliseconds. Clean, memorable links every time.' },
  { icon: BarChart3, title: 'Click analytics', desc: 'Track every click with real-time data. Know exactly where your audience comes from.' },
  { icon: Shield, title: 'Safe & reliable', desc: 'All links are verified and monitored with 99.9% uptime guaranteed.' },
  { icon: Globe, title: 'Custom domains', desc: 'Use your own domain for branded short links that build trust.' },
];

export default function LandingPage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const dashboardOrRegister = isAuthenticated ? '/dashboard' : '/register';

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>ShortX</span>
          </div>

          {/* Nav actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isAuthenticated ? (
              <Link to="/dashboard" style={{
                padding: '8px 18px', borderRadius: 8, background: '#4f46e5',
                color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
              }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ padding: '8px 16px', borderRadius: 8, color: '#4b5563', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
                  Sign in
                </Link>
                <Link to="/register" style={{
                  padding: '8px 18px', borderRadius: 8, background: '#4f46e5',
                  color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                }}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 99,
          background: '#eef2ff', border: '1px solid #c7d2fe',
          fontSize: 12, fontWeight: 600, color: '#4f46e5', marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
          Fast, free URL shortener
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 64, fontWeight: 900, color: '#111827',
          lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 20px',
          maxWidth: 700,
        }}>
          Shorten. Share.{' '}
          <span style={{ color: '#4f46e5' }}>Track everything.</span>
        </h1>

        <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 520, lineHeight: 1.7, margin: '0 0 44px' }}>
          Turn long, clunky URLs into clean short links in seconds. Get real-time analytics, custom aliases, and reliable uptime.
        </p>

        {/* Mock URL input */}
        <div style={{
          width: '100%', maxWidth: 560,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 6px 6px 18px',
          borderRadius: 14, border: '2px solid #c7d2fe',
          background: '#fff', marginBottom: 28,
          boxShadow: '0 4px 24px rgba(99,102,241,0.08)',
        }}>
          <span style={{ flex: 1, fontSize: 14, color: '#9ca3af', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            https://your-very-long-url.com/with/a/very/long/path
          </span>
          <Link to={dashboardOrRegister} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', borderRadius: 10, background: '#4f46e5',
            color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', flexShrink: 0,
          }}>
            <Copy size={14} />
            Shorten
          </Link>
        </div>

      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section style={{ background: '#f9fafb', borderTop: '1px solid #f1f5f9', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', margin: '0 0 10px' }}>
              Everything you need
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Powerful features to help you manage and track your links.</p>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 14, padding: 24,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={20} color="#4f46e5" />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #f1f5f9', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={12} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>ShortX</span>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>© {new Date().getFullYear()} ShortX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
