import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';

// 8 Dedicated Pages Requested by User
import { DashboardPage } from './pages/DashboardPage';
import { MyAgentsPage } from './pages/MyAgentsPage';
import { ConnectAgentPage } from './pages/ConnectAgentPage';
import { WebsiteActivityPage } from './pages/WebsiteActivityPage';
import { ThreatsPage } from './pages/ThreatsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

import { fetchHealth, fetchDashboardStats, fetchAgents } from './services/api';
import { ShieldAlert, CheckCircle, X } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [serverOnline, setServerOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [initialSelectedThreat, setInitialSelectedThreat] = useState(null);
  const [toast, setToast] = useState(null);

  // Load telemetry data from backend
  const loadPlatformData = async () => {
    try {
      const [h, s, a] = await Promise.all([
        fetchHealth(),
        fetchDashboardStats(),
        fetchAgents()
      ]);
      setServerOnline(h.status === 'ok');
      setStats(s);
      setAgents(a || []);
    } catch (err) {
      setServerOnline(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
    const interval = setInterval(loadPlatformData, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadPlatformData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleEventSimulated = (eventResult) => {
    loadPlatformData();
    const isBlocked = eventResult.decision === 'BLOCK';
    setToast({
      type: isBlocked ? 'danger' : 'success',
      title: isBlocked ? 'Security Threat Blocked!' : 'Safe Agent Event Cleared',
      message: isBlocked 
        ? `Neutralized ${eventResult.attack_type || 'Malicious Payload'} from ${eventResult.url || 'external source'}.`
        : `Verified clean traffic from ${eventResult.url || 'external resource'}.`
    });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSelectThreatFromDashboard = (threat) => {
    setInitialSelectedThreat(threat);
    setCurrentTab('threats');
  };

  const getPageMeta = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Executive Security Dashboard',
          subtitle: 'Central operations center for monitoring AI agent traffic and neutralizing threats in real time'
        };
      case 'agents':
        return {
          title: 'My Protected Agents',
          subtitle: 'Manage connected autonomous AI agents, monitoring status, and protection boundaries'
        };
      case 'connect':
        return {
          title: 'Connect AI Agent',
          subtitle: 'Developer integration hub: Python SDK, REST API endpoints, API keys, and code guides'
        };
      case 'website_activity':
        return {
          title: 'Website & External Resource Activity',
          subtitle: 'Real-time inspection of external websites, scraped DOM, and 3rd-party APIs accessed by agents'
        };
      case 'threats':
        return {
          title: 'Detected Security Threats & Forensics',
          subtitle: 'Incident response center: detailed threat taxonomy, attack payloads, and mitigation advice'
        };
      case 'history':
        return {
          title: 'Complete Audit Log History',
          subtitle: 'Immutable ledger of all verified, allowed, warned, and blocked agent transactions'
        };
      case 'analytics':
        return {
          title: 'Cybersecurity Analytics & Intelligence',
          subtitle: 'Threat categories, targeted external websites, and attack frequency distributions'
        };
      case 'settings':
        return {
          title: 'Guardrail Policies & Security Settings',
          subtitle: 'Configure active scanning engines, enforcement mode (Automatic Block vs Warning), and risk thresholds'
        };
      default:
        return { title: 'Universal AI Guardrail', subtitle: 'Cybersecurity Operations' };
    }
  };

  const { title, subtitle } = getPageMeta();

  return (
    <div className="app-container">
      {/* Left Navigation Bar with exact 8 pages */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setInitialSelectedThreat(null);
          setCurrentTab(tab);
        }}
        serverOnline={serverOnline}
        threatCount={stats?.blocked_threats_count || 0}
        agentCount={agents.length}
      />

      {/* Main Content Layout */}
      <div className="main-layout">
        <Header 
          title={title} 
          subtitle={subtitle}
          onRefresh={handleManualRefresh}
          refreshing={refreshing}
          onEventSimulated={handleEventSimulated}
        />

        {/* Global Alert Toast */}
        {toast && (
          <div className={`global-toast ${toast.type}`}>
            {toast.type === 'danger' ? <ShieldAlert size={18} color="#ef4444" /> : <CheckCircle size={18} color="#10b981" />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>{toast.title}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{toast.message}</div>
            </div>
            <button className="toast-close" onClick={() => setToast(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        <main>
          {currentTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              onNavigateToWebsiteActivity={() => setCurrentTab('website_activity')}
              onNavigateToThreats={() => setCurrentTab('threats')}
              onNavigateToAgents={() => setCurrentTab('agents')}
              onSelectThreat={handleSelectThreatFromDashboard}
            />
          )}

          {currentTab === 'agents' && (
            <MyAgentsPage 
              agents={agents}
              onRefresh={loadPlatformData}
              onNavigateToConnect={() => setCurrentTab('connect')}
            />
          )}

          {currentTab === 'connect' && (
            <ConnectAgentPage 
              onEventSimulated={handleEventSimulated}
            />
          )}

          {currentTab === 'website_activity' && (
            <WebsiteActivityPage 
              onSelectThreat={handleSelectThreatFromDashboard}
            />
          )}

          {currentTab === 'threats' && (
            <ThreatsPage 
              initialSelectedThreat={initialSelectedThreat}
              onClearInitialThreat={() => setInitialSelectedThreat(null)}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage />
          )}

          {currentTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
