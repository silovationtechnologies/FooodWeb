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

  if (loading) return <div style={{ color: 'white' }}>Loading...</div>;

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
        <Route
          path="/admin"
          element={session ? <AdminPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={session ? <DashboardPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
