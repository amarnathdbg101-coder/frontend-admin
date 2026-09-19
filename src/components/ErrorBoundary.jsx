import React from 'react';
import { AlertOctagon, RefreshCw, LogOut } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleClearSession = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#070a13',
          color: '#f8fafc',
          padding: '24px',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{
            background: '#0d1527',
            border: '1px solid #293d6b',
            borderRadius: '16px',
            padding: '36px',
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <AlertOctagon size={32} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px' }}>
              Admin Console Error
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.5 }}>
              Ek unexpected error detect hua hai. Kripya reload karein ya session reset karein.
            </p>

            <div style={{
              background: '#060a14',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #1a2847',
              fontSize: '0.78rem',
              color: '#fca5a5',
              textAlign: 'left',
              marginBottom: '24px',
              wordBreak: 'break-word',
              fontFamily: 'monospace'
            }}>
              {this.state.error?.message || 'Unknown runtime error'}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} /> Reload App
              </button>
              <button
                onClick={this.handleClearSession}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #293d6b',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} /> Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
