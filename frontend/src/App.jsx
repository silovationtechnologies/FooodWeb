import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import QRPage from './pages/QRPage';
import MenuPage from './pages/MenuPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Landing Pages
import LandingLayout from './components/landing/LandingLayout';
import HomePage from './pages/landing/HomePage';
import ServicesPage from './pages/landing/ServicesPage';
import PricingPage from './pages/landing/PricingPage';
import BlogPage from './pages/landing/BlogPage';
import ContactPage from './pages/landing/ContactPage';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-dark)', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '24px'
      }}>
        <div className="animate-pulse3d" style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--accent-white) 0%, var(--accent-blue) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          boxShadow: '0 0 40px rgba(0, 223, 196, 0.2)'
        }}>
          🍽️
        </div>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '800', 
          letterSpacing: '-0.04em', 
          color: 'var(--text-main)',
          opacity: 0.8
        }}>
          fooodweb.com
        </h1>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        <Route path="/qr" element={<QRPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/login" element={session ? <Navigate to="/admin" /> : <LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
