import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  // 1. This updates the state so the next render cycle displays the fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // 2. This logs the explicit exception metrics to your tracking systems or console
  componentDidCatch(error, errorInfo) {
    console.error("🚨 Error Boundary caught a live crash:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Custom clean fallback view for your users
      return (
        <div style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          maxWidth: '500px',
          margin: '4rem auto',
          border: '1px solid #eaeaea',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.5' }}>
            We encountered an unexpected error loading this view. The server might be waking up or updating.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Return to Homepage
          </button>
        </div>
      );
    }

    // If there is no error, render the children components normally
    return this.props.children;
  }
}

export default ErrorBoundary;