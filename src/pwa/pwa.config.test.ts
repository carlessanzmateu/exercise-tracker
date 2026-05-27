import { describe, it, expect } from 'vitest';

import { pwaOptions } from './pwa.config';

describe('PWA options (vite-plugin-pwa)', () => {
  it('references the defined manifest', () => {
    const m = pwaOptions.manifest;
    expect(m).toBeDefined();
    expect(m).not.toBe(false);
    if (typeof m === 'object' && m !== null) {
      expect(m.name).toBe('Exercise Tracker');
    }
  });

  it('uses registerType autoUpdate (refreshes the SW when a new version is detected)', () => {
    expect(pwaOptions.registerType).toBe('autoUpdate');
  });

  it('clears outdated caches on each SW update', () => {
    expect(pwaOptions.workbox?.cleanupOutdatedCaches).toBe(true);
  });

  it('precaches the app shell (JS/CSS/HTML) via globPatterns', () => {
    const globs = pwaOptions.workbox?.globPatterns ?? [];
    const joined = globs.join(' ');
    expect(joined).toMatch(/js/);
    expect(joined).toMatch(/css/);
    expect(joined).toMatch(/html/);
  });

  it('declares navigateFallback to index.html for offline-first SPA behaviour', () => {
    expect(pwaOptions.workbox?.navigateFallback).toBe('index.html');
  });

  it('declares at least one runtimeCaching rule with CacheFirst strategy for the app shell', () => {
    const rules = pwaOptions.workbox?.runtimeCaching ?? [];
    expect(rules.length).toBeGreaterThan(0);
    const cacheFirst = rules.find((r) => r.handler === 'CacheFirst');
    expect(cacheFirst, 'missing a runtimeCaching rule with handler CacheFirst').toBeDefined();
  });
});
