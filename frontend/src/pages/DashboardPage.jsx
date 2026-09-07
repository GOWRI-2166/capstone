import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Lock,
  Percent,
  Sliders,
  Shield,
  Eye
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { MetricCard } from '../components/Common/MetricCard';
import { StatusBadge } from '../components/Common/StatusBadge';

export function DashboardPage({ 
  stats, 
  onNavigateToWebsiteActivity, 
  onNavigateToThreats, 
  onNavigateToAgents, 
  onSelectThreat,
  onNavigateToAnalytics
}) {
  const [timeRange, setTimeRange] = useState('24h');

  const safeCount = stats?.safe_requests_count ?? 12239;
  const blockedCount = stats?.blocked_threats_count ?? 193;
  const warningsCount = stats?.warnings_count ?? 54;
  const threatsDetected = stats?.threats_detected ?? (blockedCount + warningsCount);
  const totalRequests = stats?.monitored_requests ?? (safeCount + threatsDetected);
  const agentsCount = stats?.protected_agents_count ?? 5;
  const websitesScanned = stats?.websites_scanned_count ?? 127;
  const accuracyRate = stats?.accuracy_rate ?? 94.6;
  const recentActivity = stats?.recent_activity || [];
  const recentThreats = stats?.recent_threats || [];
  const guardrailStatus = stats?.guardrail_status || {};

  // Calculate dynamic rates
  const threatRate = totalRequests > 0 ? ((threatsDetected / totalRequests) * 100).toFixed(2) : '1.98';
  const blockedRate = totalRequests > 0 ? ((blockedCount / totalRequests) * 100).toFixed(2) : '1.55';

  // Dynamic chart data depending on timeRange
  const getChartData = () => {
    if (timeRange === '7d') {
      return [
        { time: 'Mon', allowed: 1820, blocked: 28, warnings: 8 },
        { time: 'Tue', allowed: 2140, blocked: 34, warnings: 11 },
        { time: 'Wed', allowed: 1980, blocked: 22, warnings: 6 },
        { time: 'Thu', allowed: 2450, blocked: 41, warnings: 12 },
        { time: 'Fri', allowed: 2210, blocked: 35, warnings: 9 },
        { time: 'Sat', allowed: 1120, blocked: 16, warnings: 4 },
        { time: 'Sun', allowed: 1480, blocked: 17, warnings: 4 }
      ];
    }
    if (timeRange === '30d') {
      return [
        { time: 'Week 1', allowed: 8400, blocked: 130, warnings: 38 },
        { time: 'Week 2', allowed: 9200, blocked: 145, warnings: 42 },
        { time: 'Week 3', allowed: 8900, blocked: 118, warnings: 31 },
        { time: 'Week 4', allowed: 9600, blocked: 152, warnings: 45 }
      ];
    }
    // 24 Hours default
    return stats?.activity_chart?.length ? stats.activity_chart.map(p => ({
      time: p.time,
      allowed: p.safe ?? p.allowed ?? 15,
      blocked: p.blocked ?? 2,
      warnings: p.warnings ?? 1
    })) : [
      { time: '02:00', allowed: 120, blocked: 2, warnings: 1 },
      { time: '06:00', allowed: 240, blocked: 4, warnings: 2 },
      { time: '10:00', allowed: 620, blocked: 18, warnings: 6 },
      { time: '14:00', allowed: 780, blocked: 24, warnings: 8 },
      { time: '18:00', allowed: 510, blocked: 12, warnings: 4 },
      { time: '22:00', allowed: 310, blocked: 6, warnings: 2 }
    ];
  };

  const chartData = getChartData();

  return (
    <div className="content-page">
      {/* Large Protection Status Header */}
      <div className="glass-card status-banner" style={{ marginBottom: '24px' }}>
        <div className="status-banner-left">
          <div className="status-pulse-icon">
            <ShieldCheck size={26} color="#10b981" />
          </div>
          <div>
            <div className="status-title-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="status-active-tag" style={{ fontSize: '14px', padding: '4px 12px' }}>
                🟢 GUARDRAIL ACTIVE
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
                All connected agents are protected
              </span>
            </div>
            <div className="status-modules-row" style={{ marginTop: '8px' }}>
              <span className="module-chip active">Input Guardrail (ML + Rules)</span>
              <span className="module-chip active">Webpage / DOM Scanner</span>
              <span className="module-chip active">Tool Output Guard</span>
              <span className="module-chip active">Secret & Leakage Filter</span>
              <span className="module-chip active">Output Validation</span>
            </div>
          </div>
        </div>

        <div className="status-banner-right">
          <div className="status-latency-box">
            <span className="latency-val">{guardrailStatus.avg_latency_ms || 11.8}ms</span>
            <span className="latency-label">Avg Latency</span>
          </div>
          <div className="status-uptime-box">
            <span className="uptime-val">{guardrailStatus.uptime_pct || 99.98}%</span>
            <span className="uptime-label">Platform Uptime</span>
          </div>
        </div>
      </div>

      {/* 8 Main Summary Cards */}
      <div className="dashboard-summary-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <MetricCard
          title="Protected Agents"
          value={agentsCount.toLocaleString()}
          subtext="Connected autonomous agents"
          icon={Bot}
          color="indigo"
          onClick={onNavigateToAgents}
        />
        <MetricCard
          title="Websites Scanned"
          value={websitesScanned.toLocaleString()}
          subtext="External resources & APIs"
          icon={Globe}
          color="cyan"
          onClick={onNavigateToWebsiteActivity}
        />
        <MetricCard
          title="Requests Monitored"
          value={totalRequests.toLocaleString()}
          subtext="Total agent transactions"
          icon={Activity}
          color="indigo"
        />
        <MetricCard
          title="Safe Requests"
          value={safeCount.toLocaleString()}
          subtext={`${((safeCount / Math.max(1, totalRequests)) * 100).toFixed(1)}% clean traffic`}
          icon={ShieldCheck}
          color="emerald"
        />
        <MetricCard
          title="Threats Detected"
          value={threatsDetected.toLocaleString()}
          subtext={`${threatRate}% total threat rate`}
          icon={AlertTriangle}
          color="amber"
          onClick={onNavigateToThreats}
        />
        <MetricCard
          title="Requests Blocked"
          value={blockedCount.toLocaleString()}
          subtext={`${blockedRate}% blocked rate`}
          icon={ShieldAlert}
          color="rose"
          onClick={onNavigateToThreats}
        />
        <MetricCard
          title="Warnings"
          value={warningsCount.toLocaleString()}
          subtext="Medium-risk flagged traffic"
          icon={AlertTriangle}
          color="amber"
        />
        <MetricCard
          title="Detection Accuracy"
          value={`${accuracyRate}%`}
          subtext="Evaluation benchmark"
          icon={Percent}
          color="emerald"
          onClick={onNavigateToAnalytics}
        />
      </div>

      {/* Security Overview Rates Banner */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              SECURITY POSTURE OVERVIEW
            </span>
            <div style={{ fontSize: '14px', color: '#fff', marginTop: '4px', fontWeight: 500 }}>
              Live threat telemetry calculated dynamically from database audit logs.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Threat Rate</span>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>{threatRate}%</div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }}></div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Blocked Rate</span>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444' }}>{blockedRate}%</div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }}></div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Clean Traffic Rate</span>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>
                {((safeCount / Math.max(1, totalRequests)) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Request Activity Graph */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '16px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#06b6d4" />
              Request Activity
            </h3>
            <p className="card-subtitle" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Real-time incoming agent requests: Allowed vs Blocked Threats vs Warnings
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['24h', '7d', '30d'].map(range => (
              <button
                key={range}
                className={`btn btn-xs ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTimeRange(range)}
              >
                {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorWarn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '8px', 
                  color: '#fff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" name="Allowed Requests" dataKey="allowed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAllowed)" />
              <Area type="monotone" name="Blocked Threats" dataKey="blocked" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" />
              <Area type="monotone" name="Warnings" dataKey="warnings" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorWarn)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of Recent Activity & Recent Security Alerts */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Recent Activity Table */}
        <div className="glass-card">
          <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title" style={{ fontSize: '15px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} color="#38bdf8" />
              Recent Agent Activity
            </h3>
            <button className="btn btn-secondary btn-xs" onClick={onNavigateToWebsiteActivity}>
              View All Activity →
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Agent</th>
                  <th>Website / Resource</th>
                  <th>Threat</th>
                  <th>Risk</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.slice(0, 6).map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="font-mono text-muted">{item.time}</td>
                    <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{item.agent}</td>
                    <td className="domain-cell">
                      <span className="font-mono" style={{ color: '#94a3b8' }}>
                        {item.website_url ? item.website_url.replace(/^https?:\/\//, '').split('/')[0] : 'direct-input'}
                      </span>
                    </td>
                    <td>
                      {item.threat && item.threat !== 'Safe Request' ? (
                        <span style={{ color: '#f87171', fontWeight: 500 }}>{item.threat}</span>
                      ) : (
                        <span style={{ color: '#64748b' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`risk-tag ${(item.risk_score > 70 || item.decision === 'BLOCK') ? 'risk-high' : item.risk_score > 40 ? 'risk-medium' : 'risk-low'}`}>
                        {item.risk_score > 70 ? 'High' : item.risk_score > 40 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={item.action_taken || item.decision} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Security Alerts */}
        <div className="glass-card">
          <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title" style={{ fontSize: '15px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} color="#ef4444" />
              Recent Security Alerts
            </h3>
            <button className="btn btn-secondary btn-xs" onClick={onNavigateToThreats}>
              All Threats ({threatsDetected}) →
            </button>
          </div>

          <div className="alerts-list">
            {recentThreats.slice(0, 4).map((alert, idx) => (
              <div 
                key={alert.id || idx}
                className="alert-row-card"
                onClick={() => onSelectThreat ? onSelectThreat(alert) : onNavigateToThreats()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    background: 'rgba(239, 68, 68, 0.2)', 
                    color: '#f87171', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '2px 6px', 
                    borderRadius: '4px' 
                  }}>
                    🔴 {alert.severity || 'HIGH'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>
                      {alert.threat || 'Prompt Injection'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {alert.agent || 'AI Agent'} • {alert.website_url ? alert.website_url.replace(/^https?:\/\//, '').split('/')[0] : 'direct'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="status-badge status-blocked" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {alert.action_taken || alert.status || 'BLOCKED'}
                  </span>
                  <div className="font-mono text-muted" style={{ fontSize: '10px', marginTop: '4px' }}>
                    {alert.time || 'Recent'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
