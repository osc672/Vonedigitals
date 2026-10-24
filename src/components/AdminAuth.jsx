import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft, Key } from 'lucide-react';
import { insforge } from '../lib/insforge';

export default function AdminAuth({ onAdminLoginSuccess, onGoToUserHome }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your administrator email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data: signInData, error: signInErr } = await insforge.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInErr) throw new Error(signInErr.message || 'Invalid administrator credentials.');

      const { data: profiles } = await insforge.database.from('profiles').select('*').eq('email', email);
      const profile = profiles && profiles.length > 0 ? profiles[0] : null;

      if (!profile || profile.role !== 'admin') {
        throw new Error("403 Forbidden: This account does not possess Superadmin rights.");
      }

      localStorage.setItem('voiceai_admin_session', JSON.stringify({ user: signInData.user, profile }));
      onAdminLoginSuccess(profile);
    } catch (err) {
      setErrorMsg(err.message || 'Access Denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245, 158, 11, 0.18), transparent), #05070c'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'rgba(15, 20, 31, 0.9)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: 'var(--radius-xl)',
        padding: '38px 34px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
        position: 'relative'
      }}>
        {/* Back to Client App */}
        <button
          onClick={onGoToUserHome}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={14} /> Back to User App
        </button>

        {/* Shield Icon */}
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'var(--grad-admin)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
          margin: '20px auto 16px'
        }}>
          <ShieldCheck size={28} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Executive Command Center
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            PORTAL: /admin • RESTRICTED ACCESS
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#fb7185',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ color: '#fbbf24' }}>
              Master Administrator Email <span style={{ color: '#fb7185' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="email"
                className="form-input"
                style={{ paddingLeft: 38, borderColor: 'rgba(245, 158, 11, 0.3)' }}
                placeholder="admin@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Mail size={16} color="#fbbf24" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ color: '#fbbf24' }}>
              Superadmin Password <span style={{ color: '#fb7185' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="password"
                className="form-input"
                style={{ paddingLeft: 38, borderColor: 'rgba(245, 158, 11, 0.3)' }}
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Lock size={16} color="#fbbf24" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-admin"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
