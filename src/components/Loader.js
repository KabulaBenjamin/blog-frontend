import React from 'react';
import './Loader.css';

function Loader() {
  return (
    <div className="loader-container" aria-busy="true" aria-live="polite">
      {/* Accessibility tags (aria-*) notify screen readers that the page is loading content */}
      <div className="loader"></div>
    </div>
  );
}

export default Loader;