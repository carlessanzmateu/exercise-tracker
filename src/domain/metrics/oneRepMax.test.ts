import { describe, it, expect } from 'vitest';

import { estimateOneRepMax } from './oneRepMax';

describe('estimateOneRepMax (Epley)', () => {
  it('returns the weight unchanged for a single rep', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });

  it('applies the Epley formula for 2..12 reps', () => {
    expect(estimateOneRepMax(100, 5)).toBeCloseTo(116.6667, 3);
    expect(estimateOneRepMax(60, 8)).toBeCloseTo(76, 6);
    expect(estimateOneRepMax(80, 12)).toBeCloseTo(112, 6);
  });

  it('returns null for reps above 12 (unreliable)', () => {
    expect(estimateOneRepMax(100, 13)).toBeNull();
    expect(estimateOneRepMax(100, 20)).toBeNull();
  });

  it('returns null for non-positive weight or reps', () => {
    expect(estimateOneRepMax(0, 5)).toBeNull();
    expect(estimateOneRepMax(-10, 5)).toBeNull();
    expect(estimateOneRepMax(100, 0)).toBeNull();
    expect(estimateOneRepMax(100, -3)).toBeNull();
  });
});
