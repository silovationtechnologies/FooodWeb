import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const sectionTitle = {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 16,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const linkStyle = {
    display: 'block',
    textDecoration: 'none',
    color: '#64748b',
    fontSize: 14,
    marginBottom: 10,
    transition: 'color 0.2s',
  };

  return (
    <footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '64px 32px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.03em' }}>
              foood<span style={{ color: '#6366f1' }}>web</span>
            </span>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginTop: 12, maxWidth: 280 }}>
              By Silovation Technologies. Build your own digital identity — not just a listing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={sectionTitle}>Product</h4>
            <Link to="/" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>Home</Link>
            <Link to="/services" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>Services</Link>
            <Link to="/pricing" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>Pricing</Link>
            <Link to="/blog" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>Blog</Link>
          </div>

          {/* Services */}
          <div>
            <h4 style={sectionTitle}>Solutions</h4>
            <Link to="/services" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>QR Ordering</Link>
            <Link to="/services" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>Table Management</Link>
            <Link to="/services" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>Menu Management</Link>
            <Link to="/services" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>Analytics</Link>
          </div>

          {/* Contact */}
          <div>
            <h4 style={sectionTitle}>Contact</h4>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>silovationtechnologies@gmail.com</p>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>+91 9284074909</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>Pune, Maharashtra, India</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>© {new Date().getFullYear()} FooodWeb by Silovation Technologies. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
