import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

import { pwaOptions } from './src/pwa/pwa.config';

export default defineConfig({
  // En GitHub Pages (repo de proyecto) la app se sirve en /<repo>/. El workflow de
  // despliegue inyecta VITE_BASE='/<repo>/'. En local/dev queda en la raíz.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), VitePWA(pwaOptions)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
