import { describe, it, expect } from 'vitest';
import { manifest } from './manifest.config';

describe('PWA manifest', () => {
  it('declares the basic PWA fields', () => {
    expect(manifest.name).toBe('Exercise Tracker');
    expect(manifest.short_name).toBe('Exercise Tracker');
    expect(manifest.start_url).toBe('./');
    expect(manifest.display).toBe('standalone');
    expect(manifest.orientation).toBe('any');
    expect(manifest.description).toBeTruthy();
  });

  it('declares icons at sizes 180, 192 and 512', () => {
    const sizes = manifest.icons.map((icon) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(sizes).toContain('180x180');
  });

  it('every icon points to a non-empty src and declares a type', () => {
    for (const icon of manifest.icons) {
      expect(icon.src).toBeTruthy();
      expect(icon.type).toBeTruthy();
    }
  });

  it('background_color is consistent with the light theme (white)', () => {
    expect(manifest.background_color.toLowerCase()).toBe('#ffffff');
  });

  it('theme_color is a valid hex colour', () => {
    expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe('PWA manifest — final assets (T024)', () => {
  it('each "any" icon references a dedicated src per size (not all pointing to the same file)', () => {
    const anyIcons = manifest.icons.filter((icon) => (icon.purpose ?? 'any') === 'any');
    const sources = anyIcons.map((icon) => icon.src);
    const unique = new Set(sources);
    expect(
      unique.size,
      `"any" icons must reference dedicated files; sources: ${sources.join(', ')}`,
    ).toBe(anyIcons.length);
  });

  it('the 180x180 icon is dedicated to apple-touch-icon', () => {
    const appleIcon = manifest.icons.find((icon) => icon.sizes === '180x180');
    expect(appleIcon).toBeDefined();
    expect(appleIcon!.src).toMatch(/apple-touch-icon/);
  });

  it('declares at least one icon with purpose "maskable" for Android adaptive icons', () => {
    const maskable = manifest.icons.find((icon) => icon.purpose === 'maskable');
    expect(maskable, 'missing a purpose: "maskable" icon').toBeDefined();
    expect(maskable!.sizes).toMatch(/(192|512)/);
  });

  it('theme_color and background_color are defined and consistent with the light theme', () => {
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
    expect(manifest.background_color.toLowerCase()).toBe('#ffffff');
  });
});

describe('PWA PNG icons on disk (T052)', () => {
  it('the three PNG icons exist in public/', async () => {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const root = process.cwd();
    for (const file of ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
      const p = path.resolve(root, 'public', file);
      const stat = await fs.stat(p);
      expect(stat.isFile(), `${file} must exist under public/`).toBe(true);
      expect(stat.size).toBeGreaterThan(0);
    }
  });

  it('every PNG icon declared in the manifest has type image/png', () => {
    const pngIcons = manifest.icons.filter((i) => i.src.endsWith('.png'));
    expect(pngIcons.length).toBeGreaterThanOrEqual(3);
    for (const icon of pngIcons) {
      expect(icon.type).toBe('image/png');
    }
  });

  it('the manifest references apple-touch-icon.png, icon-192.png and icon-512.png', () => {
    const sources = manifest.icons.map((i) => i.src);
    expect(sources).toContain('apple-touch-icon.png');
    expect(sources).toContain('icon-192.png');
    expect(sources).toContain('icon-512.png');
  });
});
