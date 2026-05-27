import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { useElementWidth } from './useElementWidth';

function Probe({ fallback }: { fallback?: number }) {
  const [ref, width] = useElementWidth<HTMLDivElement>(fallback);
  return (
    <div ref={ref} data-testid="box">
      <span data-testid="width">{width}</span>
    </div>
  );
}

describe('useElementWidth', () => {
  it('returns the fallback width before measuring', () => {
    render(<Probe fallback={500} />);
    expect(screen.getByTestId('width').textContent).toBe('500');
  });

  it('defaults to 320 when no fallback is given', () => {
    render(<Probe />);
    expect(screen.getByTestId('width').textContent).toBe('320');
  });

  it('exposes a ref that can be attached to an element', () => {
    render(<Probe />);
    expect(screen.getByTestId('box')).toBeInTheDocument();
  });

  it('does not crash when ResizeObserver is unavailable', () => {
    const original = globalThis.ResizeObserver;
    // @ts-expect-error: simulate an environment without ResizeObserver
    delete globalThis.ResizeObserver;
    expect(() => render(<Probe />)).not.toThrow();
    globalThis.ResizeObserver = original;
  });
});
