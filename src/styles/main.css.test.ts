import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, it, expect } from 'vitest';

const cssPath = path.resolve(process.cwd(), 'src/styles/main.css');
const css = readFileSync(cssPath, 'utf-8');

describe('main.css — reset and mobile-first app shell', () => {
  it('applies global box-sizing: border-box (lets the layout scale)', () => {
    expect(css).toMatch(/\*[\s,*::a-z-]*\{[^}]*box-sizing:\s*border-box/);
  });

  it('declares the system font (system-ui or Apple equivalent)', () => {
    expect(css).toMatch(/font-family:\s*[^;]*(-apple-system|system-ui|SF Pro)/i);
  });

  it('the `.app-shell` container does not impose min-width', () => {
    const shellBlock = css.match(/\.app-shell\s*\{[^}]*\}/)?.[0];
    expect(shellBlock).toBeDefined();
    expect(shellBlock).not.toMatch(/min-width/);
  });
});

describe('main.css — responsive tablet/desktop (T055)', () => {
  it('default mobile container (<640px) has no max-width', () => {
    const shellBlock = css.match(/\.app-shell\s*\{[^}]*\}/)?.[0];
    expect(shellBlock).toBeDefined();
    expect(shellBlock).not.toMatch(/max-width/);
  });

  it('applies max-width and auto horizontal margin to the container at viewports >= 640px', () => {
    // Capture any @media min-width >= 640px rule that targets .app-shell.
    const mediaBlocks = css.matchAll(
      /@media[^{]*\(min-width:\s*(640|1024)px\)[^{]*\{[\s\S]*?\}\s*\}/g,
    );
    const responsiveShellRules = Array.from(mediaBlocks)
      .map((m) => m[0])
      .filter((block) => /\.app-shell\s*\{/.test(block));

    expect(responsiveShellRules.length).toBeGreaterThan(0);

    const combined = responsiveShellRules.join('\n');
    expect(combined).toMatch(/max-width/);
    expect(combined).toMatch(/margin(-inline)?\s*:\s*(?:0\s+)?auto|margin-inline:\s*auto/);
  });

  it('declares :focus-visible rules for keyboard navigation', () => {
    expect(css).toMatch(/:focus-visible/);
  });

  it('declares hover styles only for devices with a fine pointer (not touch)', () => {
    expect(css).toMatch(/@media\s*\([^)]*hover:\s*hover[^)]*\)\s*and\s*\([^)]*pointer:\s*fine/);
  });
});

describe('main.css — automatic light/dark theme (T022)', () => {
  function extractBlock(source: string, selector: string): string | undefined {
    // Captures the first non-nested "{...}" block following the selector.
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
    return match?.[1];
  }

  it(':root declares color custom properties (background, text, accent)', () => {
    const rootBlock = extractBlock(css, ':root');
    expect(rootBlock).toBeDefined();
    expect(rootBlock).toMatch(/--color-bg\s*:/);
    expect(rootBlock).toMatch(/--color-text\s*:/);
    expect(rootBlock).toMatch(/--color-accent\s*:/);
  });

  it('@media (prefers-color-scheme: dark) overrides the same variables with different values', () => {
    const darkMedia = css.match(
      /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{([\s\S]*?)\}\s*\}/,
    );
    expect(darkMedia, 'missing @media (prefers-color-scheme: dark) block').toBeDefined();
    const darkBody = darkMedia![1];
    expect(darkBody).toMatch(/--color-bg\s*:/);
    expect(darkBody).toMatch(/--color-text\s*:/);
    expect(darkBody).toMatch(/--color-accent\s*:/);
  });

  it('--color-bg values differ between light mode and dark mode', () => {
    const rootBlock = extractBlock(css, ':root');
    const darkMedia = css.match(
      /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{([\s\S]*?)\}\s*\}/,
    );
    expect(rootBlock).toBeDefined();
    expect(darkMedia).toBeDefined();

    const lightBg = rootBlock!.match(/--color-bg\s*:\s*([^;]+);/)?.[1]?.trim();
    const darkBg = darkMedia![1].match(/--color-bg\s*:\s*([^;]+);/)?.[1]?.trim();

    expect(lightBg).toBeDefined();
    expect(darkBg).toBeDefined();
    expect(lightBg).not.toBe(darkBg);
  });

  it('body uses the variables for background and color', () => {
    const bodyBlock = css.match(/(?:^|})\s*body\s*\{([^}]*)\}/)?.[1];
    expect(bodyBlock).toBeDefined();
    expect(bodyBlock).toMatch(/background[^:]*:\s*var\(--color-bg/);
    expect(bodyBlock).toMatch(/color\s*:\s*var\(--color-text/);
  });
});

describe('main.css — app shell layout (F2-T007)', () => {
  it('defines .sr-only class for screen-reader accessibility', () => {
    expect(css).toMatch(/\.sr-only\s*\{/);
  });

  it('.app-shell base rule includes padding-bottom for tab bar clearance', () => {
    const shellBlock = css.match(/\.app-shell\s*\{[^}]*\}/)?.[0];
    expect(shellBlock).toBeDefined();
    expect(shellBlock).toMatch(/padding-bottom/);
  });
});

describe('main.css — card component (F2-T005)', () => {
  it('defines .card class with background using --color-surface', () => {
    expect(css).toMatch(/\.card\s*\{[^}]*background[^:]*:\s*var\(--color-surface\)/);
  });

  it('defines .card class with border-radius using --radius-md', () => {
    const cardBlock = css.match(/\.card\s*\{[^}]*\}/)?.[0];
    expect(cardBlock).toBeDefined();
    expect(cardBlock).toMatch(/border-radius\s*:\s*var\(--radius-md\)/);
  });

  it('defines .card--interactive class', () => {
    expect(css).toMatch(/\.card--interactive/);
  });
});

describe('main.css — input / form field system (F2-T004)', () => {
  it('defines .field class', () => {
    expect(css).toMatch(/\.field\s*\{/);
  });

  it('styles input elements with border-radius using --radius-md', () => {
    expect(css).toMatch(/input[^{]*\{[^}]*border-radius\s*:\s*var\(--radius-md\)/);
  });

  it('input focus state uses --color-accent for border', () => {
    expect(css).toMatch(/input[^{]*:focus[^{]*\{[^}]*border-color\s*:\s*var\(--color-accent\)/);
  });
});

describe('main.css — button system (F2-T003)', () => {
  it('defines .btn class with min-height of 44px (Apple HIG touch target)', () => {
    const btnBlock = css.match(/\.btn\s*\{[^}]*\}/)?.[0];
    expect(btnBlock).toBeDefined();
    expect(btnBlock).toMatch(/min-height\s*:\s*44px/);
  });

  it('defines .btn-primary with background using --color-accent', () => {
    expect(css).toMatch(/\.btn-primary\s*\{[^}]*background[^:]*:\s*var\(--color-accent\)/);
  });

  it('defines .btn-danger class', () => {
    expect(css).toMatch(/\.btn-danger/);
  });
});

describe('main.css — design tokens (F2-T002)', () => {
  function extractRootBlock(source: string): string | undefined {
    return source.match(/:root\s*\{([^}]*)\}/)?.[1];
  }

  it('defines font-size tokens in :root', () => {
    const rootBlock = extractRootBlock(css);
    expect(rootBlock).toBeDefined();
    expect(rootBlock).toMatch(/--font-size-base\s*:/);
    expect(rootBlock).toMatch(/--font-size-xl\s*:/);
  });

  it('defines spacing tokens in :root', () => {
    const rootBlock = extractRootBlock(css);
    expect(rootBlock).toBeDefined();
    expect(rootBlock).toMatch(/--space-4\s*:/);
    expect(rootBlock).toMatch(/--space-6\s*:/);
  });

  it('defines border-radius tokens in :root', () => {
    const rootBlock = extractRootBlock(css);
    expect(rootBlock).toBeDefined();
    expect(rootBlock).toMatch(/--radius-md\s*:/);
    expect(rootBlock).toMatch(/--radius-pill\s*:/);
  });
});

describe('main.css — Apple color palette (F2-T001)', () => {
  function extractRootBlock(source: string): string | undefined {
    const match = source.match(/:root\s*\{([^}]*)\}/);
    return match?.[1];
  }

  function extractDarkAccentBlock(source: string): string | undefined {
    const darkMedia = source.match(
      /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{([\s\S]*?)\}\s*\}/,
    );
    return darkMedia?.[1];
  }

  it('--color-bg light value matches Apple light background (#f5f5f7)', () => {
    const rootBlock = extractRootBlock(css);
    expect(rootBlock).toBeDefined();
    const value = rootBlock!.match(/--color-bg\s*:\s*([^;]+);/)?.[1]?.trim();
    expect(value).toBe('#f5f5f7');
  });

  it('--color-accent light value is Apple blue (#0071e3)', () => {
    const rootBlock = extractRootBlock(css);
    expect(rootBlock).toBeDefined();
    const value = rootBlock!.match(/--color-accent\s*:\s*([^;]+);/)?.[1]?.trim();
    expect(value).toBe('#0071e3');
  });

  it('--color-destructive is defined in :root', () => {
    const rootBlock = extractRootBlock(css);
    expect(rootBlock).toBeDefined();
    expect(rootBlock).toMatch(/--color-destructive\s*:/);
  });

  it('--color-surface is defined in :root', () => {
    const rootBlock = extractRootBlock(css);
    expect(rootBlock).toBeDefined();
    expect(rootBlock).toMatch(/--color-surface\s*:/);
  });

  it('--color-accent dark value is Apple dark blue (#2997ff)', () => {
    const darkBody = extractDarkAccentBlock(css);
    expect(darkBody).toBeDefined();
    const value = darkBody!.match(/--color-accent\s*:\s*([^;]+);/)?.[1]?.trim();
    expect(value).toBe('#2997ff');
  });
});
