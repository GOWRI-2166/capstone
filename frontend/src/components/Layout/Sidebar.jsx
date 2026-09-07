import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Bot, 
  PlugZap, 
  Globe, 
  ShieldAlert, 
  History, 
  BarChart3, 
  Settings2,
  Server,
  User,
  LogOut
} from 'lucide-react';

export function Sidebar({ 
  currentTab, 
  onSelectTab, 
  serverOnline, 
  threatCount = 0, 
  agentCount = 5,
  user,
  onLogout
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agents', label: 'Protected Agents', icon: Bot, badge: agentCount ? `${agentCount}` : null },
    { id: 'connect', label: 'Connect Agent', icon: PlugZap },
    { id: 'website_activity', label: 'Website Activity', icon: Globe },
    { id: 'threats', label: 'Security Alerts', icon: ShieldAlert, badge: threatCount ? `${threatCount}` : null, badgeColor: '#ef4444' },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Security Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Guardrail Configuration', icon: Settings2 },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-shield">
          <Shield size={20} color="#06b6d4" />
        </div>
        <div className="logo-text">
          <h1>AI GUARDRAIL</h1>
          <span>Universal Agent Security</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-section-title">CONTROL CENTER</div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '11px',
                  background: item.badgeColor ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  color: item.badgeColor || 'var(--text-secondary)',
                  border: item.badgeColor ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {/* User Card in Sidebar */}
        {user && (
          <div className="sidebar-user-card" onClick={() => onSelectTab('profile')}>
            <div className="user-mini-avatar">
              <User size={16} />
            </div>
            <div className="user-mini-info">
              <span className="user-mini-name">{user.name || 'Security Lead'}</span>
              <span className="user-mini-email">{user.email || 'security@guardrail.ai'}</span>
            </div>
            <button 
              className="user-mini-logout"
              title="Sign Out"
              onClick={(e) => {
                e.stopPropagation();
                if (onLogout) onLogout();
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        <div className="guardrail-status-pill">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="pulse-dot" style={{ backgroundColor: serverOnline ? '#10b981' : '#f59e0b' }}></div>
            <span>{serverOnline ? 'GUARDRAIL: ACTIVE' : 'STANDBY FALLBACK'}</span>
          </div>
          <Server size={14} />
        </div>
      </div>
    </aside>
  );
}
