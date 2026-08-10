import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const pwaIcons = [
  { src: '/brand/logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/brand/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: '/brand/logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
];

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['brand/**/*'],
      manifest: {
        id: '/',
        name: 'Win Gold | بوابة التوصيل',
        short_name: 'WinGold Delivery',
        description: 'إدارة طلبات التوصيل والسائقين لشركات التوصيل.',
        theme_color: '#1e3a8a',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'ar',
        dir: 'rtl',
        categories: ['business', 'productivity'],
        icons: pwaIcons,
      },
      workbox: {
        importScripts: ['sw-push.js'],
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\.(png|svg|ico|woff2?)$/i.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'delivery-static-assets',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'delivery-pages',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5175,
    strictPort: true,
  },
});
