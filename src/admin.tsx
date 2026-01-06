import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminPanel from './components/AdminPanel';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import '../styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <AdminPanel />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);
