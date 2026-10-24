import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import UserAuth from './components/UserAuth';
import AdminAuth from './components/AdminAuth';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import { insforge } from './lib/insforge';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [userUser, setUserUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [viewMode, setViewMode] = useState('landing');
  const [loading, setLoading] = useState(true);

  // Synchronize browser history / path changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    // Load active sessions from localStorage
    const savedUserSession = localStorage.getItem('voiceai_user_session');
    if (savedUserSession) {
      try {
        const parsed = JSON.parse(savedUserSession);
        if (parsed?.profile) {
          if (parsed.profile.full_name === 'Priya Sharma' || !parsed.profile.full_name) {
            parsed.profile.full_name = 'User';
          }
          setUserUser(parsed.profile);
          setViewMode('workspace');
          // Fetch fresh profile from InsForge
          if (parsed.profile.email) {
            insforge.database.from('profiles').select('*').eq('email', parsed.profile.email).then(({ data }) => {
              if (data && data[0]) {
                setUserUser(data[0]);
                parsed.profile = data[0];
                localStorage.setItem('voiceai_user_session', JSON.stringify(parsed));
              }
            });
          }
        }
      } catch (e) {
        localStorage.removeItem('voiceai_user_session');
      }
    }

    const savedAdminSession = localStorage.getItem('voiceai_admin_session');
    if (savedAdminSession) {
      try {
        const parsed = JSON.parse(savedAdminSession);
        if (parsed?.profile && parsed.profile.role === 'admin') setAdminUser(parsed.profile);
      } catch (e) {
        localStorage.removeItem('voiceai_admin_session');
      }
    }

    setLoading(false);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleUserLogout = async () => {
    try {
      await insforge.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('voiceai_user_session');
    setUserUser(null);
    setShowUserAuth(false);
    setViewMode('landing');
    navigate('/');
  };

  const handleAdminLogout = async () => {
    try {
      await insforge.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('voiceai_admin_session');
    setAdminUser(null);
    navigate('/'); // Immediately redirects to landing page!
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#05070c', color: '#fff', fontFamily: 'var(--font-sans)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="live-dot green" style={{ width: 14, height: 14 }}></div>
          <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading VoiceAI Studio...</p>
        </div>
      </div>
    );
  }

  // 1. ADMIN ROUTE: Only active when URL is /admin
  const isAdminRoute = currentPath === '/admin' || currentPath.startsWith('/admin');

  if (isAdminRoute) {
    if (!adminUser) {
      return (
        <AdminAuth 
          onAdminLoginSuccess={(profile) => setAdminUser(profile)} 
          onGoToUserHome={() => navigate('/')} 
        />
      );
    }
    return (
      <AdminPanel 
        currentUser={adminUser}
        onLogout={handleAdminLogout}
        onGoToUserHome={() => navigate('/')}
      />
    );
  }

  // 2. STANDARD ROUTE: Active on root / or any client route
  // If user requested to open Auth modal / view
  if (showUserAuth || currentPath === '/login' || currentPath === '/signup') {
    return (
      <UserAuth 
        onLoginSuccess={(profile) => {
          setUserUser(profile);
          setShowUserAuth(false);
          setViewMode('workspace');
          navigate('/');
        }}
        onGoHome={() => {
          setShowUserAuth(false);
          navigate('/');
        }}
      />
    );
  }

  // If user is logged in and in workspace view
  if (userUser && viewMode === 'workspace') {
    return (
      <UserPanel 
        currentUser={userUser}
        onLogout={handleUserLogout}
        onGoHome={() => setViewMode('landing')}
      />
    );
  }

  // Default: Landing Page
  return (
    <LandingPage 
      currentUser={userUser}
      onGetStarted={() => setShowUserAuth(true)}
      onSignIn={() => setShowUserAuth(true)}
      onGoToWorkspace={() => setViewMode('workspace')}
    />
  );
}
