import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, QrCode, Smartphone, TrendingUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const pillStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#eef2ff',
    color: '#6366f1',
    fontSize: 13,
    fontWeight: 600,
    padding: '6px 16px',
    borderRadius: 50,
    marginBottom: 24,
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Hero */}
      <section style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px 60px',
        background: 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)',
          backgroundSize: '40px 40px',
          opacity: 0.4,
        }} />

        <div style={{ maxWidth: 800, textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 4px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span style={pillStyle}>✨ Trusted by premium cafes</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-title"
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              marginBottom: 20,
            }}
          >
            Build your own<br />
            <span style={{ color: '#6366f1' }}>digital identity</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="hero-subtitle"
            style={{
              fontSize: 18,
              color: '#64748b',
              lineHeight: 1.7,
              maxWidth: 560,
              margin: '0 auto 40px',
            }}
          >
            Stop depending on third-party apps. Own your customers, own your brand, own your profits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="hero-buttons"
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button
              onClick={() => navigate('/services')}
              style={{
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#4f46e5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#6366f1'; }}
            >
              Explore Solutions <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/contact')}
              style={{
                background: '#fff',
                color: '#374151',
                border: '1px solid #d1d5db',
                padding: '14px 32px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; }}
            >
              Contact Sales
            </button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 20px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={pillStyle}>How it works</span>
            <h2 className="section-title" style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Scan · Order · Dine Smart
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, marginTop: 12 }}>Three simple steps to digitize premium dining</p>
          </motion.div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { step: '01', title: 'Scan', desc: 'Guests scan the QR code at their table', icon: <QrCode size={28} color="#6366f1" />, bg: '#eef2ff' },
              { step: '02', title: 'Order', desc: 'Browse your digital menu and place orders', icon: <Smartphone size={28} color="#059669" />, bg: '#ecfdf5' },
              { step: '03', title: 'Enjoy', desc: 'Food arrives — no waiting, no errors', icon: <TrendingUp size={28} color="#d97706" />, bg: '#fffbeb' },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: '36px 28px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 14, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  {item.icon}
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', marginBottom: 4, letterSpacing: '0.05em' }}>STEP {item.step}</p>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Stand Out */}
      <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
        <div className="why-section-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <motion.div {...fadeUp}>
            <span style={pillStyle}>Why FooodWeb</span>
            <h2 className="section-title" style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 32 }}>
              Why be one among many when you can{' '}
              <span style={{ color: '#6366f1' }}>stand out with your identity?</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                'Custom website for your brand',
                'Scan → View Menu → Order instantly',
                'Data ownership & customer insights',
                'Premium digital presence',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <CheckCircle size={20} color="#6366f1" />
                  <span style={{ color: '#334155', fontSize: 16, fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
              borderRadius: 24,
              padding: 48,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              minHeight: 300,
            }}
          >
            <h3 style={{ fontSize: 28, fontWeight: 700, color: '#312e81', marginBottom: 12 }}>
              From Local Brand<br />to Digital Powerhouse
            </h3>
            <p style={{ color: '#6366f1', fontSize: 16 }}>Your restaurant deserves more than just a listing.</p>
          </motion.div>
        </div>
      </section>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .hero-title {
            font-size: 32px !important;
          }
          .hero-subtitle {
            font-size: 15px !important;
            padding: 0 8px;
          }
          .hero-buttons {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 0 16px;
          }
          .hero-buttons button {
            justify-content: center !important;
            width: 100% !important;
          }
          .section-title {
            font-size: 26px !important;
          }
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
          .why-section-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
