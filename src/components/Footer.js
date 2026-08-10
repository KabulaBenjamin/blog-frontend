import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <p>&copy; {new Date().getFullYear()} Koikoi Blog. All rights reserved.</p>
      <nav>
        <ul>
          <li><a href="/donate" style={{ fontWeight: 'bold', color: '#16a34a' }}>Donate</a></li>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    </footer>
  );
}

export default Footer;