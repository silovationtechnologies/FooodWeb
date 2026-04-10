import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 80,
    display: 'flex',
    alignItems: 'center',
    background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.98)',
    backdropFilter: 'blur(20px)',
    borderBottom: scrolled ? '1px solid #eee' : '1px solid transparent',
    transition: 'all 0.3s ease',
  };

  const linkBase = {
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
    transition: 'color 0.2s',
    letterSpacing: '-0.01em',
  };

  return (
    <>
      <nav style={navStyle}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.03em' }}>
              foood<span style={{ color: '#6366f1' }}>web</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                style={{
                  ...linkBase,
                  color: isActive(link.path) ? '#6366f1' : '#64748b',
                }}
                onMouseEnter={(e) => { if (!isActive(link.path)) e.target.style.color = '#1a1a2e'; }}
                onMouseLeave={(e) => { if (!isActive(link.path)) e.target.style.color = '#64748b'; }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="desktop-nav">
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: 8,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = '#1a1a2e'}
              onMouseLeave={(e) => e.target.style.color = '#64748b'}
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#4f46e5';
                e.target.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#6366f1';
                e.target.style.boxShadow = '0 2px 8px rgba(99,102,241,0.25)';
              }}
            >
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="mobile-nav-btn"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: 18,
              color: '#1a1a2e',
            }}
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 80,
          left: 0,
          right: 0,
          background: '#fff',
          zIndex: 99,
          padding: '16px 32px 24px',
          borderBottom: '1px solid #eee',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block',
                padding: '12px 0',
                textDecoration: 'none',
                fontSize: 16,
                fontWeight: 500,
                color: isActive(link.path) ? '#6366f1' : '#64748b',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={() => { navigate('/login'); setIsOpen(false); }}
            style={{
              width: '100%',
              marginTop: 16,
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Get Started
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-btn { display: block !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
