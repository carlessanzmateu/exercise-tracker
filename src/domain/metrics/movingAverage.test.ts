import { describe, it, expect } from 'vitest';

import { movingAverage, type SeriesPoint } from './movingAverage';

function points(values: number[]): SeriesPoint[] {
  return values.map((value, i) => ({ date: `2026-01-${String(i + 1).padStart(2, '0')}`, value }));
}

describe('movingAverage', () => {
  it('returns the same length and dates as the input', () => {
    const input = points([1, 2, 3, 4]);
    const result = movingAverage(input, 3);
    expect(result.map((p) => p.date)).toEqual(input.map((p) => p.date));
  });

  it('averages the trailing window once enough points exist', () => {
    const result = movingAverage(points([1, 2, 3, 4]), 3);
    expect(result.map((p) => p.value)).toEqual([1, 1.5, 2, 3]);
  });

  it('uses a partial window at the start', () => {
    const result = movingAverage(points([10, 20]), 7);
    expect(result.map((p) => p.value)).toEqual([10, 15]);
  });

  it('returns the same values when window <= 1', () => {
    const result = movingAverage(points([5, 8, 3]), 1);
    expect(result.map((p) => p.value)).toEqual([5, 8, 3]);
  });

  it('returns an empty array for empty input', () => {
    expect(movingAverage([], 7)).toEqual([]);
  });
});
