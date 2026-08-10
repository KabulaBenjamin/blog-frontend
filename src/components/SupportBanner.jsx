import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SupportBanner() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Session-based trigger: pops up once per login/session
    const dismissed = sessionStorage.getItem('support_banner_dismissed_session');
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('support_banner_dismissed_session', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px', // Raised so it doesn't block the mobile BottomNav bar
      right: '20px',
      maxWidth: '360px',
      background: '#0f172a',
      color: '#ffffff',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '0.95rem' }}>🌱 Support Independent Publishing</strong>
        <button 
          onClick={handleDismiss} 
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
        >
          ✕
        </button>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: '1.4' }}>
        Enjoying Koikoi Blog? Help keep this platform open and ad-free. Donate via M-Pesa or Bank!
      </p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button 
          onClick={() => { handleDismiss(); navigate('/donate'); }}
          style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Donate Now
        </button>
        <button 
          onClick={handleDismiss}
          style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}