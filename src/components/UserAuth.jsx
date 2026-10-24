import React, { useState } from 'react';
import { Bot, Lock, Mail, User, Sparkles, ArrowRight, ArrowLeft, AlertCircle, PhoneCall, Zap, Shield, CheckCircle } from 'lucide-react';
import { insforge } from '../lib/insforge';

export default function UserAuth({ onLoginSuccess, onGoHome }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isSignUp) {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('All fields are mandatory. Please provide full name, email, and password.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter both your email address and password.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { data: signUpData, error: signUpErr } = await insforge.auth.signUp({
          email: email.trim(),
          password: password,
          name: fullName || 'New Customer'
        });
        if (signUpErr) throw new Error(signUpErr.message || signUpErr.error || 'Signup failed');

        // Insert profile
        const { data: profileData } = await insforge.database.from('profiles').insert([{
          email,
          full_name: fullName || 'New Customer',
          role: 'user',
          plan: 'starter',
          credits_balance: 500,
          max_employees: 10,
          max_calls_per_month: 1000,
          status: 'active'
        }]).select();

        // Sign in
        const { data: signInData, error: signInErr } = await insforge.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;

        const profile = profileData && profileData[0] ? profileData[0] : {
          email,
          full_name: fullName || 'New Customer',
          role: 'user',
          credits_balance: 500
        };

        localStorage.setItem('voiceai_user_session', JSON.stringify({ user: signInData.user, profile }));
        onLoginSuccess(profile);
      } else {
        // Sign in
        const { data: signInData, error: signInErr } = await insforge.auth.signInWithPassword({ email, password });
        if (signInErr) throw new Error(signInErr.message || 'Invalid email or password.');

        const { data: profiles } = await insforge.database.from('profiles').select('*').eq('email', email);
        const profile = profiles && profiles.length > 0 ? profiles[0] : {
          id: signInData.user.id,
          email: signInData.user.email,
          full_name: signInData.user.profile?.name || email.split('@')[0],
          role: 'user',
          credits_balance: 1840
        };

        localStorage.setItem('voiceai_user_session', JSON.stringify({ user: signInData.user, profile }));
        onLoginSuccess(profile);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error.');
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
      background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.25), transparent), #05070c'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'rgba(13, 18, 31, 0.85)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-xl)',
        padding: '38px 34px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
        position: 'relative'
      }}>
        {onGoHome && (
          <button
            type="button"
            onClick={onGoHome}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.78rem',
              cursor: 'pointer',
              marginBottom: 16,
              padding: 0
            }}
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
        )}

        {/* Glow pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: 20,
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.74rem',
          fontWeight: 700,
          marginBottom: 16
        }}>
          <Sparkles size={13} /> Multilingual Autonomous Calling AI
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          Welcome to <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VoiceAI Studio</span>
        </h1>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 6, marginBottom: 24 }}>
          {isSignUp ? 'Create your workspace and deploy human-like voice agents.' : 'Sign in to manage your AI employees, campaigns, and leads.'}
        </p>

        {/* Auth Toggle Pill */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 30,
          padding: 3,
          marginBottom: 22,
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
            style={{
              padding: '8px 16px',
              borderRadius: 24,
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: !isSignUp ? 'var(--brand-indigo)' : 'transparent',
              color: !isSignUp ? '#fff' : 'var(--text-tertiary)',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
            style={{
              padding: '8px 16px',
              borderRadius: 24,
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: isSignUp ? 'var(--brand-indigo)' : 'transparent',
              color: isSignUp ? '#fff' : 'var(--text-tertiary)',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
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

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">
                Full Name <span style={{ color: '#fb7185' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
                <User size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">
              Email Address <span style={{ color: '#fb7185' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="email"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Mail size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">
              Password <span style={{ color: '#fb7185' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="password"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Lock size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
