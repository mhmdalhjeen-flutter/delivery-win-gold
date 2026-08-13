import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';

import { VitePWA } from 'vite-plugin-pwa';



export default defineConfig({

  plugins: [

    react(),

    VitePWA({

      registerType: 'prompt',

      injectRegister: false,

      includeAssets: [

        'brand/**/*',

        'robots.txt',

      ],

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

        icons: [

          { src: '/brand/logo-64.webp', sizes: '64x64', type: 'image/webp', purpose: 'any' },

          { src: '/brand/logo-128.webp', sizes: '128x128', type: 'image/webp', purpose: 'any' },

          { src: '/brand/logo-192.webp', sizes: '192x192', type: 'image/webp', purpose: 'any' },

          { src: '/brand/logo-256.webp', sizes: '256x256', type: 'image/webp', purpose: 'any' },

          { src: '/brand/logo-384.webp', sizes: '384x384', type: 'image/webp', purpose: 'any' },

          { src: '/brand/logo-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'any' },

          { src: '/brand/logo-192-maskable.webp', sizes: '192x192', type: 'image/webp', purpose: 'maskable' },

          { src: '/brand/logo-512-maskable.webp', sizes: '512x512', type: 'image/webp', purpose: 'maskable' },

          { src: '/brand/logo-64.png', sizes: '64x64', type: 'image/png', purpose: 'any' },

        ],

      },

      workbox: {

        importScripts: ['sw-push.js'],

        globPatterns: ['**/*.{js,css,html,webp,png,svg,ico,woff,woff2}'],

        cleanupOutdatedCaches: true,

        skipWaiting: false,

        clientsClaim: true,

        navigateFallback: '/index.html',

        runtimeCaching: [

          {

            urlPattern: ({ url, sameOrigin }) =>

              sameOrigin && /\.(webp|png|svg|ico|woff2?)$/i.test(url.pathname),

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

