import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const navigate = useNavigate();

  const features = [
    { category: 'Website & Branding', items: [
      'Custom Corporate-Style Website',
      'Branded Domain & Hosting Setup',
      'Mobile-Optimized Responsive Design',
      'SEO-Ready Digital Presence',
    ]},
    { category: 'Smart Ordering System', items: [
      'QR Code Ordering for Dine-In',
      'Parcel / Takeaway QR Service',
      'Real-Time Order Queue Management',
      'Live Order Status Tracking',
    ]},
    { category: 'Admin Sales Dashboard', items: [
      'Detailed Sales Dashboard Analytics',
      'Daily / Monthly Revenue Breakdown',
      'Cash vs Online Payment Tracking',
      'Order History with Full Audit Trail',
    ]},
    { category: 'Operations & Management', items: [
      'Advanced Table Management System',
      'Table Combining & Transfer',
      'Menu Management (Add / Edit / Toggle)',
      'Category Management with Images',
      'Inventory Tracking & Recipe Mapping',
    ]},
    { category: 'Customer & Data', items: [
      'Customer Directory & Database',
      'Full Data Ownership — No Third-Party',
      'Split Payment Support (Cash + Online)',
      'Invoice Generation & Print',
    ]},
    { category: 'Premium Extras', items: [
      '1 Free Professional Advertising Shoot',
      'Priority Support (Mon–Sat, 10 AM–7 PM)',
      'Bulk QR Card Printing',
      'Continuous Feature Updates',
    ]},
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '100px 20px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block',
            background: '#eef2ff',
            color: '#6366f1',
            fontSize: 13,
            fontWeight: 600,
            padding: '6px 16px',
            borderRadius: 50,
            marginBottom: 20,
          }}>Pricing</span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 12 }}>
            One plan. <span style={{ color: '#6366f1' }}>Everything included.</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            No hidden fees, no commissions. A complete digital transformation for your restaurant.
          </p>
        </div>

        {/* Single Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 24,
            overflow: 'hidden',
          }}
        >
          {/* Price header */}
          <div style={{
            background: '#6366f1',
            padding: '36px 32px',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 50,
                marginBottom: 12,
              }}>Premium Plan</span>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Complete Digital Transformation</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Everything your cafe needs to go fully digital</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 42, fontWeight: 800 }}>₹30,000</span>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 2 }}>one-time setup</p>
            </div>
          </div>

          {/* Feature groups */}
          <div style={{ padding: '32px 32px 24px' }}>
            {features.map((group, gi) => (
              <div key={gi} style={{ marginBottom: gi < features.length - 1 ? 28 : 0 }}>
                <h3 style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#6366f1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 14,
                  paddingBottom: 8,
                  borderBottom: '1px solid #f1f5f9',
                }}>{group.category}</h3>
                <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                  {group.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Check style={{ width: 18, height: 18, color: '#6366f1', flexShrink: 0 }} />
                      <span style={{ color: '#334155', fontSize: 14, lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ padding: '0 32px 32px' }}>
            <button
              onClick={() => navigate('/contact')}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 14,
                border: 'none',
                background: '#6366f1',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.background = '#4f46e5'; }}
              onMouseLeave={(e) => { e.target.style.background = '#6366f1'; }}
            >
              Get Started Today →
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .feature-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PricingPage;
