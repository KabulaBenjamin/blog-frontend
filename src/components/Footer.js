import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer>
      <p>© 2026 Koikoi Blog</p>
      <div className="footer-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>
    </footer>
  );
}

export default Footer;
