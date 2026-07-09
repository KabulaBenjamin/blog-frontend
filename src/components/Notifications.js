import React, { useState, useEffect } from 'react';

function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🛡️ Security Guard Check: Exit early if no authenticated user is present
    if (!user) {
      setLoading(false);
      return;
    }

    // 📥 Fetch historical notification tracking alerts from PostgreSQL database
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`https://blog-2y55.onrender.com/notifications?user_id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to resolve notification logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // ⚡ Note: Real-time notifications will automatically match down via your App.js WebSocket 
    // dispatch system once you hook up your notification alerts event channel there!
  }, [user]);

  // Handle UX state for unauthenticated system traffic
  if (!user) {
    return (
      <div className="notifications-container" style={{ padding: '20px', textAlign: 'center', margin: '2rem auto', maxWidth: '500px' }}>
        <h2>Notifications</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Please sign in to view your activity stream, post updates, and account alerts.</p>
        <button 
          onClick={() => window.location.href = '/signin'}
          style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Sign In Instantly
        </button>
      </div>
    );
  }

  return (
    <div className="notifications-container" style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      <h2 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', color: '#111' }}>Notifications</h2>
      
      {loading ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>Loading your updates pipeline...</p>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px', marginTop: '12px' }}>
          <span style={{ fontSize: '32px' }}>🔔</span>
          <p style={{ color: '#666', marginTop: '10px', marginBottom: 0 }}>You're all caught up! No new alerts right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              style={{
                padding: '14px',
                border: '1px solid #eee',
                borderRadius: '8px',
                background: notif.is_read ? '#ffffff' : '#f4f8ff',
                borderLeft: notif.is_read ? '1px solid #eee' : '4px solid #007bff',
                transition: 'background 0.2s ease'
              }}
            >
              <p style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#222' }}>
                {notif.message}
              </p>
              <span style={{ fontSize: '11px', color: '#999' }}>
                {new Date(notif.created_at).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;