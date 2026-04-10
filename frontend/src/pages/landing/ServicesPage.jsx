import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, QrCode, FileText, Users, Clock, Shield, Camera, Package } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    { title: 'Corporate Website', desc: 'A sleek, modern website that puts your brand front and center — no aggregator needed.', icon: <LayoutDashboard size={26} />, color: '#6366f1', bg: '#eef2ff' },
    { title: 'Smart QR Ordering', desc: 'Elegant QR-based menu allowing direct table ordering with zero errors.', icon: <QrCode size={26} />, color: '#059669', bg: '#ecfdf5' },
    { title: 'Menu Management', desc: 'Update prices, toggle availability, and manage categories in real-time.', icon: <FileText size={26} />, color: '#d97706', bg: '#fffbeb' },
    { title: 'Table Management', desc: 'Dedicated admin dashboard built for peak-hour efficiency.', icon: <Users size={26} />, color: '#dc2626', bg: '#fef2f2' },
    { title: 'Live Order Tracking', desc: 'Monitor orders in real-time to improve operational metrics.', icon: <Clock size={26} />, color: '#0284c7', bg: '#f0f9ff' },
    { title: 'Data Privacy', desc: 'Own your customer database. No data leaks to competitors.', icon: <Shield size={26} />, color: '#7c3aed', bg: '#f5f3ff' },
    { title: 'Advertising Shoot', desc: 'Professional-grade media included in the premium package.', icon: <Camera size={26} />, color: '#db2777', bg: '#fdf2f8' },
    { title: 'Parcel QR Service', desc: 'Extend the smart ordering experience to takeaway customers.', icon: <Package size={26} />, color: '#0d9488', bg: '#f0fdfa' },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 32px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'inline-block',
              background: '#eef2ff',
              color: '#6366f1',
              fontSize: 13,
              fontWeight: 600,
              padding: '6px 16px',
              borderRadius: 50,
              marginBottom: 20,
            }}
          >
            Our Services
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 16 }}
          >
            Everything your cafe needs<br />
            <span style={{ color: '#6366f1' }}>to go digital</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: '#64748b', fontSize: 17, maxWidth: 560, margin: '0 auto' }}
          >
            A comprehensive 8-step digital overhaul designed for premium cafes and restaurants.
          </motion.p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {services.map((s, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: '32px 24px',
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: s.bg,
                color: s.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{i + 1}. {s.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
