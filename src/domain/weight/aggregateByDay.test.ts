import { describe, expect, it } from 'vitest';

import { aggregateByDay } from './aggregateByDay';
import type { WeightEntry } from './weightEntry';

function entry(id: string, recordedAt: string, weightKg: number): WeightEntry {
  return { id, recordedAt, weightKg };
}

describe('aggregateByDay', () => {
  it('returns one point per day with the mean weight of that day', () => {
    const result = aggregateByDay([
      entry('a', '2026-05-28T08:00:00', 75.0),
      entry('b', '2026-05-28T20:00:00', 76.0),
    ]);
    expect(result).toEqual([{ date: '2026-05-28', avgKg: 75.5, count: 2 }]);
  });

  it('rounds avgKg to 1 decimal', () => {
    const result = aggregateByDay([
      entry('a', '2026-05-28T08:00:00', 75.0),
      entry('b', '2026-05-28T12:00:00', 75.33),
      entry('c', '2026-05-28T20:00:00', 75.67),
    ]);
    expect(result[0].avgKg).toBe(75.3);
  });

  it('keeps separate days as separate points, sorted ascending', () => {
    const result = aggregateByDay([
      entry('a', '2026-05-30T08:00:00', 76.0),
      entry('b', '2026-05-28T08:00:00', 75.0),
      entry('c', '2026-05-29T08:00:00', 75.5),
    ]);
    expect(result.map((p) => p.date)).toEqual(['2026-05-28', '2026-05-29', '2026-05-30']);
  });

  it('groups by local day (not UTC)', () => {
    // Both entries share the same local calendar day even if hours differ.
    const result = aggregateByDay([
      entry('a', '2026-05-28T00:30:00', 75.0),
      entry('b', '2026-05-28T23:30:00', 76.0),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-05-28');
    expect(result[0].count).toBe(2);
  });

  it('counts how many entries contributed to each day', () => {
    const result = aggregateByDay([
      entry('a', '2026-05-28T08:00:00', 75.0),
      entry('b', '2026-05-28T20:00:00', 75.5),
      entry('c', '2026-05-29T08:00:00', 76.0),
    ]);
    const may28 = result.find((p) => p.date === '2026-05-28');
    const may29 = result.find((p) => p.date === '2026-05-29');
    expect(may28?.count).toBe(2);
    expect(may29?.count).toBe(1);
  });

  it('returns an empty array for no entries', () => {
    expect(aggregateByDay([])).toEqual([]);
  });

  it('drops entries with unparseable recordedAt defensively', () => {
    const result = aggregateByDay([
      entry('a', '2026-05-28T08:00:00', 75.0),
      entry('b', 'not-a-date', 99),
    ]);
    expect(result).toEqual([{ date: '2026-05-28', avgKg: 75.0, count: 1 }]);
  });
});
