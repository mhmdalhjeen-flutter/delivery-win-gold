import React from 'react';

import ReactDOM from 'react-dom/client';

import { QueryClientProvider, onlineManager } from '@tanstack/react-query';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import App from './App';

import { AuthProvider } from './context/AuthContext';

import { PwaInstallProvider } from './context/PwaInstallContext';

import { queryClient } from './lib/queryClient';

import { persistOptions } from './lib/queryPersister';

import PushSubscriptionHost from './components/PushSubscriptionHost';

import NotificationListener from './components/NotificationListener';

import PwaUpdateBanner from './components/PwaUpdateBanner';

import { initPwaServiceWorker } from './pwa/registerServiceWorker';

import './index.css';



initPwaServiceWorker();



onlineManager.setEventListener((setOnline) => {

  const onOnline = () => setOnline(true);

  const onOffline = () => setOnline(false);

  window.addEventListener('online', onOnline);

  window.addEventListener('offline', onOffline);

  setOnline(navigator.onLine);

  return () => {

    window.removeEventListener('online', onOnline);

    window.removeEventListener('offline', onOffline);

  };

});



ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>

    <PersistQueryClientProvider

      client={queryClient}

      persistOptions={persistOptions}

      onSuccess={() => {

        queryClient.resumePausedMutations().catch(() => {});

      }}

    >

      <PwaInstallProvider>

        <AuthProvider>

          <PushSubscriptionHost />

          <NotificationListener />

          <PwaUpdateBanner />

          <App />

        </AuthProvider>

      </PwaInstallProvider>

    </PersistQueryClientProvider>

  </React.StrictMode>,

);

