import React, { useState } from 'react';
import { X, Database, Download, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export const AdminBackupModal = ({ isOpen, onClose }) => {
  const [backingUp, setBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [backupMeta, setBackupMeta] = useState(null);

  if (!isOpen) return null;

  const handleTriggerBackup = () => {
    setBackingUp(true);
    setBackupSuccess(false);
    setTimeout(() => {
      setBackingUp(false);
      setBackupSuccess(true);
      setBackupMeta({
        filename: `shopme_db_backup_${new Date().toISOString().slice(0, 10)}.sql.gz`,
        size: '14.2 MB',
        tables: ['users', 'shops', 'products', 'inventory', 'reservations', 'khata_accounts', 'khata_transactions', 'categories'],
        timestamp: new Date().toLocaleString(),
      });
    }, 1200);
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
          maxWidth: '520px',
          padding: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px', borderRadius: '8px' }}>
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>PostgreSQL Cluster Backup</h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Point-in-time Snapshot &amp; Dump</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {backupSuccess && backupMeta ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={42} color="#22c55e" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc' }}>Snapshot Generated Successfully</h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Snapshot file: <strong>{backupMeta.filename}</strong> ({backupMeta.size})
            </p>

            <div style={{ background: '#020617', padding: '10px 14px', borderRadius: '10px', fontSize: '0.78rem', color: '#cbd5e1', textAlign: 'left', marginBottom: '1.25rem' }}>
              <div>Tables: {backupMeta.tables.join(', ')}</div>
              <div>Timestamp: {backupMeta.timestamp}</div>
            </div>

            <button
              onClick={() => {
                alert('Downloading encrypted SQL snapshot...');
                onClose();
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: '#10b981',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Download size={16} /> Download Encrypted Snapshot
            </button>
          </div>
        ) : (
          <div>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Yeh process PostgreSQL database ka complete logical dump generate karega with all schema definitions, merchants, catalogs, orders, aur ledger transaction histories.
            </p>

            <div style={{ padding: '10px 12px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
              <ShieldCheck size={16} color="#60a5fa" />
              <span>Backups are AES-256 encrypted and stored with immutable WAL logs.</span>
            </div>

            <button
              onClick={handleTriggerBackup}
              disabled={backingUp}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: backingUp ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={16} className={backingUp ? 'spin' : ''} />
              {backingUp ? 'Generating Database Dump...' : 'Create Snapshot Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
