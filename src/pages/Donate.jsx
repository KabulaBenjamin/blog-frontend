import React from 'react';

export default function Donate() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Support Our Publishing Community</h1>
      <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.6' }}>
        We are building an open community platform for creators, engineers, educators, and writers. 
        Your contributions help keep servers running, maintain zero paywalls, and empower independent voices.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div style={{ border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
          <h3>☕ Supporter</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>$5 / mo</p>
          <button className="btn btn-primary" style={{ width: '100%' }}>Donate $5</button>
        </div>

        <div style={{ border: '2px solid #2563eb', padding: '24px', borderRadius: '12px', textAlign: 'center', background: '#f8fafc' }}>
          <h3>🚀 Publisher Pillar</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>$15 / mo</p>
          <button className="btn btn-primary" style={{ width: '100%' }}>Donate $15</button>
        </div>

        <div style={{ border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
          <h3>❤️ Custom Support</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>One-time</p>
          <button className="btn btn-outline" style={{ width: '100%' }}>Custom Amount</button>
        </div>
      </div>
    </div>
  );
}