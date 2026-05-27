import { describe, it, expect } from 'vitest';
import App from '@/App';

describe('alias @/', () => {
  it('resolves @/ to src/ and allows importing project modules', () => {
    expect(typeof App).toBe('function');
  });
});
