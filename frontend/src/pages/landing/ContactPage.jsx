import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    fontSize: 15,
    color: '#0f172a',
    background: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    boxShadow: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
    marginBottom: 6,
  };

  const infoCardStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    padding: '20px 0',
    borderBottom: '1px solid #f1f5f9',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 32px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-block',
            background: '#eef2ff',
            color: '#6366f1',
            fontSize: 13,
            fontWeight: 600,
            padding: '6px 16px',
            borderRadius: 50,
            marginBottom: 20,
          }}>Contact Us</span>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Let's <span style={{ color: '#6366f1' }}>talk</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
            Ready to upgrade your cafe? Reach out to schedule a demo or get started today.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }} className="contact-grid">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: '#fafbfc',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: '36px 32px',
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>Send a message</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input type="text" placeholder="John" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#6366f1'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input type="text" placeholder="Doe" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#6366f1'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" placeholder="john@example.com" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#6366f1'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <div>
                <label style={labelStyle}>Restaurant Name</label>
                <input type="text" placeholder="The Majestic" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#6366f1'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <div>
                <label style={labelStyle}>Message</label>
                <textarea rows={4} placeholder="How can we help?" style={{ ...inputStyle, resize: 'none' }} onFocus={(e) => e.target.style.borderColor = '#6366f1'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#6366f1',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.background = '#4f46e5'; }}
                onMouseLeave={(e) => { e.target.style.background = '#6366f1'; }}
              >
                <Send size={18} /> Send Message
              </button>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <div style={infoCardStyle}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={22} color="#6366f1" />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Location</h4>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>Pune, Maharashtra, India</p>
              </div>
            </div>

            <div style={infoCardStyle}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={22} color="#059669" />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Phone</h4>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>+91 9284074909<br />+91 7020665405</p>
              </div>
            </div>

            <div style={{ ...infoCardStyle, borderBottom: 'none' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={22} color="#d97706" />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Email</h4>
                <p style={{ color: '#64748b', fontSize: 14 }}>silovationtechnologies@gmail.com</p>
              </div>
            </div>

            {/* Support Hours */}
            <div style={{
              marginTop: 32,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '20px 24px',
            }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Support Hours</h4>
              <p style={{ color: '#64748b', fontSize: 14 }}>Monday – Saturday, 10 AM – 7 PM IST</p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
