import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

function CookieConsent() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // Check if the "consent" cookie exists in the browser
    const cookies = document.cookie.split('; ');
    const consentCookie = cookies.find(row => row.startsWith('consent='));
    
    if (consentCookie && consentCookie.split('=')[1] === 'true') {
      setAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    // ✅ Set a real cookie that travels to your Render backend automatically
    // Lasts for 1 year (31536000 seconds)
    document.cookie = "consent=true; max-age=31536000; path=/; SameSite=Lax";
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="cookie-banner">
      <p>
        We use cookies to personalize content, analyze traffic, and improve your experience.
        By continuing, you agree to our use of cookies.
      </p>
      <button onClick={handleAccept}>Accept</button>
    </div>
  );
}

export default CookieConsent;