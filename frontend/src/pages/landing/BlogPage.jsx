import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const BlogPage = () => {
  const posts = [
    {
      title: "Why Third-Party Aggregators Are Hurting Your Cafe's Brand",
      excerpt: 'Explore the real cost of commission-based ordering platforms and why data ownership is critical for premium dining.',
      date: 'April 10, 2026',
      category: 'Industry Insights',
      color: '#6366f1',
      bg: '#eef2ff',
    },
    {
      title: 'How QR Ordering Increased Average Order Value by 22%',
      excerpt: 'A case study on table-side digital menus and the psychology behind visual upselling.',
      date: 'March 28, 2026',
      category: 'Case Studies',
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      title: 'The Future of Restaurant Tech: Digital Identity First',
      excerpt: 'Why creating a corporate-style website for your restaurant is no longer optional in 2026.',
      date: 'March 15, 2026',
      category: 'Technology',
      color: '#d97706',
      bg: '#fffbeb',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 32px 80px' }}>
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
          }}>Blog</span>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Insights & <span style={{ color: '#6366f1' }}>Updates</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
            Stay ahead of the curve with the latest insights on digitizing the F&B industry.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {posts.map((post, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Image placeholder */}
              <div style={{
                height: 180,
                background: `linear-gradient(135deg, ${post.bg} 0%, #f1f5f9 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: post.color, opacity: 0.15, letterSpacing: '-0.04em' }}>FOOODWEB</span>
              </div>

              <div style={{ padding: '24px 24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    background: post.bg,
                    color: post.color,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 50,
                  }}>{post.category}</span>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>{post.date}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8, lineHeight: 1.4 }}>{post.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{post.excerpt}</p>
                <span style={{ color: '#6366f1', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Read Article <ArrowRight size={16} />
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
