import { describe, it, expect } from 'vitest';

import { aggregateSamplesToDays, type HealthSample } from './aggregateSamples';

describe('aggregateSamplesToDays', () => {
  it('sums steps samples within the same local day', () => {
    const samples: HealthSample[] = [
      { metric: 'steps', date: '2026-05-25T08:13:00', value: 1200 },
      { metric: 'steps', date: '2026-05-25T18:40:00', value: 3050 },
    ];
    expect(aggregateSamplesToDays(samples)).toEqual([
      { date: '2026-05-25', steps: 4250, distanceKm: 0 },
    ]);
  });

  it('sums distance samples (km) within the same day', () => {
    const samples: HealthSample[] = [
      { metric: 'distance', date: '2026-05-25T08:13:00', value: 0.92 },
      { metric: 'distance', date: '2026-05-25T18:40:00', value: 1.5 },
    ];
    const result = aggregateSamplesToDays(samples);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-05-25');
    expect(result[0].steps).toBe(0);
    expect(result[0].distanceKm).toBeCloseTo(2.42, 5);
  });

  it('keeps separate days as separate entries, sorted ascending', () => {
    const samples: HealthSample[] = [
      { metric: 'steps', date: '2026-05-27T10:00:00', value: 500 },
      { metric: 'steps', date: '2026-05-25T10:00:00', value: 1000 },
      { metric: 'steps', date: '2026-05-26T10:00:00', value: 2000 },
    ];
    expect(aggregateSamplesToDays(samples)).toEqual([
      { date: '2026-05-25', steps: 1000, distanceKm: 0 },
      { date: '2026-05-26', steps: 2000, distanceKm: 0 },
      { date: '2026-05-27', steps: 500, distanceKm: 0 },
    ]);
  });

  it('defaults the missing metric to 0 for a day with only one metric', () => {
    const samples: HealthSample[] = [
      { metric: 'steps', date: '2026-05-25T08:00:00', value: 500 },
      { metric: 'distance', date: '2026-05-26T08:00:00', value: 1.2 },
    ];
    expect(aggregateSamplesToDays(samples)).toEqual([
      { date: '2026-05-25', steps: 500, distanceKm: 0 },
      { date: '2026-05-26', steps: 0, distanceKm: 1.2 },
    ]);
  });

  it('rounds aggregated steps to an integer', () => {
    const samples: HealthSample[] = [
      { metric: 'steps', date: '2026-05-25T08:00:00', value: 1200.6 },
      { metric: 'steps', date: '2026-05-25T18:00:00', value: 49.7 },
    ];
    expect(aggregateSamplesToDays(samples)).toEqual([
      { date: '2026-05-25', steps: 1250, distanceKm: 0 },
    ]);
  });

  it('drops invalid samples (bad date, negative/non-finite value, unknown metric)', () => {
    const samples = [
      { metric: 'steps', date: '2026-05-25T08:00:00', value: 100 },
      { metric: 'steps', date: 'not-a-date', value: 500 },
      { metric: 'steps', date: '2026-05-25T09:00:00', value: -10 },
      { metric: 'distance', date: '2026-05-25T10:00:00', value: Number.POSITIVE_INFINITY },
      { metric: 'distance', date: '2026-05-25T10:00:00', value: Number.NaN },
      { metric: 'calories', date: '2026-05-25T11:00:00', value: 200 },
    ] as unknown as HealthSample[];
    expect(aggregateSamplesToDays(samples)).toEqual([
      { date: '2026-05-25', steps: 100, distanceKm: 0 },
    ]);
  });

  it('returns an empty array for no valid samples', () => {
    expect(aggregateSamplesToDays([])).toEqual([]);
    const onlyInvalid = [
      { metric: 'unknown', date: '2026-05-25', value: 100 },
      { metric: 'steps', date: 'bad', value: 50 },
    ] as unknown as HealthSample[];
    expect(aggregateSamplesToDays(onlyInvalid)).toEqual([]);
  });

  it('accepts plain YYYY-MM-DD dates', () => {
    const samples: HealthSample[] = [{ metric: 'steps', date: '2026-05-25', value: 8000 }];
    expect(aggregateSamplesToDays(samples)).toEqual([
      { date: '2026-05-25', steps: 8000, distanceKm: 0 },
    ]);
  });
});
