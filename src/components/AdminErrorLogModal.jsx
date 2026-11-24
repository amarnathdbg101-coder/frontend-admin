import React, { useState, useEffect } from 'react';
import { 
  X, 
  Terminal, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  Copy, 
  Check, 
  Trash2, 
  Activity, 
  Cpu, 
  Database, 
  Clock 
} from 'lucide-react';
import { adminApi } from '../api/admin.api';

export const AdminErrorLogModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('metrics'); // 'metrics' | 'errors'

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
    }
  }, [isOpen]);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const [errorsData, metricsData] = await Promise.all([
        adminApi.getErrors().catch(() => []),
        adminApi.getPerformanceMetrics().catch(() => null),
      ]);
      setLogs(Array.isArray(errorsData) ? errorsData : []);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to purge all active 24-hour error logs?')) return;
    setClearing(true);
    try {
      await adminApi.clearErrors();
      setLogs([]);
    } catch (err) {
      alert('Failed to clear errors: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  const handleCopy = () => {
    let text = `=== SHOPSILO LIVE CLUSTER TELEMETRY ===\n`;
    if (metrics) {
      text += `Status: ${metrics.server_status}\n`;
      text += `Uptime: ${metrics.uptime_seconds}s\n`;
      text += `RAM Allocated: ${metrics.go_runtime?.allocated_memory_mb} MB (Sys: ${metrics.go_runtime?.system_memory_mb} MB)\n`;
      text += `Active Goroutines: ${metrics.go_runtime?.active_goroutines}\n`;
      text += `DB Connections: ${metrics.database?.total_connections} (Idle: ${metrics.database?.idle_connections}, Max: ${metrics.database?.max_connections})\n\n`;
    }
    text += `=== 24-HOUR ERROR TRACES (${logs.length}) ===\n`;
    logs.forEach((l, idx) => {
      text += `[#${idx + 1}] [${l.created_at}] [${l.error_code || 'ERROR'}] [${l.request_path || 'N/A'}]\nMsg: ${l.user_friendly_msg}\nTrace: ${l.developer_stack_trace}\n---\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
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
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '8px', borderRadius: '10px' }}>
              <Terminal size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', fontWeight: '700' }}>Live Cluster Telemetry &amp; Error Vault</h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time Go Runtime, DB Pool &amp; 24h Exception Tracker</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Controls & Actions */}
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveSubTab('metrics')}
              style={{
                background: activeSubTab === 'metrics' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: activeSubTab === 'metrics' ? '#60a5fa' : '#94a3b8',
                border: activeSubTab === 'metrics' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Activity size={14} />
              <span>Go Runtime Metrics</span>
            </button>

            <button
              onClick={() => setActiveSubTab('errors')}
              style={{
                background: activeSubTab === 'errors' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                color: activeSubTab === 'errors' ? '#f87171' : '#94a3b8',
                border: activeSubTab === 'errors' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertTriangle size={14} />
              <span>24h Exceptions ({logs.length})</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleCopy}
              style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {copied ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {activeSubTab === 'errors' && logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                disabled={clearing}
                style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem 1.5rem', flex: 1, overflowY: 'auto' }}>
          {activeSubTab === 'metrics' && (
            <div>
              {metrics ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '700', fontSize: '0.9rem' }}>
                      <ShieldCheck size={18} />
                      <span>{metrics.server_status}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Server Uptime: <strong>{Math.floor(metrics.uptime_seconds / 60)}m {metrics.uptime_seconds % 60}s</strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px' }}>
                        <Cpu size={16} /> Go Runtime RAM
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#f8fafc' }}>
                        {metrics.go_runtime?.allocated_memory_mb} MB
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Sys RAM: {metrics.go_runtime?.system_memory_mb} MB • GC: {metrics.go_runtime?.gc_cycles} cycles
                      </div>
                    </div>

                    <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px' }}>
                        <Activity size={16} /> Active Goroutines
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#f8fafc' }}>
                        {metrics.go_runtime?.active_goroutines}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Non-blocking concurrency pool
                      </div>
                    </div>

                    <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px' }}>
                        <Database size={16} /> PostgreSQL Pool
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#f8fafc' }}>
                        {metrics.database?.total_connections} / {metrics.database?.max_connections}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Idle: {metrics.database?.idle_connections} • Acquires: {metrics.database?.acquire_count}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                      Subsystem Health
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <div>AI Cache Hit Rate: <strong style={{ color: '#10b981' }}>{metrics.ai_engine?.cache_hit_rate_pct}%</strong></div>
                      <div>Avg AI Latency: <strong style={{ color: '#60a5fa' }}>{metrics.ai_engine?.avg_response_time_ms}ms</strong></div>
                      <div>PDF Worker Pool: <strong style={{ color: '#cbd5e1' }}>{metrics.pdf_engine?.max_workers} max ({metrics.pdf_engine?.active_workers} active)</strong></div>
                      <div>24h Errors Logged: <strong style={{ color: metrics.active_errors_24h > 0 ? '#f87171' : '#10b981' }}>{metrics.active_errors_24h}</strong></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  {loading ? 'Fetching cluster performance telemetry...' : 'Telemetry unavailable.'}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'errors' && (
            <div>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <ShieldCheck size={42} style={{ margin: '0 auto 12px', color: '#10b981', opacity: 0.8 }} />
                  <h4 style={{ margin: '0 0 6px', color: '#f8fafc', fontSize: '1rem' }}>Zero Unhandled Exceptions</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    The 24-hour error vault contains no active unhandled exceptions. All services are operating stably.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {logs.map((errItem) => (
                    <div
                      key={errItem.id}
                      style={{
                        background: '#020617',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '0.72rem' }}>
                            {errItem.error_code || 'ERROR'}
                          </span>
                          <span style={{ color: '#cbd5e1', fontWeight: '600' }}>
                            {errItem.request_path || 'Internal'}
                          </span>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                          {new Date(errItem.created_at).toLocaleTimeString()}
                        </span>
                      </div>

                      <div style={{ color: '#fca5a5', marginBottom: '6px' }}>
                        {errItem.user_friendly_msg}
                      </div>

                      {errItem.developer_stack_trace && (
                        <pre style={{
                          margin: 0,
                          background: '#090d16',
                          padding: '8px',
                          borderRadius: '6px',
                          color: '#94a3b8',
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          overflowX: 'auto',
                          maxHeight: '120px',
                        }}>
                          {errItem.developer_stack_trace}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
