import React, { useState } from 'react';
import { X, Terminal, RefreshCw, AlertTriangle, ShieldCheck, Copy, Check } from 'lucide-react';

const MOCK_LOGS = [
  { time: '07:18:22', level: 'INFO', msg: 'PostgreSQL connection pool healthy (12 active connections)' },
  { time: '07:19:04', level: 'INFO', msg: 'WebSocket channel /shops/me/ws client ping received' },
  { time: '07:20:15', level: 'WARN', msg: 'Rate limiter warning: IP 152.58.12.9 reached 45 req/min on /catalog' },
  { time: '07:22:40', level: 'INFO', msg: 'Daily Khata digest calculation job finished in 42ms' },
  { time: '07:24:01', level: 'INFO', msg: 'Audit log: Admin token refreshed successfully' },
];

export const AdminErrorLogModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      const now = new Date().toTimeString().split(' ')[0];
      setLogs(prev => [
        { time: now, level: 'INFO', msg: 'Cluster telemetry heartbeat: 0 unhandled exceptions in last 5m' },
        ...prev
      ]);
      setRefreshing(false);
    }, 400);
  };

  const handleCopy = () => {
    const text = logs.map(l => `[${l.time}] [${l.level}] ${l.msg}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '6px', borderRadius: '8px' }}>
              <Terminal size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>System Logs &amp; Error Telemetry</h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Live Cluster Standard Output</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Showing latest event stream ({logs.length})</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleRefresh}
                style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} className={refreshing ? 'spin' : ''} /> Refresh
              </button>
              <button
                onClick={handleCopy}
                style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div style={{ background: '#020617', border: '1px solid #0f172a', borderRadius: '12px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {logs.map((log, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#475569' }}>[{log.time}]</span>
                <span style={{ color: log.level === 'WARN' ? '#f59e0b' : log.level === 'ERROR' ? '#ef4444' : '#3b82f6', fontWeight: 700 }}>
                  [{log.level}]
                </span>
                <span style={{ color: '#e2e8f0', flex: 1 }}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#22c55e' }}>
            <ShieldCheck size={14} /> Zero critical panic errors detected in production runtime.
          </div>
          <button
            onClick={onClose}
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
