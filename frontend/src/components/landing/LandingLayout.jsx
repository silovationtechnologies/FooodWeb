import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const LandingLayout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      color: '#1a1a2e',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowX: 'hidden'
    }}>
      <Navbar />
      <main style={{ flexGrow: 1, paddingTop: 80 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
