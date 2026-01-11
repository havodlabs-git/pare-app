import React from 'react';
import ReactDOM from 'react-dom/client';
import PsicologoPortal from './components/PsicologoPortal';
import { ToastProvider } from './context/ToastContext';
import '../styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <PsicologoPortal />
    </ToastProvider>
  </React.StrictMode>
);
