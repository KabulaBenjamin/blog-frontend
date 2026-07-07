import React from 'react';

function PrivacyPolicy() {
  return (
    <div className="static-page privacy-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
      <h2>Privacy Policy</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>Last Updated: July 2026</p>
      
      <hr />

      <h3>1. Information Collection and Scope</h3>
      <p>
        Koikoi Blog ("we," "our," or "the Platform") is committed to protecting your privacy. We collect minimal personal data necessary to maintain a secure, operational, and optimized blogging experience. This includes information you explicitly provide (such as user credentials upon account registration) and technical data collected automatically via system logs.
      </p>

      <h3>2. Automated Data Processing and Telemetry</h3>
      <p>
        To protect against malicious activity, monitor system performance, and provide localization features, our backend infrastructure automatically processes standard networking metadata. This data includes your Internet Protocol (IP) address, approximate geographic metrics (such as city, region, and country), and operational system headers. This background processing executes safely and non-intrusively during your routing lifecycle.
      </p>

      <h3>3. Cookie Policy & Token Storage</h3>
      <p>
        The Platform utilizes browser cookies and local client tokens to authenticate identity, retain user preferences (such as display preferences), and authorize backend operations. A specific session cookie is placed upon your browser following explicit user consent to acknowledge our data management policies. You maintain absolute control over cookie persistence via your individual browser client settings; however, disabling cookies may impact the operational scope of certain user features.
      </p>

      <h3>4. Data Retention and Third-Party Disclosures</h3>
      <p>
        We do not sell, trade, lease, or otherwise distribute your personal or telemetry data to third-party corporate entities. Information is retained only for as long as necessary to fulfill core platform functionalities or to comply with explicit, valid legal requirements and judicial law enforcement mandates.
      </p>

      <h3>5. Data Security Safeguards</h3>
      <p>
        We maintain industry-standard security protocols to prevent unauthorized data access, modification, disclosure, or destruction. However, please be advised that no electronic transmission or digital storage standard can guarantee absolute computational immunity.
      </p>
    </div>
  );
}

export default PrivacyPolicy;