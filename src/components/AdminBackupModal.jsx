import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  HardDrive, 
  Clock, 
  FileArchive 
} from 'lucide-react';
import { adminApi } from '../api/admin.api';

export const AdminBackupModal = ({ isOpen, onClose }) => {
  const [backingUp, setBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [backupMeta, setBackupMeta] = useState(null);
  const [existingBackups, setExistingBackups] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchBackupsList();
    }
  }, [isOpen]);

  const fetchBackupsList = async () => {
    setLoadingList(true);
    setErrorMsg('');
    try {
      const list = await adminApi.getBackups();
      setExistingBackups(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not fetch backups list:', err.message);
    } finally {
      setLoadingList(false);
    }
  };

  const handleTriggerBackup = async () => {
    setBackingUp(true);
    setBackupSuccess(false);
    setErrorMsg('');
    try {
      const meta = await adminApi.triggerBackup();
      setBackupMeta(meta);
      setBackupSuccess(true);
      await fetchBackupsList();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to trigger cloud database snapshot');
    } finally {
      setBackingUp(false);
    }
  };

  if (!isOpen) return null;

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '8px', borderRadius: '10px' }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', fontWeight: '700' }}>PostgreSQL Cluster Backup</h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Point-in-Time Snapshot &amp; Cloudflare R2 Archive</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', flex: 1, overflowY: 'auto' }}>
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {backupSuccess && backupMeta && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '18px', textAlign: 'center' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ margin: '0 0 4px', color: '#f8fafc', fontSize: '1rem' }}>Cloud Snapshot Generated</h4>
              <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: '#94a3b8' }}>
                File: <strong>{backupMeta.filename}</strong> ({formatBytes(backupMeta.size_bytes)})
              </p>

              {backupMeta.tables_included && (
                <div style={{ background: '#020617', padding: '8px 12px', borderRadius: '8px', fontSize: '0.72rem', color: '#cbd5e1', textAlign: 'left', marginBottom: '12px' }}>
                  <strong>Tables Dumped:</strong> {backupMeta.tables_included.join(', ')}
                </div>
              )}

              {backupMeta.public_url && (
                <a
                  href={backupMeta.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  <Download size={14} />
                  <span>Download Snapshot Archive</span>
                </a>
              )}
            </div>
          )}

          <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>
              <ShieldCheck size={16} /> Automated Multi-Region Snapshot Protection
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>
              Database backups are encrypted at rest with AES-256 and stored in high-durability S3/R2 storage. Snapshots include all Users, Shops, Inventory, POS Bills, Khata Ledgers, and Master Catalog products.
            </p>
          </div>

          <button
            onClick={handleTriggerBackup}
            disabled={backingUp}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem', marginBottom: '18px' }}
          >
            {backingUp ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Exporting Database Tables &amp; Compressing...</span>
              </>
            ) : (
              <>
                <HardDrive size={16} />
                <span>Trigger Instant Database Snapshot</span>
              </>
            )}
          </button>

          {/* Existing Archives */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
                Recent Cloud Snapshots ({existingBackups.length})
              </span>
              <button
                onClick={fetchBackupsList}
                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} className={loadingList ? 'spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingList ? (
              <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.8rem' }}>
                Loading cloud backups...
              </div>
            ) : existingBackups.length === 0 ? (
              <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>
                No prior cloud snapshots found. Trigger one above to create the initial cluster dump.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {existingBackups.map((b, idx) => (
                  <div
                    key={b.backup_id || idx}
                    style={{
                      background: '#020617',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileArchive size={16} color="#60a5fa" />
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: '600' }}>
                          {b.filename || `snapshot_${idx}.sql.gz`}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {b.created_at ? new Date(b.created_at).toLocaleString() : 'Recent'} • {formatBytes(b.size_bytes)}
                        </div>
                      </div>
                    </div>
                    {b.public_url && (
                      <a
                        href={b.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#38bdf8', padding: '4px' }}
                        title="Download Backup"
                      >
                        <Download size={15} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
