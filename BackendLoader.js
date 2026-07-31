import React from 'react';

const BackendLoader = ({ isColdStart = false }) => {
  return (
    <div className="backend-loader-container">
      <style>{`
        .backend-loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 32px 20px;
          text-align: center;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        /* Ambient Glow Ring */
        .pulse-ring-wrapper {
          position: relative;
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(59, 122, 102, 0.2);
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .pulse-core {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b7a66 0%, #1e3a8a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px -5px rgba(59, 122, 102, 0.5);
          z-index: 2;
          animation: float 3s ease-in-out infinite;
        }

        .pulse-core span {
          font-size: 1.5rem;
        }

        /* Typography */
        .loader-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 10px 0;
        }

        .loader-subtitle {
          font-size: 0.95rem;
          color: #64748b;
          max-width: 380px;
          line-height: 1.6;
          margin: 0 0 20px 0;
        }

        /* Sleek Progress Bar */
        .progress-bar-track {
          width: 220px;
          height: 4px;
          background-color: #e2e8f0;
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 40%;
          background: linear-gradient(90deg, #3b7a66, #937b51);
          border-radius: 99px;
          animation: indeterminate 1.8s ease-in-out infinite;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 18px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #937b51;
          background: rgba(147, 123, 81, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.35); opacity: 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes indeterminate {
          0% { left: -40%; width: 30%; }
          50% { left: 40%; width: 60%; }
          100% { left: 100%; width: 30%; }
        }
      `}</style>

      <div className="pulse-ring-wrapper">
        <div className="pulse-ring"></div>
        <div className="pulse-core">
          <span>{isColdStart ? '☕' : '✨'}</span>
        </div>
      </div>

      <h3 className="loader-title">
        {isColdStart ? 'Waking Up the Engine' : 'Curating Editorial Content'}
      </h3>

      <p className="loader-subtitle">
        {isColdStart
          ? 'Our free server goes into deep sleep after inactivity. Spinning up containers, this takes ~30 seconds...'
          : 'Connecting to real-time streams and pulling the latest posts...'}
      </p>

      <div className="progress-bar-track">
        <div className="progress-bar-fill"></div>
      </div>

      <div className="status-badge">
        <span>●</span> {isColdStart ? 'Cold Start Initializing' : 'Syncing Data'}
      </div>
    </div>
  );
};

export default BackendLoader;