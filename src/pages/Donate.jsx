import React, { useState } from 'react';

export default function Donate() {
  const [copied, setCopied] = useState('');

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2500);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Support Our Publishing Community</h1>
      <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.6' }}>
        We are building an open community platform for creators, engineers, educators, and authors. 
        Your support helps keep servers running, maintain zero paywalls, and empower independent voices.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
        
        {/* M-Pesa Card */}
        <div style={{ border: '2px solid #16a34a', padding: '24px', borderRadius: '12px', background: '#f0fdf4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>📱</span>
            <h3 style={{ margin: 0, color: '#15803d' }}>M-Pesa (Send Money / Pochi)</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#166534', marginBottom: '16px' }}>
            Direct mobile money transfer via M-Pesa or Pochi la Biashara.
          </p>
          
          <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#15803d', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Phone Number</span>
              <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>+254 798 030 091</strong>
            </div>
            <button 
              onClick={() => handleCopy('+254798030091', 'mpesa')}
              style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {copied === 'mpesa' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Bank Account Card */}
        <div style={{ border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🏦</span>
            <h3 style={{ margin: 0, color: '#0f172a' }}>Direct Bank Transfer</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
            Co-operative Bank of Kenya direct deposit or EFT.
          </p>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Co-op Bank Account</span>
              <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>01108631944600</strong>
            </div>
            <button 
              onClick={() => handleCopy('01108631944600', 'bank')}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {copied === 'bank' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}