import { describe, it, expect } from 'vitest';

import type { Session } from '@/domain/types';

import { aggregateFrequency } from './frequency';

function makeSession(startedAt: string): Session {
  return { id: startedAt, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises: [] };
}

describe('aggregateFrequency', () => {
  it('counts sessions per month', () => {
    const result = aggregateFrequency(
      [
        makeSession('2026-01-05T12:00:00.000Z'),
        makeSession('2026-01-20T12:00:00.000Z'),
        makeSession('2026-03-10T12:00:00.000Z'),
      ],
      'month',
    );
    const byKey = Object.fromEntries(result.buckets.map((b) => [b.key, b.count]));
    expect(byKey['2026-01']).toBe(2);
    expect(byKey['2026-03']).toBe(1);
  });

  it('fills gap months with zero between first and last', () => {
    const result = aggregateFrequency(
      [makeSession('2026-01-05T12:00:00.000Z'), makeSession('2026-03-10T12:00:00.000Z')],
      'month',
    );
    expect(result.buckets.map((b) => b.key)).toEqual(['2026-01', '2026-02', '2026-03']);
    expect(result.buckets[1]).toMatchObject({ key: '2026-02', count: 0 });
    expect(result.buckets[0].label).toBe('Ene 2026');
  });

  it('groups by quarter with "T{n} {year}" labels', () => {
    const result = aggregateFrequency(
      [makeSession('2026-01-05T12:00:00.000Z'), makeSession('2026-04-10T12:00:00.000Z')],
      'quarter',
    );
    expect(result.buckets.map((b) => b.key)).toEqual(['2026-Q1', '2026-Q2']);
    expect(result.buckets.map((b) => b.label)).toEqual(['T1 2026', 'T2 2026']);
  });

  it('groups by year', () => {
    const result = aggregateFrequency(
      [
        makeSession('2025-06-05T12:00:00.000Z'),
        makeSession('2026-02-10T12:00:00.000Z'),
        makeSession('2026-08-10T12:00:00.000Z'),
      ],
      'year',
    );
    expect(result.buckets.map((b) => b.key)).toEqual(['2025', '2026']);
    expect(result.buckets.map((b) => b.count)).toEqual([1, 2]);
    expect(result.buckets[0].label).toBe('2025');
  });

  it('computes the average across buckets', () => {
    const result = aggregateFrequency(
      [
        makeSession('2026-01-05T12:00:00.000Z'),
        makeSession('2026-01-20T12:00:00.000Z'),
        makeSession('2026-03-10T12:00:00.000Z'),
      ],
      'month',
    );
    // counts [2, 0, 1] across Jan/Feb/Mar → average 1
    expect(result.average).toBeCloseTo(1, 6);
  });

  it('returns empty buckets and average 0 for no sessions', () => {
    const result = aggregateFrequency([], 'month');
    expect(result.buckets).toEqual([]);
    expect(result.average).toBe(0);
  });
});
