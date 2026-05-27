import { describe, it, expect } from 'vitest';

import type { HealthDay } from '@/domain/health/healthDay';

import { buildActivitySeries } from './activity';

const DAY_MS = 86_400_000;

// Genera `count` días consecutivos terminando en `endDate` (incluido), asc.
function consecutiveDays(count: number, endDate: string, steps = 100, distanceKm = 1): HealthDay[] {
  const endMs = new Date(`${endDate}T00:00:00.000Z`).getTime();
  const days: HealthDay[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(endMs - i * DAY_MS).toISOString().slice(0, 10);
    days.push({ date, steps, distanceKm });
  }
  return days;
}

describe('buildActivitySeries', () => {
  it('builds daily steps and distance series within the month window', () => {
    const days: HealthDay[] = [
      { date: '2026-05-24', steps: 100, distanceKm: 1 },
      { date: '2026-05-25', steps: 200, distanceKm: 2 },
      { date: '2026-05-26', steps: 300, distanceKm: 3 },
    ];
    const result = buildActivitySeries(days, 'month');
    expect(result.steps).toEqual([
      { date: '2026-05-24', value: 100 },
      { date: '2026-05-25', value: 200 },
      { date: '2026-05-26', value: 300 },
    ]);
    expect(result.distanceKm.map((p) => p.value)).toEqual([1, 2, 3]);
  });

  it('limits the window by granularity (quarter includes more days than month)', () => {
    const days = consecutiveDays(120, '2026-04-30');
    const month = buildActivitySeries(days, 'month');
    const quarter = buildActivitySeries(days, 'year');
    expect(month.dayCount).toBeLessThanOrEqual(30);
    expect(quarter.dayCount).toBeGreaterThan(month.dayCount);
  });

  it('computes totals and daily averages over the window', () => {
    const days: HealthDay[] = [
      { date: '2026-05-24', steps: 100, distanceKm: 1 },
      { date: '2026-05-25', steps: 200, distanceKm: 2 },
      { date: '2026-05-26', steps: 300, distanceKm: 3 },
    ];
    const result = buildActivitySeries(days, 'month');
    expect(result.totalSteps).toBe(600);
    expect(result.avgSteps).toBe(200);
    expect(result.totalDistanceKm).toBe(6);
    expect(result.avgDistanceKm).toBe(2);
    expect(result.dayCount).toBe(3);
  });

  it('returns empty series and zero aggregates for no data', () => {
    const result = buildActivitySeries([], 'month');
    expect(result.steps).toEqual([]);
    expect(result.distanceKm).toEqual([]);
    expect(result.totalSteps).toBe(0);
    expect(result.avgSteps).toBe(0);
    expect(result.dayCount).toBe(0);
  });
});
