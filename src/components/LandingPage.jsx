import React, { useState } from 'react';
import { 
  Bot, Sparkles, Phone, PhoneCall, PhoneForwarded, ShieldCheck, 
  BarChart3, CheckCircle2, ArrowRight, Play, Pause, Volume2, 
  Zap, Globe, Users, Headphones, MessageSquare, ChevronRight,
  Award, TrendingUp, Layers, Check, HelpCircle
} from 'lucide-react';
import LiveCallSimulatorModal from './LiveCallSimulatorModal';

export default function LandingPage({ onGetStarted, onSignIn, currentUser, onGoToWorkspace }) {
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatorEmployee, setSimulatorEmployee] = useState(null);

  const personas = [
    {
      id: 'priya',
      name: 'Priya Sharma',
      language: 'Hindi (हिन्दी)',
      role: 'B2B Real Estate & Sales Qualification',
      sampleText: 'नमस्ते! मैं वॉइस एआई से प्रिया बात कर रही हूँ। क्या आप अपनी प्रॉपर्टी इन्वेस्टमेंट के लिए उपयुक्त ऑप्शन्स देखना चाहेंगे?',
      langCode: 'hi-IN',
      avatarColor: 'linear-gradient(135deg, #6366f1, #a855f7)',
      tags: ['Sales Agent', 'Hot Lead Filter', 'Polite & Natural']
    },
    {
      id: 'rahul',
      name: 'Rahul Verma',
      language: 'English (Indian Business)',
      role: 'SaaS Product Outreach & Demo Booking',
      sampleText: 'Hi there! This is Rahul from VoiceAI Studio. I noticed your interest in automating customer telecalling. Would tomorrow at 3 PM work for a quick demo?',
      langCode: 'en-IN',
      avatarColor: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      tags: ['Appointment Setter', 'Tech Savvy', 'Objection Handling']
    },
    {
      id: 'ananya',
      name: 'Ananya Krishnan',
      language: 'Tamil (தமிழ்)',
      role: 'Healthcare & Clinic Appointment Receptionist',
      sampleText: 'வணக்கம்! நான் வாய்ஸ் ஏஐ இலிருந்து அனன்யா பேசுகிறேன். உங்கள் மருத்துவ ஆலோசனை முன்பதிவை உறுதிப்படுத்த அழைக்கிறேன்.',
      langCode: 'ta-IN',
      avatarColor: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      tags: ['Inbound Support', 'Clinic Assistant', 'Warm & Empathetic']
    },
    {
      id: 'suresh',
      name: 'Suresh Reddy',
      language: 'Telugu (తెలుగు)',
      role: 'Banking Follow-ups & Customer Verification',
      sampleText: 'నమస్కారం! నేను వాయిస్ ఏఐ నుండి సురేష్ మాట్లాడుతున్నాను. మీ డాక్యుమెంట్ వెరిఫికేషన్ ప్రక్రియ గురించి సమాచారం ఇవ్వడానికి కాల్ చేస్తున్నాను.',
      langCode: 'te-IN',
      avatarColor: 'linear-gradient(135deg, #10b981, #059669)',
      tags: ['Verification', 'Clear Diction', 'Fast Resolution']
    }
  ];

  const handlePlayVoice = (persona) => {
    if (!('speechSynthesis' in window)) {
      alert("Audio preview supported natively in your browser.");
      return;
    }

    if (playingVoiceId === persona.id) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingVoiceId(persona.id);

    const utterance = new SpeechSynthesisUtterance(persona.sampleText);
    utterance.lang = persona.langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setPlayingVoiceId(null);
    utterance.onerror = () => setPlayingVoiceId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleLaunchTestCall = (persona) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setPlayingVoiceId(null);
    setSimulatorEmployee({
      name: persona.name,
      language: persona.language.split(' ')[0],
      opening_greeting: persona.sampleText,
      goal: persona.role,
      hot_rules: 'yes,interested,demo,appointment,buy',
      cold_rules: 'no,busy,not interested,cancel',
      phone_number: '+91 98765 01928'
    });
    setSimulatorOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', color: '#fff', overflowX: 'hidden' }}>
      {/* Dynamic Background Glows */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw',
        height: '100vh',
        background: `
          radial-gradient(circle 800px at 50% -10%, rgba(99, 102, 241, 0.18), transparent),
          radial-gradient(circle 600px at 90% 40%, rgba(6, 182, 212, 0.1), transparent),
          radial-gradient(circle 700px at 10% 80%, rgba(139, 92, 246, 0.12), transparent)
        `,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Navigation Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)',
        background: 'rgba(5, 7, 12, 0.82)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}>
              <Bot size={22} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>VoiceAI</span>{' '}
              <span style={{ fontSize: '1.2rem', fontWeight: 800, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>STUDIO</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden-mobile">
            <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Features</a>
            <a href="#personas" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Voice Personas</a>
            <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>How It Works</a>
            <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Pricing</a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {currentUser ? (
              <button 
                onClick={onGoToWorkspace}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.86rem' }}
              >
                Go to Workspace <ArrowRight size={15} />
              </button>
            ) : (
              <>
                <button 
                  onClick={onSignIn}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.86rem' }}
                >
                  Sign In
                </button>
                <button 
                  onClick={onGetStarted}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.86rem' }}
                >
                  Deploy Free Agent 🚀
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: 70, paddingBottom: 80, paddingLeft: 20, paddingRight: 20, textAlign: 'center' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {/* Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 30,
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#c7d2fe',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: 24,
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)'
          }}>
            <Sparkles size={14} color="#818cf8" />
            <span>Next-Gen Autonomous Indian Voice AI • 42ms Latency</span>
          </div>

          {/* Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(2.3rem, 5.5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            marginBottom: 20
          }}>
            Human-Sounding Voice Agents That{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 20%, #a855f7 60%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Think, Talk & Sell
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: 720,
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}>
            Deploy autonomous multilingual AI telecallers across Hindi, Tamil, Telugu, and English.
            Place 10,000+ simultaneous outbound qualification calls or answer 24/7 inbound hotlines with natural emotion and live CRM lead classification.
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 50 }}>
            <button 
              onClick={currentUser ? onGoToWorkspace : onGetStarted}
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem', gap: 8, boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)' }}
            >
              <Zap size={18} />
              <span>{currentUser ? 'Open Workspace' : 'Deploy AI Agent Free'}</span>
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => handleLaunchTestCall(personas[0])}
              className="btn btn-secondary"
              style={{ padding: '14px 26px', fontSize: '1rem', gap: 8 }}
            >
              <PhoneCall size={18} color="#34d399" />
              <span>Talk Live In Browser (Free Demo)</span>
            </button>
          </div>

          {/* Hero Call Simulation Showcase Card */}
          <div style={{
            maxWidth: 780,
            margin: '0 auto',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            backdropFilter: 'blur(25px)',
            boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
            textAlign: 'left'
          }}>
            {/* Call Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 14, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--grad-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  fontWeight: 800, fontSize: '1.1rem'
                }}>
                  P
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Priya Sharma • AI Sales Representative</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Carrier Line: +91 98765 01928 • Live Dialing</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="chip chip-active" style={{ fontSize: '0.72rem' }}>
                  <span className="live-dot green"></span> Connected (0:48)
                </span>
                <span className="chip chip-hot" style={{ fontSize: '0.72rem' }}>🔥 Hot Lead (92%)</span>
              </div>
            </div>

            {/* Simulated Live Audio Waves & Dialogue */}
            <div style={{ background: 'rgba(0, 0, 0, 0.35)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div className="audio-wave active" style={{ height: 20 }}>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 700 }}>AI Speaking • Indian Hindi Accent • Sub-second Response</span>
              </div>

              <div style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.6, fontStyle: 'italic' }}>
                "नमस्ते सर! हमारी कंपनी के AI टेलीकॉलिंग सॉल्यूशन से आप रोज़ाना 10,000+ कॉल्स बिना किसी ह्यूमन एजेंट के कर सकते हैं। क्या आप अपने बिज़नेस के लिए इसका 5-मिनट का फ्री लाइव डेमो देखना चाहेंगे?"
              </div>
            </div>

            {/* Bottom Metrics Pill */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <div>Sentiment: <strong style={{ color: '#34d399' }}>Highly Interested</strong> • Intent: <strong>Product Demo</strong></div>
              <button 
                onClick={() => handleLaunchTestCall(personas[0])}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.78rem', padding: '6px 14px' }}
              >
                🔴 Test This Call Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Architecture Strip */}
      <section style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(10, 14, 23, 0.6)', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 20, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>42ms</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edge Latency</div>
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }}></div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>94.2%</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Call Connect Rate</div>
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }}></div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8' }}>10+</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Indian Languages</div>
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }}></div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fb7185' }}>4.8x</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lead Conversion</div>
          </div>
        </div>
      </section>

      {/* Voice Personas Showcase */}
      <section id="personas" style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span className="chip chip-cold" style={{ textTransform: 'uppercase', marginBottom: 12 }}>Multilingual Indian Roster</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8 }}>
              Native Regional Accents & Dynamic Empathy
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '10px auto 0', fontSize: '0.95rem' }}>
              Listen to our pre-trained AI employees speak fluent regional languages with zero robotic stiffness.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {personas.map(p => (
              <div 
                key={p.id}
                style={{
                  background: 'rgba(16, 23, 38, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: p.avatarColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: '1.1rem'
                  }}>
                    {p.name[0]}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{p.name}</h3>
                    <div style={{ fontSize: '0.76rem', color: '#818cf8', fontWeight: 600 }}>{p.language}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14, minHeight: 40 }}>
                  {p.role}
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                  fontStyle: 'italic',
                  marginBottom: 16,
                  flex: 1
                }}>
                  "{p.sampleText}"
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                  {p.tags.map((t, idx) => (
                    <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.68rem', padding: '3px 8px', borderRadius: 4, color: 'var(--text-tertiary)' }}>
                      {t}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button 
                    onClick={() => handlePlayVoice(p)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', gap: 6, justifyContent: 'center' }}
                  >
                    {playingVoiceId === p.id ? <Pause size={14} color="#f43f5e" /> : <Play size={14} color="#38bdf8" />}
                    <span>{playingVoiceId === p.id ? 'Pause' : 'Sample'}</span>
                  </button>

                  <button 
                    onClick={() => handleLaunchTestCall(p)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.78rem', gap: 6, justifyContent: 'center' }}
                  >
                    <PhoneCall size={13} />
                    <span>Talk Live</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section id="features" style={{ padding: '80px 20px', background: 'rgba(10, 14, 23, 0.5)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span className="chip chip-warm" style={{ textTransform: 'uppercase', marginBottom: 12 }}>Platform Capabilities</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8 }}>
              Enterprise Telephony Re-Engineered For AI
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 620, margin: '10px auto 0', fontSize: '0.95rem' }}>
              Everything your revenue and customer experience team needs to scale phone interactions safely and profitably.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            <div className="glass-card" style={{ marginBottom: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: 16 }}>
                <PhoneForwarded size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>24/7 Inbound Receptionist</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Never leave incoming customer inquiries unanswered. Route your virtual numbers to autonomous agents that greet callers, answer questions, and seamlessly forward complex cases to human managers.
              </p>
            </div>

            <div className="glass-card" style={{ marginBottom: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: 16 }}>
                <PhoneCall size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Mass Outbound Bulk Dialing</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Upload customer lead lists and dial hundreds of prospects in parallel. Our smart answering machine detection ensures the AI speaks the moment a real person answers.
              </p>
            </div>

            <div className="glass-card" style={{ marginBottom: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185', marginBottom: 16 }}>
                <CheckCircle2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Real-Time Lead Qualification</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Automatically tag callers as Hot, Warm, or Cold based on customized qualification criteria. Instantly receive full transcripts, conversation summaries, and sentiment scores.
              </p>
            </div>

            <div className="glass-card" style={{ marginBottom: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: 16 }}>
                <Globe size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Dedicated Virtual Numbers</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Provision localized Indian mobile and landline virtual numbers directly from carrier trunks. Assign unique caller IDs to campaigns for higher pickup rates.
              </p>
            </div>

            <div className="glass-card" style={{ marginBottom: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', marginBottom: 16 }}>
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Instant 1-Click Retraining</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Fine-tune your agents' tone, opening greetings, FAQs, and qualification rules in real time. Changes take effect on the very next call with zero server redeployment.
              </p>
            </div>

            <div className="glass-card" style={{ marginBottom: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: 16 }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Compliant & Secure BaaS</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Built on high-performance InsForge infrastructure. Full end-to-end encryption, automated audit logging, and carrier regulatory compliance built in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          <span className="chip chip-active" style={{ textTransform: 'uppercase', marginBottom: 12 }}>3-Step Setup</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8, marginBottom: 50 }}>
            Up & Running in Under 60 Seconds
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, textAlign: 'left' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#6366f1', marginBottom: 10 }}>01</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Deploy AI Persona</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Select a ready-to-talk industry template or design custom greetings and qualification questions in any Indian regional language.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#06b6d4', marginBottom: 10 }}>02</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Assign Caller Line</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Connect your allocated virtual mobile number from our carrier pool for outbound dialer campaigns and 24/7 inbound answering.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', marginBottom: 10 }}>03</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Collect Hot Leads</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Launch campaigns or single instant calls. Review live transcripts, audio recordings, and qualified hot leads delivered to your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '80px 20px', background: 'rgba(10, 14, 23, 0.5)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', textAlign: 'center' }}>
          <span className="chip chip-cold" style={{ textTransform: 'uppercase', marginBottom: 12 }}>Transparent Pricing</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8 }}>
            Simple, Scalable Plans for Every Team
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '10px auto 40px', fontSize: '0.95rem' }}>
            No hidden setup fees. Pay only for the minutes and agents you actually deploy.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, textAlign: 'left' }}>
            {/* Plan 1 */}
            <div style={{ background: 'rgba(16, 23, 38, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', padding: 30, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Starter</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '12px 0 6px' }}>₹1,999<span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>/mo</span></div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Ideal for single founders and small service teams.</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li>✓ <strong>1 Deployed AI Persona</strong></li>
                <li>✓ <strong>500 Calling Minutes</strong> included</li>
                <li>✓ 1 Dedicated Virtual Phone Number</li>
                <li>✓ Inbound & Outbound Calling</li>
                <li>✓ Word-for-Word Transcripts</li>
              </ul>

              <button onClick={onGetStarted} className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%' }}>
                Get Started
              </button>
            </div>

            {/* Plan 2: Popular */}
            <div style={{
              background: 'rgba(20, 28, 48, 0.9)',
              border: '2px solid #6366f1',
              borderRadius: 'var(--radius-xl)',
              padding: 30,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 0 40px rgba(99, 102, 241, 0.25)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: -12, right: 24,
                background: 'var(--grad-primary)',
                color: '#fff', fontSize: '0.72rem', fontWeight: 800,
                padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase'
              }}>
                Most Popular
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>Professional</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '12px 0 6px' }}>₹4,999<span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>/mo</span></div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>For growing sales teams with high call volume.</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li>✓ <strong>5 Deployed AI Personas</strong></li>
                <li>✓ <strong>2,500 Calling Minutes</strong> included</li>
                <li>✓ 3 Dedicated Virtual Numbers</li>
                <li>✓ Parallel Bulk Campaigns (50 concurrent)</li>
                <li>✓ Automated Hot/Warm Lead Tagging</li>
                <li>✓ Priority LLaMA-3.3 70B Routing</li>
              </ul>

              <button onClick={onGetStarted} className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }}>
                Deploy Pro Workspace 🚀
              </button>
            </div>

            {/* Plan 3 */}
            <div style={{ background: 'rgba(16, 23, 38, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', padding: 30, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Enterprise</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '12px 0 6px' }}>Custom</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>High-volume call centers and enterprise BPOs.</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li>✓ <strong>Unlimited AI Personas</strong></li>
                <li>✓ Custom Minutes & Volume Discounts</li>
                <li>✓ Unlimited Parallel Calling Lines</li>
                <li>✓ Custom Voice Cloning in any Dialect</li>
                <li>✓ Dedicated Account Manager & SLA</li>
              </ul>

              <button onClick={onGetStarted} className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%' }}>
                Contact Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#030508', padding: '48px 24px 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 30, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={18} color="#fff" />
                </div>
                <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>VoiceAI Studio</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', maxWidth: 320 }}>
                Next-generation multilingual AI telecalling platform powered by high-speed neural models and Indian SIP infrastructure.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 40 }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>Platform</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Capabilities</a>
                  <a href="#personas" style={{ color: 'inherit', textDecoration: 'none' }}>Voice Personas</a>
                  <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing Plans</a>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>Gateways</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Carrier SIP: Online</span>
                  <span>Sarvam TTS: Online</span>
                  <span>Groq AI: Online</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            <div>© {new Date().getFullYear()} VoiceAI Studio Inc. All rights reserved.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="live-dot green"></span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Live Call Simulator HUD Modal */}
      <LiveCallSimulatorModal 
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        employee={simulatorEmployee}
        phoneNumber={simulatorEmployee?.phone_number || '+91 98765 01928'}
        contactName="Website Visitor"
      />
    </div>
  );
}
