import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AdminAuthProvider>
        <AppContent />
      </AdminAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
