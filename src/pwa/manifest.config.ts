export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome' | 'any maskable';
}

export interface AppManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'any' | 'portrait' | 'landscape';
  theme_color: string;
  background_color: string;
  icons: ManifestIcon[];
}

export const manifest: AppManifest = {
  name: 'Exercise Tracker',
  short_name: 'Exercise Tracker',
  description: 'Registro local de entrenamientos en una PWA sin backend.',
  // Rutas relativas: resuelven respecto al base del despliegue (raíz en local,
  // /<repo>/ en GitHub Pages), sin depender de un dominio o sub-ruta concretos.
  start_url: './',
  display: 'standalone',
  orientation: 'any',
  theme_color: '#111111',
  background_color: '#ffffff',
  icons: [
    { src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
