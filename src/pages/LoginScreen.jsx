import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, Eye, EyeOff, KeyRound, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const LoginScreen = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultEmail = (selectedEmail) => {
    setEmail(selectedEmail);
  };

  return (
    <div className="login-screen">
      {/* Ambient background glow effects */}
      <div className="login-ambient-glow login-glow-1"></div>
      <div className="login-ambient-glow login-glow-2"></div>

      <div className="login-box">
        <div className="login-brand">
          <div className="brand-icon-wrapper">
            <div className="brand-icon">
              <ShieldCheck size={32} />
            </div>
          </div>
          <div className="brand-badge">
            <span className="live-dot"></span> SECURE CONTROL CONSOLE
          </div>
          <h2>ShopSilo Admin</h2>
          <p className="login-subtitle">
            Platform Moderation, Merchant Approvals & Ban Vault
          </p>
        </div>

        {error && (
          <div className="login-error-alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Admin Email</label>
              <div className="quick-email-chips">
                <button 
                  type="button" 
                  className="quick-chip"
                  onClick={() => fillDefaultEmail('admin@shopsilo.in')}
                  title="Auto-fill admin@shopsilo.in"
                >
                  admin@shopsilo.in
                </button>
              </div>
            </div>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon-left" />
              <input
                type="email"
                className="form-input"
                placeholder="admin@shopsilo.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Access Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: '44px' }}
                placeholder="������������"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-login"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-content">
                <span className="btn-spinner"></span>
                <span>Authenticating Console...</span>
              </span>
            ) : (
              <span className="btn-content">
                <KeyRound size={18} />
                <span>Sign In to Control Center</span>
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="login-footer-badges">
          <div className="footer-badge">
            <CheckCircle2 size={13} />
            <span>256-Bit TLS Encrypted</span>
          </div>
          <div className="footer-badge">
            <ShieldCheck size={13} />
            <span>Role-Gated Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};
