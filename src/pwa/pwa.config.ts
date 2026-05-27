import type { VitePWAOptions } from 'vite-plugin-pwa';

import { manifest } from './manifest.config';

export const pwaOptions: Partial<VitePWAOptions> = {
  manifest,
  registerType: 'autoUpdate',
  workbox: {
    cleanupOutdatedCaches: true,
    globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff,woff2}'],
    navigateFallback: 'index.html',
    runtimeCaching: [
      {
        // App shell: JS/CSS/HTML — sirve desde caché primero (offline-first puro).
        urlPattern: /\.(?:js|css|html)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'app-shell-v1',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
      {
        // Imágenes (iconos PWA, SVG): caché primero.
        urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|ico)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-v1',
          expiration: {
            maxEntries: 40,
            maxAgeSeconds: 60 * 60 * 24 * 90,
          },
        },
      },
      {
        // Fuentes (si las hubiera): caché primero.
        urlPattern: /\.(?:woff2?|ttf|otf|eot)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'fonts-v1',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
    ],
  },
};
