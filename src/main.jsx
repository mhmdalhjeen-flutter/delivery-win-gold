import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { queryClient } from './lib/queryClient';
import PushSubscriptionHost from './components/PushSubscriptionHost';
import NotificationListener from './components/NotificationListener';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import PwaUpdateBanner from './components/PwaUpdateBanner';
import { initPwaServiceWorker } from './pwa/registerServiceWorker';
import './index.css';

initPwaServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PushSubscriptionHost />
        <NotificationListener />
        <PwaInstallPrompt />
        <PwaUpdateBanner />
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
