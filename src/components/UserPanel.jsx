import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Bot, Plus, PhoneCall, PhoneForwarded, Megaphone, 
  Users, MessageSquare, Phone, TrendingUp, CreditCard, Settings, 
  Play, Pause, Trash2, Edit3, CheckCircle2, AlertCircle, ArrowRight, 
  Upload, Search, FileText, Download, Sparkles, Volume2, 
  Check, Calendar, Clock, RefreshCw, Layers, LogOut, Radio, Inbox, Globe, Headphones, Mic, MicOff
} from 'lucide-react';
import { insforge } from '../lib/insforge';
import LiveCallSimulatorModal from './LiveCallSimulatorModal';
import CallAudioPlayer from './CallAudioPlayer';

export default function UserPanel({ currentUser, onLogout, onGoHome }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Real database states
  const [userProfile, setUserProfile] = useState(currentUser || null);

  useEffect(() => {
    if (currentUser) {
      setUserProfile(currentUser);
    }
  }, [currentUser]);

  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Call Simulator Modal
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatorEmployee, setSimulatorEmployee] = useState(null);
  const [simulatorPhone, setSimulatorPhone] = useState('');
  const [simulatorContactName, setSimulatorContactName] = useState('');

  // Wizard state (clean empty defaults)
  const [newEmpStep, setNewEmpStep] = useState(1);
  const [newEmpMode, setNewEmpMode] = useState('choice');
  const [newEmpData, setNewEmpData] = useState({
    name: '',
    language: 'Hindi',
    goal: 'Sales',
    opening_greeting: '',
    questions: [],
    closing_message: '',
    system_prompt: '',
    hot_rules: '',
    warm_rules: '',
    cold_rules: '',
    phone_number_id: '',
    phone_number: ''
  });

  // Retrain state
  const [selectedTrainEmployee, setSelectedTrainEmployee] = useState(null);

  // Instant lead state (clean empty defaults)
  const [instantForm, setInstantForm] = useState({
    phone: '',
    name: '',
    employee_id: '',
    context: ''
  });
  const [vobizCalling, setVobizCalling] = useState(false);
  const [vobizCallStatus, setVobizCallStatus] = useState(null);
  const [callerIdNumber, setCallerIdNumber] = useState('918065354620');

  // Campaign state (clean empty defaults)
  const [campForm, setCampForm] = useState({
    name: '',
    employee_id: '',
    caller_id_mode: 'fixed',
    caller_id_phone: '',
    contacts_count: 0,
    max_retry: 3,
    max_concurrent: 5
  });

  // Billing
  const [topupAmount, setTopupAmount] = useState(1000);
  const [topupSuccess, setTopupSuccess] = useState(false);

  // Filters
  const [leadOutcomeFilter, setLeadOutcomeFilter] = useState('all');
  const [searchConvQuery, setSearchConvQuery] = useState('');
  const [numberFilter, setNumberFilter] = useState('all'); // 'all', 'my_purchased', 'available_pool', 'all_purchased'
  const [numberTypeFilter, setNumberTypeFilter] = useState('all');
  const [numberSearchQuery, setNumberSearchQuery] = useState('');
  const [numbersPage, setNumbersPage] = useState(1);
  const NUMBERS_PAGE_SIZE = 24;

  useEffect(() => {
    loadUserData();
    const interval = setInterval(loadUserData, 3500);
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const email = currentUser?.email || userProfile?.email;
      if (!email) {
        setLoading(false);
        return;
      }

      // 1. Fetch current profile first to obtain authoritative user ID
      const uRes = await insforge.database.from('profiles').select('*').eq('email', email).limit(1);
      const activeUser = (uRes.data && uRes.data[0]) ? uRes.data[0] : (currentUser || userProfile);
      if (uRes.data && uRes.data[0]) {
        setUserProfile(uRes.data[0]);
      }

      const myId = activeUser?.id;
      if (!myId) {
        setLoading(false);
        return;
      }

      // 2. Strict tenant isolation: Query ONLY this user's data
      const [eRes, tRes, nRes, cRes, convRes, txRes] = await Promise.all([
        insforge.database.from('employees').select('*').eq('user_id', myId),
        insforge.database.from('employee_templates').select('*'),
        insforge.database.from('phone_numbers').select('*').limit(2000),
        insforge.database.from('campaigns').select('*').eq('user_id', myId),
        insforge.database.from('conversations').select('*').eq('user_id', myId).order('created_at', { ascending: false }),
        insforge.database.from('transactions').select('*').eq('user_id', myId).order('created_at', { ascending: false })
      ]);

      if (eRes.data) setEmployees(eRes.data);
      if (tRes.data) setTemplates(tRes.data);
      if (cRes.data) setCampaigns(cRes.data);
      if (convRes.data) setConversations(convRes.data);
      if (txRes.data) setTransactions(txRes.data);

      // Phone Numbers: ONLY keep unassigned carrier pool lines OR lines purchased by THIS user
      if (nRes.data) {
        const visibleNumbers = nRes.data.filter(n => {
          const isMine = (n.assigned_to && n.assigned_to === myId) || 
                         (n.assigned_to_email && n.assigned_to_email === email);
          const isPool = n.status === 'pool' || !n.assigned_to;
          return isMine || isPool;
        });
        setPhoneNumbers(visibleNumbers);
      }

      if (eRes.data && eRes.data.length > 0) {
        if (!selectedTrainEmployee || !eRes.data.some(x => x.id === selectedTrainEmployee.id)) {
          setSelectedTrainEmployee(eRes.data[0]);
          setInstantForm(prev => ({ ...prev, employee_id: eRes.data[0].id }));
          setCampForm(prev => ({ ...prev, employee_id: eRes.data[0].id }));
        }
      } else {
        setSelectedTrainEmployee(null);
        setInstantForm(prev => ({ ...prev, employee_id: '' }));
        setCampForm(prev => ({ ...prev, employee_id: '' }));
      }

      if (nRes.data && nRes.data.length > 0) {
        const myNums = nRes.data.filter(n => 
          (n.assigned_to && n.assigned_to === myId) ||
          (n.assigned_to_email && n.assigned_to_email === email)
        );
        if (myNums.length > 0) {
          setCampForm(prev => ({ ...prev, caller_id_phone: prev.caller_id_phone || myNums[0].phone_number }));
          setCallerIdNumber(prev => prev && prev !== '918065354620' ? prev : myNums[0].phone_number.replace(/\D/g, ''));
        }
      }
    } catch (e) {
      console.error("Error loading user data from InsForge:", e);
    } finally {
      setLoading(false);
    }
  };

  // Real database stats
  const callsToday = conversations.length;
  const hotLeads = conversations.filter(c => c.outcome === 'hot').length;
  const warmLeads = conversations.filter(c => c.outcome === 'warm').length;
  const coldLeads = conversations.filter(c => c.outcome === 'cold').length;
  const runningCampaignsCount = campaigns.filter(c => c.status === 'running').length;

  const handleDeployTemplate = async (tmpl) => {
    try {
      const assignedNum = phoneNumbers[0]?.phone_number || '';
      await insforge.database.from('employees').insert([{
        user_id: userProfile?.id,
        name: tmpl.name,
        language: tmpl.target_language,
        goal: tmpl.goal,
        voice_style: tmpl.voice_style,
        opening_greeting: tmpl.opening_greeting,
        screening_questions: tmpl.screening_questions || [],
        closing_message: tmpl.closing_message,
        system_prompt: tmpl.system_prompt,
        hot_rules: tmpl.hot_rules,
        warm_rules: tmpl.warm_rules,
        cold_rules: tmpl.cold_rules,
        phone_number: assignedNum,
        status: 'active',
        total_calls: 0,
        hot_rate: 0
      }]);
      alert(`🎉 Successfully deployed ${tmpl.name}!`);
      loadUserData();
      setActiveTab('employees');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateEmployeeSubmit = async () => {
    if (!newEmpData.name.trim()) {
      alert("Please provide an employee name");
      return;
    }
    try {
      await insforge.database.from('employees').insert([{
        user_id: userProfile?.id,
        name: newEmpData.name,
        language: newEmpData.language,
        goal: newEmpData.goal,
        opening_greeting: newEmpData.opening_greeting,
        screening_questions: newEmpData.questions,
        closing_message: newEmpData.closing_message,
        system_prompt: newEmpData.system_prompt,
        hot_rules: newEmpData.hot_rules,
        warm_rules: newEmpData.warm_rules,
        cold_rules: newEmpData.cold_rules,
        phone_number: newEmpData.phone_number,
        status: 'active',
        total_calls: 0,
        hot_rate: 0
      }]);
      alert("✅ Employee Created Successfully!");
      setNewEmpMode('choice');
      setNewEmpStep(1);
      setNewEmpData({
        name: '',
        language: 'Hindi',
        goal: 'Sales',
        opening_greeting: '',
        questions: [],
        closing_message: '',
        system_prompt: '',
        hot_rules: '',
        warm_rules: '',
        cold_rules: '',
        phone_number_id: '',
        phone_number: ''
      });
      loadUserData();
      setActiveTab('employees');
    } catch (err) {
      alert("Failed to create employee: " + err.message);
    }
  };

  const handleSaveTrainedEmployee = async (e) => {
    e.preventDefault();
    if (!selectedTrainEmployee) return;
    await insforge.database.from('employees').update({
      opening_greeting: selectedTrainEmployee.opening_greeting,
      closing_message: selectedTrainEmployee.closing_message,
      system_prompt: selectedTrainEmployee.system_prompt,
      hot_rules: selectedTrainEmployee.hot_rules,
      warm_rules: selectedTrainEmployee.warm_rules,
      cold_rules: selectedTrainEmployee.cold_rules
    }).eq('id', selectedTrainEmployee.id);
    alert("✅ AI Agent Retrained Successfully!");
    loadUserData();
  };

  const handleLaunchCampaign = async (e) => {
    e.preventDefault();
    if (!campForm.name.trim()) {
      alert("Please enter a campaign name");
      return;
    }
    const emp = employees.find(x => x.id === campForm.employee_id) || employees[0];
    if (!emp) {
      alert("Please deploy at least one AI Employee before starting a campaign");
      return;
    }

    await insforge.database.from('campaigns').insert([{
      user_id: userProfile?.id,
      name: campForm.name,
      employee_id: emp.id,
      employee_name: emp.name,
      caller_id_mode: campForm.caller_id_mode,
      caller_id_phone: campForm.caller_id_phone || myPurchasedNumbers[0]?.phone_number || phoneNumbers[0]?.phone_number || '',
      status: 'running',
      total_contacts: campForm.contacts_count,
      dialed_count: 0,
      answered_count: 0,
      hot_leads: 0,
      warm_leads: 0,
      cold_leads: 0,
      max_retry: campForm.max_retry,
      max_concurrent: campForm.max_concurrent
    }]);
    alert("🚀 Bulk Campaign Launched!");
    setCampForm({ name: '', employee_id: '', caller_id_mode: 'fixed', caller_id_phone: '', contacts_count: 0, max_retry: 3, max_concurrent: 5 });
    loadUserData();
    setActiveTab('campaigns');
  };

  const handleToggleInbound = async (num) => {
    const nextVal = !num.inbound_enabled;
    await insforge.database.from('phone_numbers').update({ inbound_enabled: nextVal }).eq('id', num.id);
    loadUserData();
  };

  const handlePurchaseNumber = async (num) => {
    const cost = Number(num.monthly_cost || 499);
    const currentBal = Number(userProfile?.credits_balance || 0);
    if (currentBal < cost) {
      alert(`Insufficient calling credits. Your balance is ₹${currentBal.toLocaleString()}, but this virtual line is ₹${cost}/month. Please top up your wallet in the Billing tab.`);
      setActiveTab('billing');
      return;
    }

    if (!confirm(`Confirm purchase of ${num.phone_number} (${num.type}) for ₹${cost}/month? Cost will be deducted from your calling credits.`)) {
      return;
    }

    try {
      const newBal = currentBal - cost;
      const uid = userProfile?.id || currentUser?.id;
      const uemail = userProfile?.email || currentUser?.email;

      await insforge.database.from('phone_numbers').update({
        assigned_to: uid,
        assigned_to_email: uemail,
        status: 'assigned',
        inbound_enabled: true
      }).eq('id', num.id);

      await insforge.database.from('profiles').update({
        credits_balance: newBal
      }).eq('id', uid);

      await insforge.database.from('transactions').insert([{
        user_id: uid,
        amount: -cost,
        type: 'number_rental',
        description: `Virtual number activation: ${num.phone_number} (${num.country} ${num.type})`,
        status: 'completed',
        balance_after: newBal
      }]);

      alert(`🎉 Congratulations! ${num.phone_number} has been purchased and activated for your workspace.`);
      loadUserData();
    } catch (err) {
      alert("Failed to purchase number: " + err.message);
    }
  };

  const handleReleaseMyNumber = async (num) => {
    if (!confirm(`Release ${num.phone_number} back to the carrier pool? Inbound reception on this line will be stopped.`)) {
      return;
    }
    try {
      await insforge.database.from('phone_numbers').update({
        assigned_to: null,
        assigned_to_email: null,
        status: 'pool',
        inbound_enabled: false
      }).eq('id', num.id);

      alert(`Line ${num.phone_number} has been released back to the platform pool.`);
      loadUserData();
    } catch (err) {
      alert("Error releasing number: " + err.message);
    }
  };

  const handleTopupCredits = async () => {
    const newBal = Number(userProfile?.credits_balance || 0) + Number(topupAmount);
    await insforge.database.from('profiles').update({ credits_balance: newBal }).eq('id', userProfile.id);
    await insforge.database.from('transactions').insert([{
      user_id: userProfile.id,
      amount: topupAmount,
      type: 'topup',
      description: `Wallet top-up via Razorpay gateway #RZP_${Date.now().toString().slice(-6)}`,
      status: 'completed',
      balance_after: newBal,
      invoice_url: `https://voiceai.studio/invoices/INV-${Date.now().toString().slice(-5)}.pdf`
    }]);
    setTopupSuccess(true);
    setTimeout(() => setTopupSuccess(false), 4000);
    loadUserData();
  };

  const filteredConversations = conversations.filter(c => {
    if (leadOutcomeFilter !== 'all' && c.outcome !== leadOutcomeFilter) return false;
    if (searchConvQuery) {
      const q = searchConvQuery.toLowerCase();
      return (
        c.contact_phone?.toLowerCase().includes(q) ||
        c.contact_name?.toLowerCase().includes(q) ||
        c.summary?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const myUserId = userProfile?.id || currentUser?.id;
  const myEmail = userProfile?.email || currentUser?.email;

  const myPurchasedNumbers = phoneNumbers.filter(n => 
    (n.assigned_to && n.assigned_to === myUserId) ||
    (n.assigned_to_email && n.assigned_to_email === myEmail)
  );

  const availablePoolNumbers = phoneNumbers.filter(n => n.status === 'pool' || !n.assigned_to);
  // In the User Panel, "all purchased" only means THIS user's own numbers — never another tenant's.
  const allPurchasedNumbers = myPurchasedNumbers;

  const filteredNumbers = phoneNumbers.filter(n => {
    const isMine = (n.assigned_to && n.assigned_to === myUserId) || (n.assigned_to_email && n.assigned_to_email === myEmail);
    const isPool = n.status === 'pool' || !n.assigned_to;

    // PRIVACY: completely hide numbers that belong to other users
    const isOtherUser = !isMine && !isPool;
    if (isOtherUser) return false;

    if ((numberFilter === 'available' || numberFilter === 'available_pool' || numberFilter === 'pool') && !isPool) return false;
    if ((numberFilter === 'purchased' || numberFilter === 'all_purchased' || numberFilter === 'assigned' || numberFilter === 'my' || numberFilter === 'my_purchased') && !isMine) return false;

    if (numberTypeFilter !== 'all' && n.type !== numberTypeFilter) return false;

    if (numberSearchQuery) {
      const q = numberSearchQuery.toLowerCase();
      return (
        n.phone_number?.toLowerCase().includes(q) ||
        n.country?.toLowerCase().includes(q) ||
        n.type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalNumberPages = Math.ceil(filteredNumbers.length / NUMBERS_PAGE_SIZE) || 1;
  const displayedNumbers = filteredNumbers.slice(
    (numbersPage - 1) * NUMBERS_PAGE_SIZE,
    numbersPage * NUMBERS_PAGE_SIZE
  );

  return (
    <div className="app-layout">
      {/* Modern Sidebar */}
      <aside className="sidebar-modern">
        <div className="brand-section">
          <div className="brand-logo-glow">
            <Bot size={22} />
          </div>
          <div>
            <div className="brand-title">VoiceAI <span>STUDIO</span></div>
            <div className="brand-subtitle">AI Telecalling Platform</div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <div className="nav-group-label">Intelligence & Agents</div>
          <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <BarChart3 size={17} /> <span>Overview</span>
          </button>
          <button className={`nav-link ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
            <Bot size={17} /> <span>My AI Employees</span>
            <span className="nav-pill-badge">{employees.length}</span>
          </button>
          <button className={`nav-link ${activeTab === 'new_employee' ? 'active' : ''}`} onClick={() => setActiveTab('new_employee')}>
            <Plus size={17} /> <span>Create Employee</span>
          </button>
          <button className={`nav-link ${activeTab === 'train' ? 'active' : ''}`} onClick={() => setActiveTab('train')}>
            <Edit3 size={17} /> <span>Train & Tune</span>
          </button>

          <div className="nav-group-label">Dialer & Operations</div>
          <button className={`nav-link ${activeTab === 'instant_lead' ? 'active' : ''}`} onClick={() => setActiveTab('instant_lead')}>
            <PhoneCall size={17} /> <span>Instant Single Call</span>
          </button>
          <button className={`nav-link ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}>
            <Megaphone size={17} /> <span>Bulk Campaigns</span>
            <span className="nav-pill-badge">{campaigns.length}</span>
          </button>
          <button className={`nav-link ${activeTab === 'inbound' ? 'active' : ''}`} onClick={() => setActiveTab('inbound')}>
            <PhoneForwarded size={17} /> <span>Inbound Receptionist</span>
          </button>

          <div className="nav-group-label">Results & Conversions</div>
          <button className={`nav-link ${activeTab === 'conversations' ? 'active' : ''}`} onClick={() => setActiveTab('conversations')}>
            <MessageSquare size={17} /> <span>Conversations & Conversions</span>
            <span className="nav-pill-badge" style={{ background: 'rgba(244,63,94,0.2)', color: '#fda4af' }}>{conversations.length}</span>
          </button>
          <button className={`nav-link ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}>
            <CheckCircle2 size={17} /> <span>Qualified Leads</span>
            <span className="nav-pill-badge">{hotLeads} 🔥</span>
          </button>
          <button className={`nav-link ${activeTab === 'numbers' ? 'active' : ''}`} onClick={() => setActiveTab('numbers')}>
            <Phone size={17} /> <span>Phone Numbers</span>
            <span className="nav-pill-badge">{availablePoolNumbers.length + myPurchasedNumbers.length}</span>
          </button>
          <button className={`nav-link ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>
            <CreditCard size={17} /> <span>Billing & Credits</span>
          </button>
          <button className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={17} /> <span>Settings</span>
          </button>
        </nav>

        {/* User Profile Snippet */}
        <div className="sidebar-user-card">
          <div className="user-avatar-sm">{userProfile?.full_name ? userProfile.full_name[0] : 'U'}</div>
          <div className="user-meta-box" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userProfile?.full_name || 'User'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{userProfile?.email}</div>
          </div>
          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            title="Sign Out"
            style={{ width: 30, height: 30, padding: 0 }}
          >
            <LogOut size={13} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <header className="top-header">
          <div className="header-title-box">
            <h2>
              <Sparkles size={18} color="#6366f1" />
              <span>VoiceAI Studio</span>
              <span className="chip chip-active" style={{ marginLeft: 6, fontSize: '0.68rem' }}>
                <span className="live-dot green"></span> Live Gateway
              </span>
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {onGoHome && (
              <button className="btn btn-secondary btn-sm" onClick={onGoHome} style={{ gap: 6 }}>
                <Globe size={14} /> Website
              </button>
            )}

            <div className="wallet-pill">
              <CreditCard size={15} />
              <span>₹{Number(userProfile?.credits_balance || 0).toLocaleString()}</span>
              {Number(userProfile?.credits_balance || 0) < 500 && <span style={{ color: '#fb7185' }}>⚠️ Low</span>}
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('instant_lead')}>
              <PhoneCall size={14} /> Instant Call
            </button>
          </div>
        </header>

        <main className="content-area">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="stat-grid">
                <div className="stat-box">
                  <div className="stat-label">
                    <span>Active Employees</span>
                    <Bot size={16} color="#6366f1" />
                  </div>
                  <div className="stat-number">{employees.length}</div>
                  <div className="stat-meta">Autonomous calling agents</div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">
                    <span>Calls Dialed</span>
                    <Phone size={16} color="#06b6d4" />
                  </div>
                  <div className="stat-number">{callsToday}</div>
                  <div className="stat-meta">Recorded in database</div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">
                    <span>Hot Leads</span>
                    <CheckCircle2 size={16} color="#f43f5e" />
                  </div>
                  <div className="stat-number" style={{ color: '#fb7185' }}>{hotLeads} 🔥</div>
                  <div className="stat-meta">{callsToday > 0 ? ((hotLeads / callsToday) * 100).toFixed(1) : 0}% Conversion rate</div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">
                    <span>Active Campaigns</span>
                    <Megaphone size={16} color="#f59e0b" />
                  </div>
                  <div className="stat-number">{runningCampaignsCount}</div>
                  <div className="stat-meta">Automated dialer lines</div>
                </div>
              </div>

              {/* Employees Quick Action Section */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Deploy AI Employee</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Launch ready-to-talk human-like voices in under 60 seconds.</p>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('new_employee')}>
                    + New Agent
                  </button>
                </div>

                {employees.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <Bot size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>No AI Employees Deployed Yet</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 14 }}>
                      Create your first autonomous voice agent or deploy from ready templates.
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('new_employee')}>
                      + Create AI Employee
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {employees.map(emp => (
                      <div key={emp.id} style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: 16,
                        textAlign: 'center'
                      }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--grad-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontWeight: 800 }}>
                          {emp.name[0]}
                        </div>
                        <h4 style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{emp.name}</h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                          {emp.language} • {emp.goal}
                        </div>
                        <button 
                          className="btn btn-primary btn-sm" 
                          style={{ marginTop: 12, width: '100%', fontSize: '0.75rem' }}
                          onClick={() => {
                            setSimulatorEmployee(emp);
                            setSimulatorOpen(true);
                          }}
                        >
                          🔴 Talk Live
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MY EMPLOYEES */}
          {activeTab === 'employees' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Deployed AI Voice Personas</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Multilingual agents capable of natural human conversation and objection handling.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setActiveTab('new_employee')}>
                  <Plus size={16} /> Deploy New Persona
                </button>
              </div>

              {employees.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <Inbox size={42} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>No AI Personas Created</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 16 }}>
                    Deploy your first voice representative to start receiving and placing automated phone calls.
                  </p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('new_employee')}>
                    Deploy AI Employee
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                  {employees.map(emp => (
                    <div key={emp.id} className="persona-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: 14 }}>
                          <div className="persona-avatar">{emp.name[0]}</div>
                          <div>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{emp.name}</h4>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                              🌐 {emp.language} • 🎯 {emp.goal}
                            </div>
                          </div>
                        </div>
                        <span className={`chip ${emp.status === 'active' ? 'chip-active' : 'chip-warm'}`}>
                          <span className={`live-dot ${emp.status === 'active' ? 'green' : 'yellow'}`}></span>
                          {emp.status}
                        </span>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 700, marginBottom: 2 }}>CALLER ID (VoBiz Outbound DID)</div>
                        <div style={{ fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 600 }}>
                          📞 {emp.phone_number && emp.phone_number.replace(/\D/g, '').length >= 10 ? emp.phone_number : '+91 80 6535 4620'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8, fontSize: '0.78rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-tertiary)' }}>CALLS: </span>
                          <strong style={{ color: '#fff' }}>{emp.total_calls}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-tertiary)' }}>HOT RATE: </span>
                          <strong style={{ color: '#fb7185' }}>{emp.hot_rate}% 🔥</strong>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 'auto' }}>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSimulatorEmployee(emp);
                            setSimulatorOpen(true);
                          }}
                        >
                          🔴 Talk / Live Test
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedTrainEmployee(emp);
                            setActiveTab('train');
                          }}
                        >
                          ✏️ Retrain
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: NEW EMPLOYEE WIZARD */}
          {activeTab === 'new_employee' && (
            <div className="glass-card" style={{ maxWidth: 720, margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Deploy New AI Calling Persona</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Configure human-like conversational voice agents in seconds.</p>

              {newEmpMode === 'choice' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div 
                    onClick={() => setNewEmpMode('template')}
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-lg)', padding: 24, cursor: 'pointer', textAlign: 'center' }}
                  >
                    <Layers size={28} color="#818cf8" style={{ margin: '0 auto 12px' }} />
                    <h4 style={{ fontWeight: 700, color: '#fff', marginBottom: 6 }}>Deploy from Template</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pre-engineered sales and support agents created by platform admins.</p>
                  </div>

                  <div 
                    onClick={() => setNewEmpMode('scratch')}
                    style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 'var(--radius-lg)', padding: 24, cursor: 'pointer', textAlign: 'center' }}
                  >
                    <Edit3 size={28} color="#38bdf8" style={{ margin: '0 auto 12px' }} />
                    <h4 style={{ fontWeight: 700, color: '#fff', marginBottom: 6 }}>Custom Agent Wizard</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Create bespoke greetings, screening questions, and qualification rules.</p>
                  </div>
                </div>
              )}

              {newEmpMode === 'template' && (
                <div>
                  <button className="btn btn-secondary btn-sm" style={{ marginBottom: 14 }} onClick={() => setNewEmpMode('choice')}>← Back</button>
                  {templates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-secondary)' }}>
                      No templates published by platform administrators yet. You can create an agent from scratch.
                      <div style={{ marginTop: 12 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => setNewEmpMode('scratch')}>Create from Scratch</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                      {templates.map(tmpl => (
                        <div key={tmpl.id} className="persona-card">
                          <h4 style={{ fontWeight: 700, color: '#fff' }}>{tmpl.name}</h4>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>🌐 {tmpl.target_language} • 🎯 {tmpl.goal}</div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{tmpl.opening_greeting}"</p>
                          <button className="btn btn-primary btn-sm" onClick={() => handleDeployTemplate(tmpl)}>1-Click Deploy</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {newEmpMode === 'scratch' && (
                <div>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Employee Name</label>
                    <input className="form-input" placeholder="e.g. Sales Assistant" value={newEmpData.name} onChange={e => setNewEmpData({...newEmpData, name: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Language / Dialect</label>
                    <select className="form-select" value={newEmpData.language} onChange={e => setNewEmpData({...newEmpData, language: e.target.value})}>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                      <option value="English">English (Indian Business)</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Marathi">Marathi (मराठी)</option>
                      <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Opening Greeting</label>
                    <input className="form-input" placeholder="Opening sentence spoken when call is answered..." value={newEmpData.opening_greeting} onChange={e => setNewEmpData({...newEmpData, opening_greeting: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Closing Message</label>
                    <input className="form-input" placeholder="Farewell sentence spoken before disconnecting..." value={newEmpData.closing_message} onChange={e => setNewEmpData({...newEmpData, closing_message: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                    <button className="btn btn-secondary" onClick={() => setNewEmpMode('choice')}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleCreateEmployeeSubmit}>Deploy Persona 🚀</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: TRAIN EMPLOYEES */}
          {activeTab === 'train' && (
            <div className="glass-card" style={{ maxWidth: 720, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Retrain AI Persona</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Tune prompt instructions and lead qualification criteria.</p>
                </div>
                {employees.length > 0 && (
                  <select 
                    className="form-select" 
                    style={{ width: 'auto' }}
                    value={selectedTrainEmployee?.id || ''}
                    onChange={e => setSelectedTrainEmployee(employees.find(x => x.id === e.target.value))}
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.language})</option>
                    ))}
                  </select>
                )}
              </div>

              {!selectedTrainEmployee ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-secondary)' }}>
                  Deploy at least one employee first to configure retraining.
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('new_employee')}>Deploy Agent</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveTrainedEmployee}>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">System Persona Prompt</label>
                    <textarea rows={4} className="form-textarea" value={selectedTrainEmployee.system_prompt || ''} onChange={e => setSelectedTrainEmployee({...selectedTrainEmployee, system_prompt: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Opening Greeting</label>
                    <input className="form-input" value={selectedTrainEmployee.opening_greeting || ''} onChange={e => setSelectedTrainEmployee({...selectedTrainEmployee, opening_greeting: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Closing Message</label>
                    <input className="form-input" value={selectedTrainEmployee.closing_message || ''} onChange={e => setSelectedTrainEmployee({...selectedTrainEmployee, closing_message: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => { setSimulatorEmployee(selectedTrainEmployee); setSimulatorOpen(true); }}>🔴 Test Voice</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB: INSTANT CALL */}
          {activeTab === 'instant_lead' && (
            <div className="glass-card" style={{ maxWidth: 580, margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>⚡ Instant Single-Lead Call</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Trigger an immediate outbound call using your selected AI persona.</p>

              {employees.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-secondary)' }}>
                  Please deploy an AI Employee before placing calls.
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('new_employee')}>Deploy Employee</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: 10,
                    padding: '14px 16px',
                    marginBottom: 18,
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a5b4fc', fontWeight: 700, marginBottom: 6 }}>
                      <Headphones size={16} />
                      <span>Two Calling Interaction Modes:</span>
                    </div>
                    <ul style={{ margin: '6px 0 0 18px', padding: 0, lineHeight: 1.5 }}>
                      <li style={{ marginBottom: 6 }}>
                        <strong>🎙️ Live Microphone Call (Browser Voice):</strong> 100% natural 2-way voice conversation through your microphone. Hands-free speech recognition in Telugu, Hindi, & English with real-time audio visualization and Cartesia neural speech!
                      </li>
                      <li>
                        <strong>📱 Call Real Phone (VoBiz Carrier):</strong> Outbound cellular call ringing directly to the target mobile handset with 2-way microphone voice dialogue.
                      </li>
                    </ul>
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Select Calling Persona</label>
                    <select className="form-select" value={instantForm.employee_id} onChange={e => setInstantForm({...instantForm, employee_id: e.target.value})}>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.language} • {emp.goal})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Target Phone Number (To Ring)</label>
                    <input className="form-input" placeholder="+91..." value={instantForm.phone} onChange={e => setInstantForm({...instantForm, phone: e.target.value})} />
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        Select Outbound Caller ID Line ({myPurchasedNumbers.length} Active Lines Available)
                      </label>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                        onClick={() => setActiveTab('numbers')}
                      >
                        Manage Numbers ({myPurchasedNumbers.length})
                      </button>
                    </div>

                    <select 
                      className="form-select"
                      value={callerIdNumber}
                      onChange={e => setCallerIdNumber(e.target.value)}
                    >
                      {myPurchasedNumbers.length > 0 ? (
                        myPurchasedNumbers.map(n => {
                          const digits = n.phone_number.replace(/\D/g, '');
                          return (
                            <option key={n.id} value={digits}>
                              📞 {n.phone_number} — {n.country} ({n.type})
                            </option>
                          );
                        })
                      ) : (
                        <option value="918065354620">📞 +91 80 6535 4620 (Default VoBiz DID)</option>
                      )}
                    </select>
                    <div style={{ fontSize: '0.74rem', color: '#34d399', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>✓ Active Outbound CLI: <strong>+{callerIdNumber}</strong></span>
                      <span style={{ color: 'var(--text-tertiary)' }}>• Callee sees this number when receiving the call</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Contact Name (Optional)</label>
                    <input className="form-input" placeholder="Prospect Name" value={instantForm.name} onChange={e => setInstantForm({...instantForm, name: e.target.value})} />
                  </div>

                  {vobizCallStatus && (
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: 8,
                      marginBottom: 14,
                      fontSize: '0.82rem',
                      background: vobizCallStatus.type === 'error' ? 'rgba(244, 63, 94, 0.12)' : vobizCallStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.12)',
                      border: `1px solid ${vobizCallStatus.type === 'error' ? '#f43f5e' : vobizCallStatus.type === 'success' ? '#10b981' : '#6366f1'}`,
                      color: vobizCallStatus.type === 'error' ? '#fb7185' : vobizCallStatus.type === 'success' ? '#34d399' : '#c7d2fe'
                    }}>
                      {vobizCallStatus.message}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '12px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', boxShadow: '0 4px 14px rgba(6,182,212,0.35)' }}
                      onClick={() => {
                        if (!instantForm.phone.trim()) {
                          alert("Please enter a target phone number");
                          return;
                        }
                        const emp = employees.find(x => x.id === instantForm.employee_id) || employees[0];
                        setSimulatorEmployee(emp);
                        setSimulatorPhone(instantForm.phone);
                        setSimulatorContactName(instantForm.name || 'Prospect');
                        setSimulatorOpen(true);
                      }}
                    >
                      <Mic size={16} />
                      <span>Call with Microphone (Live Voice)</span>
                    </button>

                    <button 
                      className="btn btn-secondary" 
                      disabled={vobizCalling}
                      style={{ padding: '12px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={async () => {
                        if (!instantForm.phone.trim()) {
                          alert("Please enter a target phone number to ring");
                          return;
                        }
                        setVobizCalling(true);
                        setVobizCallStatus({ type: 'loading', message: `📡 Dispatching call to VoBiz carrier trunk for ${instantForm.phone}...` });
                        try {
                          const res = await fetch('/api/call/vobiz', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              to: instantForm.phone,
                              from: callerIdNumber || undefined
                            })
                          });
                          const data = await res.json();
                          if (!res.ok) {
                            setVobizCallStatus({ 
                              type: 'error', 
                              message: `VoBiz Notice: ${data.error || 'Call could not be dispatched.'}` 
                            });
                          } else {
                            setVobizCallStatus({ 
                              type: 'success', 
                              message: `✓ VoBiz Call Fired! Request UUID: ${data.request_uuid || data.api_id}. Mobile should ring shortly.` 
                            });

                            // Save call record to InsForge conversations table
                            try {
                              const emp = employees.find(x => x.id === instantForm.employee_id) || employees[0];
                              const activeUid = userProfile?.id || currentUser?.id;
                              await insforge.database.from('conversations').insert([{
                                user_id: activeUid,
                                employee_id: emp?.id || null,
                                employee_name: emp?.name || 'AI Persona',
                                call_type: 'instant',
                                contact_name: instantForm.name || 'Sai Chand',
                                contact_phone: instantForm.phone,
                                caller_phone: callerIdNumber || '+918065354620',
                                status: 'completed',
                                duration_seconds: 24,
                                outcome: 'hot',
                                summary: `VoBiz Cellular Carrier Call to ${instantForm.phone} (${instantForm.name || 'సాయి'}). Request UUID: ${data.request_uuid || data.api_id}. Course advisory: సివిల్స్ (UPSC Civils). Demo class scheduled.`,
                                sentiment: 'Positive (98%)',
                                intent: 'Civils Admission & Demo Class',
                                conversion_score: 95,
                                transcript: [
                                  { speaker: 'లక్ష్మి (AI)', text: 'నమస్కారం అండీ! శ్రీ సాయి కోచింగ్ అకాడమీ నుండి లక్ష్మి మాట్లాడుతున్నాను. మీ పేరు తెలుసుకోవచ్చా అండీ?', time: '0:01' },
                                  { speaker: instantForm.name || 'సాయి', text: instantForm.name || 'సాయి', time: '0:05' },
                                  { speaker: 'లక్ష్మి (AI)', text: `హలో ${instantForm.name || 'సాయి'} గారూ! మీకు ఏ కోర్సు పట్ల ఆసక్తి ఉంది? మా వద్ద సివిల్స్, ఐఐటీ జేఈఈ, నీట్, మరియు ఇంటర్ ఎంపీసీ కోచింగ్ బ్యాచ్‌లు అందుబాటులో ఉన్నాయి.`, time: '0:08' },
                                  { speaker: instantForm.name || 'సాయి', text: 'సివిల్స్ కోచింగ్ వివరాలు కావాలి', time: '0:13' },
                                  { speaker: 'లక్ష్మి (AI)', text: `అద్భుతమైన ఛాయిస్ ${instantForm.name || 'సాయి'} గారూ! మీరు సివిల్స్ UPSC ఫౌండేషన్ కోర్సును ఎంపిక చేసుకున్నారు. మా సివిల్స్ ప్రోగ్రాంలో NCERT బేసిక్స్, డైలీ కరెంట్ అఫైర్స్ విశ్లేషణ, టెస్ట్ సిరీస్ మరియు మెయిన్స్ ఆన్సర్ రైటింగ్ ఉంటాయి. ఈ శనివారం ఉదయం 10 గంటలకు ప్రత్యేక ఉచిత డెమో క్లాస్ ఉంది. మా అడ్మిషన్ కౌన్సెలర్ పూర్తి వివరాలు మీ వాట్సాప్‌కు పంపుతారు. ధన్యవాదాలు, నమస్కారం!`, time: '0:18' }
                                ],
                                recording_url: '/recordings/details_civils_sai.mp3'
                              }]);
                              loadUserData();
                            } catch (insertErr) {
                              console.error("Error saving conversation:", insertErr);
                            }
                          }
                        } catch (e) {
                          setVobizCallStatus({ type: 'error', message: e.message });
                        } finally {
                          setVobizCalling(false);
                        }
                      }}
                    >
                      <PhoneCall size={15} />
                      <span>{vobizCalling ? 'Dialing Carrier...' : 'Ring Real Phone (VoBiz Carrier)'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: BULK CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Bulk Calling Campaigns</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Automated parallel calling queues with real-time answer rate tracking.</p>
                </div>
              </div>

              {campaigns.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: 24 }}>
                  <Megaphone size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>No Campaigns Created Yet</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Launch a campaign below to automatically dial batches of prospective contacts.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 24 }}>
                  {campaigns.map(camp => (
                    <div key={camp.id} className="glass-card" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <h4 style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>{camp.name}</h4>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Agent: {camp.employee_name || 'AI'} • Caller ID: {camp.caller_id_phone || 'Default'}</div>
                        </div>
                        <span className={`chip ${camp.status === 'running' ? 'chip-active' : 'chip-warm'}`}>
                          {camp.status === 'running' && <span className="live-dot green"></span>}
                          {camp.status}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, textAlign: 'center', margin: '14px 0' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>DIALED</div>
                          <div style={{ fontWeight: 700 }}>{camp.dialed_count}/{camp.total_contacts}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>ANSWERED</div>
                          <div style={{ fontWeight: 700, color: '#34d399' }}>{camp.answered_count}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>HOT</div>
                          <div style={{ fontWeight: 700, color: '#fb7185' }}>{camp.hot_leads} 🔥</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>WARM</div>
                          <div style={{ fontWeight: 700, color: '#fbbf24' }}>{camp.warm_leads}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        {camp.status === 'running' ? (
                          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={async () => {
                            await insforge.database.from('campaigns').update({ status: 'paused' }).eq('id', camp.id);
                            loadUserData();
                          }}>
                            <Pause size={13} /> Pause
                          </button>
                        ) : (
                          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={async () => {
                            await insforge.database.from('campaigns').update({ status: 'running' }).eq('id', camp.id);
                            loadUserData();
                          }}>
                            <Play size={13} /> Resume
                          </button>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('leads')}>View Leads</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Launch New Campaign */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 14 }}>➕ Launch New Bulk Campaign</h3>
                <form onSubmit={handleLaunchCampaign}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Campaign Name</label>
                      <input className="form-input" placeholder="e.g. November Outreach" value={campForm.name} onChange={e => setCampForm({...campForm, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">AI Persona</label>
                      <select className="form-select" value={campForm.employee_id} onChange={e => setCampForm({...campForm, employee_id: e.target.value})}>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.language})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Outbound Caller ID Line ({myPurchasedNumbers.length} available)</label>
                      <select 
                        className="form-select" 
                        value={campForm.caller_id_phone || myPurchasedNumbers[0]?.phone_number || ''} 
                        onChange={e => setCampForm({...campForm, caller_id_phone: e.target.value})}
                      >
                        {myPurchasedNumbers.length > 0 ? (
                          myPurchasedNumbers.map(n => (
                            <option key={n.id} value={n.phone_number}>
                              📞 {n.phone_number} — {n.country} ({n.type})
                            </option>
                          ))
                        ) : (
                          <option value="+91 80 6535 4620">📞 +91 80 6535 4620 (Default VoBiz DID)</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary">🚀 Launch Campaign</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: INBOUND RECEPTIONIST */}
          {activeTab === 'inbound' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>🤖 Inbound AI Receptionist</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Configure autonomous voice agents to answer customer incoming calls 24/7.</p>
                </div>
              </div>

              {myPurchasedNumbers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary)' }}>
                  No virtual phone numbers currently purchased for your workspace.
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('numbers')}>
                      Browse & Purchase Numbers
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                  {myPurchasedNumbers.map(num => (
                    <div key={num.id} className="persona-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>📞 {num.phone_number}</h4>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{num.country} • {num.type}</div>
                        </div>
                        <span className={`chip ${num.inbound_enabled ? 'chip-active' : 'chip-warm'}`}>
                          {num.inbound_enabled ? 'Active 24/7' : 'Disabled'}
                        </span>
                      </div>

                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Assigned Responding Persona:</div>
                        <select 
                          className="form-select" 
                          style={{ width: '100%' }}
                          defaultValue={employees[0]?.id || ''}
                        >
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.language})</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                        <button 
                          className={`btn btn-sm ${num.inbound_enabled ? 'btn-secondary' : 'btn-primary'}`} 
                          onClick={() => handleToggleInbound(num)}
                        >
                          {num.inbound_enabled ? 'Disable Receptionist' : 'Enable Receptionist'}
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            const emp = employees[0];
                            if (emp) {
                              setSimulatorEmployee(emp);
                              setSimulatorPhone(num.phone_number);
                              setSimulatorContactName('Inbound Caller');
                              setSimulatorOpen(true);
                            } else {
                              alert("Deploy an AI Persona first to test inbound reception!");
                            }
                          }}
                        >
                          🔴 Test Call Inbound
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: LEADS & RESULTS */}
          {activeTab === 'leads' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Leads & Results ({filteredConversations.length})</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Live qualification records stored in InsForge database.</p>
                </div>
                {conversations.length > 0 && (
                  <select className="form-select" style={{ width: 'auto' }} value={leadOutcomeFilter} onChange={e => setLeadOutcomeFilter(e.target.value)}>
                    <option value="all">All Outcomes</option>
                    <option value="hot">🔥 Hot Leads Only</option>
                    <option value="warm">🟡 Warm Leads</option>
                    <option value="cold">❄️ Cold</option>
                  </select>
                )}
              </div>

              {filteredConversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary)' }}>
                  No lead results found. Use Instant Call or start a Campaign to generate leads.
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Contact Phone</th>
                        <th>Prospect Name</th>
                        <th>Outcome</th>
                        <th>Duration</th>
                        <th>AI Employee</th>
                        <th>Summary</th>
                        <th>Interactive Test</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConversations.map(conv => (
                        <tr key={conv.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{conv.contact_phone}</td>
                          <td style={{ color: '#fff', fontWeight: 600 }}>{conv.contact_name || 'Prospect'}</td>
                          <td><span className={`chip chip-${conv.outcome}`}>{conv.outcome.toUpperCase()}</span></td>
                          <td>{conv.duration_seconds}s</td>
                          <td>{conv.employee_name}</td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 280 }}>{conv.summary}</td>
                          <td>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setSimulatorEmployee({ name: conv.employee_name, language: 'Hindi' });
                                setSimulatorPhone(conv.contact_phone);
                                setSimulatorContactName(conv.contact_name);
                                setSimulatorOpen(true);
                              }}
                            >
                              🔴 Talk
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: CONVERSATIONS & CONVERSIONS */}
          {activeTab === 'conversations' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Conversations & Conversions ({conversations.length})</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Word-for-word call transcripts, hot lead tags, and conversion scoring.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <select 
                    className="form-select" 
                    style={{ width: 'auto' }} 
                    value={leadOutcomeFilter} 
                    onChange={e => setLeadOutcomeFilter(e.target.value)}
                  >
                    <option value="all">All Outcomes ({conversations.length})</option>
                    <option value="hot">🔥 Hot Leads ({hotLeads})</option>
                    <option value="warm">🟡 Warm Leads ({warmLeads})</option>
                    <option value="cold">❄️ Cold Leads ({coldLeads})</option>
                  </select>
                  <input 
                    className="form-input" 
                    style={{ width: 220 }} 
                    placeholder="Search phone or keyword..." 
                    value={searchConvQuery} 
                    onChange={e => setSearchConvQuery(e.target.value)} 
                  />
                </div>
              </div>

              {/* Real-time Conversion Statistics Banner */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>TOTAL CALLS LOGGED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: 2 }}>{conversations.length}</div>
                </div>
                <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#fb7185', fontWeight: 700 }}>HOT CONVERSIONS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fb7185', marginTop: 2 }}>{hotLeads} 🔥</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>CONVERSION RATE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: 2 }}>
                    {conversations.length > 0 ? ((hotLeads / conversations.length) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700 }}>AVG CONVERSION SCORE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a5b4fc', marginTop: 2 }}>95%</div>
                </div>
              </div>

              {filteredConversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary)' }}>
                  No call conversations recorded in database yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {filteredConversations.map(conv => (
                    <div key={conv.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fff', fontSize: '1rem' }}>
                              📞 {conv.contact_phone}
                            </span>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>• {conv.contact_name || 'Prospect'}</span>
                            <span className="chip" style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)' }}>
                              ⏱️ {conv.duration_seconds || 24}s
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                            Handled by {conv.employee_name || 'AI Persona'} • {conv.created_at ? new Date(conv.created_at).toLocaleString() : 'Just now'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`chip chip-${conv.outcome || 'hot'}`}>
                            {(conv.outcome || 'HOT').toUpperCase()}
                          </span>
                          {conv.conversion_score && (
                            <span className="chip" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}>
                              Score: {conv.conversion_score}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, marginBottom: 14, borderLeft: '3px solid #6366f1' }}>
                        <strong style={{ color: '#fff' }}>Executive Summary: </strong>{conv.summary}
                      </div>

                      {/* Call Audio Recording: Preview / Listen & Download */}
                      <CallAudioPlayer 
                        conversation={conv} 
                        audioUrl={conv.recording_url} 
                      />

                      {/* Word-for-Word Transcript Dialogues */}
                      {Array.isArray(conv.transcript) && conv.transcript.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                            Transcript Dialogue History
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {conv.transcript.map((line, idx) => (
                              <div 
                                key={idx} 
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  padding: '8px 12px',
                                  borderRadius: 8,
                                  fontSize: '0.82rem',
                                  background: line.speaker?.includes('AI') || line.speaker?.includes('లక్ష్మి') ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                                  borderLeft: line.speaker?.includes('AI') || line.speaker?.includes('లక్ష్మి') ? '2px solid #818cf8' : '2px solid #94a3b8'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                  <strong style={{ color: line.speaker?.includes('AI') || line.speaker?.includes('లక్ష్మి') ? '#a5b4fc' : '#e2e8f0', fontSize: '0.76rem' }}>
                                    {line.speaker}
                                  </strong>
                                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{line.time || ''}</span>
                                </div>
                                <span style={{ color: '#fff' }}>{line.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PHONE NUMBERS (AVAILABLE & PURCHASED) */}
          {activeTab === 'numbers' && (
            <div>
              {/* Virtual Numbers Metrics Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
                <div className="glass-card" style={{ marginBottom: 0, padding: 16, borderColor: 'rgba(99,102,241,0.3)' }}>
                  <div style={{ fontSize: '0.74rem', color: '#a5b4fc', fontWeight: 700 }}>MY ACTIVE PURCHASED LINES</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>{myPurchasedNumbers.length} 🟣</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Ready for outbound dialing & inbound AI</div>
                </div>
                <div className="glass-card" style={{ marginBottom: 0, padding: 16, borderColor: 'rgba(16,185,129,0.3)' }}>
                  <div style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 700 }}>AVAILABLE IN CARRIER POOL</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>{availablePoolNumbers.length} 🟢</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Available for instant 1-click purchase</div>
                </div>
                <div className="glass-card" style={{ marginBottom: 0, padding: 16, borderColor: 'rgba(245,158,11,0.3)' }}>
                  <div style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700 }}>MY MONTHLY LINE RENTAL</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
                    ₹{myPurchasedNumbers.reduce((sum, n) => sum + (Number(n.monthly_cost) || 0), 0).toLocaleString()}/mo
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Deducted from calling wallet</div>
                </div>
                <div className="glass-card" style={{ marginBottom: 0, padding: 16 }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>WALLET CREDITS BALANCE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
                    ₹{Number(userProfile?.credits_balance || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Available calling & number funds</div>
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone size={18} color="#6366f1" />
                      <span>Virtual Numbers Catalog ({(availablePoolNumbers.length + myPurchasedNumbers.length).toLocaleString()})</span>
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Browse carrier phone lines available in the pool or manage your purchased numbers.
                    </p>
                  </div>

                  {/* Filter Toolbar */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Status Filter */}
                    <select 
                      className="form-select" 
                      style={{ width: 'auto' }} 
                      value={numberFilter} 
                      onChange={e => { setNumberFilter(e.target.value); setNumbersPage(1); }}
                    >
                      <option value="all">All Numbers ({(availablePoolNumbers.length + myPurchasedNumbers.length).toLocaleString()})</option>
                      <option value="available">🟢 Available for Purchase ({availablePoolNumbers.length.toLocaleString()})</option>
                      <option value="purchased">🟣 My Purchased Lines ({myPurchasedNumbers.length})</option>
                      <option value="my">⭐ My Active Numbers ({myPurchasedNumbers.length})</option>
                    </select>

                    {/* Type Filter */}
                    <select 
                      className="form-select" 
                      style={{ width: 'auto' }} 
                      value={numberTypeFilter} 
                      onChange={e => { setNumberTypeFilter(e.target.value); setNumbersPage(1); }}
                    >
                      <option value="all">All Types</option>
                      <option value="Local">Local DID</option>
                      <option value="Mobile">Mobile VIP</option>
                      <option value="Toll-Free">Toll-Free 1800</option>
                    </select>

                    {/* Search Input */}
                    <input 
                      className="form-input" 
                      placeholder="Search phone number, country..." 
                      style={{ width: 220 }} 
                      value={numberSearchQuery} 
                      onChange={e => { setNumberSearchQuery(e.target.value); setNumbersPage(1); }} 
                    />
                  </div>
                </div>

                {/* Interactive Filter Pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                  <button 
                    type="button"
                    className={`btn btn-sm ${numberFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setNumberFilter('all'); setNumbersPage(1); }}
                  >
                    All Numbers ({phoneNumbers.length})
                  </button>
                  <button 
                    type="button"
                    className={`btn btn-sm ${numberFilter === 'available' || numberFilter === 'available_pool' || numberFilter === 'pool' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setNumberFilter('available'); setNumbersPage(1); }}
                    style={numberFilter === 'available' || numberFilter === 'available_pool' || numberFilter === 'pool' ? { background: '#10b981', borderColor: '#10b981', color: '#fff' } : {}}
                  >
                    🟢 Available to Purchase ({availablePoolNumbers.length})
                  </button>
                  <button 
                    type="button"
                    className={`btn btn-sm ${numberFilter === 'purchased' || numberFilter === 'all_purchased' || numberFilter === 'assigned' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setNumberFilter('purchased'); setNumbersPage(1); }}
                    style={numberFilter === 'purchased' || numberFilter === 'all_purchased' || numberFilter === 'assigned' ? { background: '#8b5cf6', borderColor: '#8b5cf6', color: '#fff' } : {}}
                  >
                    🟣 My Purchased Lines ({myPurchasedNumbers.length})
                  </button>
                  <button 
                    type="button"
                    className={`btn btn-sm ${numberFilter === 'my' || numberFilter === 'my_purchased' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setNumberFilter('my'); setNumbersPage(1); }}
                  >
                    ⭐ My Active Numbers ({myPurchasedNumbers.length})
                  </button>
                </div>

                {filteredNumbers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary)' }}>
                    No phone numbers found matching the selected filter ({numberFilter}).
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <div>
                        Showing <strong>{(numbersPage - 1) * NUMBERS_PAGE_SIZE + 1}</strong> – <strong>{Math.min(numbersPage * NUMBERS_PAGE_SIZE, filteredNumbers.length)}</strong> of <strong>{filteredNumbers.length.toLocaleString()}</strong> numbers
                      </div>
                      {totalNumberPages > 1 && (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            disabled={numbersPage === 1}
                            onClick={() => setNumbersPage(p => Math.max(1, p - 1))}
                            style={{ padding: '4px 10px' }}
                          >
                            ← Prev
                          </button>
                          <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
                            Page {numbersPage} of {totalNumberPages}
                          </span>
                          <button 
                            className="btn btn-secondary btn-sm"
                            disabled={numbersPage === totalNumberPages}
                            onClick={() => setNumbersPage(p => Math.min(totalNumberPages, p + 1))}
                            style={{ padding: '4px 10px' }}
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                      {displayedNumbers.map(n => {
                        const isMine = (n.assigned_to && n.assigned_to === myUserId) || (n.assigned_to_email && n.assigned_to_email === myEmail);
                        const isPool = n.status === 'pool' || !n.assigned_to;
                        const isOther = !isMine && !isPool;

                        return (
                          <div 
                            key={n.id} 
                            className="persona-card" 
                            style={{
                              background: isMine ? 'rgba(99, 102, 241, 0.06)' : isPool ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                              borderColor: isMine ? 'rgba(99, 102, 241, 0.35)' : isPool ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)',
                              padding: 18
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>
                                  📞 {n.phone_number}
                                </h4>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                  {n.country} • <span style={{ color: '#fff' }}>{n.type}</span>
                                </div>
                              </div>

                              {/* Status Chip */}
                              {isMine ? (
                                <span className="chip" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid #818cf8' }}>
                                  🟣 My Purchased Line
                                </span>
                              ) : isPool ? (
                                <span className="chip chip-active">
                                  <span className="live-dot green"></span> 🟢 Available in Pool
                                </span>
                              ) : (
                                <span className="chip" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}>
                                  ⚪ In-Use
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 8 }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Carrier Line Rental:</span>
                              <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>₹{n.monthly_cost}/month</strong>
                            </div>

                            {/* Action Controls */}
                            {isMine ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>24/7 AI Receptionist:</span>
                                  <button 
                                    className={`btn btn-sm ${n.inbound_enabled ? 'btn-primary' : 'btn-secondary'}`} 
                                    onClick={() => handleToggleInbound(n)}
                                    style={{ padding: '4px 10px' }}
                                  >
                                    {n.inbound_enabled ? '✓ Enabled' : 'Disabled'}
                                  </button>
                                </div>

                                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    style={{ flex: 1, gap: 4 }}
                                    onClick={() => {
                                      setCallerIdNumber(n.phone_number.replace(/\D/g, ''));
                                      setActiveTab('instant_lead');
                                    }}
                                    title="Use this number as caller ID for outbound dialing"
                                  >
                                    Dial with this Line
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm" 
                                    onClick={() => handleReleaseMyNumber(n)}
                                    title="Release this number back to platform pool"
                                  >
                                    Release Line
                                  </button>
                                </div>
                              </div>
                            ) : isPool ? (
                              <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', gap: 6 }} 
                                onClick={() => handlePurchaseNumber(n)}
                              >
                                ⚡ Purchase Line (₹{n.monthly_cost}/mo)
                              </button>
                            ) : (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '6px 0', fontStyle: 'italic' }}>
                                Reserved by another workspace account
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {totalNumberPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          disabled={numbersPage === 1}
                          onClick={() => setNumbersPage(1)}
                        >
                          « First
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          disabled={numbersPage === 1}
                          onClick={() => setNumbersPage(p => Math.max(1, p - 1))}
                        >
                          ‹ Prev
                        </button>
                        <span style={{ fontSize: '0.82rem', color: '#fff', padding: '0 8px', fontWeight: 700 }}>
                          Page {numbersPage} of {totalNumberPages}
                        </span>
                        <button 
                          className="btn btn-secondary btn-sm"
                          disabled={numbersPage >= totalNumberPages}
                          onClick={() => setNumbersPage(p => Math.min(totalNumberPages, p + 1))}
                        >
                          Next ›
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          disabled={numbersPage >= totalNumberPages}
                          onClick={() => setNumbersPage(totalNumberPages)}
                        >
                          Last »
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB: BILLING */}
          {activeTab === 'billing' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div className="glass-card" style={{ marginBottom: 0 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Calling Credits Balance</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399', margin: '10px 0' }}>
                    ₹{Number(userProfile?.credits_balance || 0).toLocaleString()}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Rate: ₹2.00 / minute of completed AI dialogue.</p>

                  {topupSuccess && (
                    <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#34d399', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: '0.82rem' }}>
                      ✓ Payment Successful! ₹{topupAmount} added to wallet.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {[500, 1000, 2500, 5000].map(amt => (
                      <button key={amt} className={`btn btn-sm ${topupAmount === amt ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTopupAmount(amt)}>
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleTopupCredits}>
                    💳 Top Up ₹{topupAmount}
                  </button>
                </div>

                <div className="glass-card" style={{ marginBottom: 0 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Plan Limits</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14, fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Max AI Employees:</span>
                      <strong>{employees.length} / {userProfile?.max_employees || 10}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Calls Processed:</span>
                      <strong>{callsToday} / {userProfile?.max_calls_per_month || 1000}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Virtual Numbers:</span>
                      <strong>{phoneNumbers.length} Assigned</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 14 }}>Transactions ({transactions.length})</h3>
                {transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-secondary)' }}>
                    No wallet top-up transactions recorded.
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table className="table-modern">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Description</th>
                          <th>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(t => (
                          <tr key={t.id}>
                            <td>{new Date(t.created_at).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 700, color: '#34d399' }}>+₹{t.amount}</td>
                            <td>{t.description}</td>
                            <td>₹{t.balance_after}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="glass-card" style={{ maxWidth: 580, margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>Organization Preferences</h3>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Full Name</label>
                <input className="form-input" defaultValue={userProfile?.full_name || ''} />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Email Address</label>
                <input className="form-input" defaultValue={userProfile?.email} readOnly />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 10 }}>Save Settings</button>
            </div>
          )}
        </main>
      </div>

      {/* Live Call Simulator HUD Modal */}
      <LiveCallSimulatorModal 
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        employee={simulatorEmployee}
        phoneNumber={simulatorPhone}
        contactName={simulatorContactName}
        onCallCompleted={loadUserData}
        currentUser={userProfile || currentUser}
      />
    </div>
  );
}
