import { describe, it, expect } from 'vitest';

import { normalizeHealthDay } from './healthDay';

describe('normalizeHealthDay', () => {
  it('normalizes a valid day', () => {
    expect(normalizeHealthDay({ date: '2026-05-25', steps: 8423, distanceKm: 6.21 })).toEqual({
      date: '2026-05-25',
      steps: 8423,
      distanceKm: 6.21,
    });
  });

  it('rounds steps to an integer', () => {
    expect(normalizeHealthDay({ date: '2026-05-25', steps: 8423.7, distanceKm: 6 })?.steps).toBe(
      8424,
    );
  });

  it('returns null when date is missing or malformed', () => {
    expect(normalizeHealthDay({ steps: 100, distanceKm: 1 })).toBeNull();
    expect(normalizeHealthDay({ date: '25-05-2026', steps: 100, distanceKm: 1 })).toBeNull();
    expect(normalizeHealthDay({ date: '2026-5-25', steps: 100, distanceKm: 1 })).toBeNull();
  });

  it('returns null when steps or distance are negative or non-numeric', () => {
    expect(normalizeHealthDay({ date: '2026-05-25', steps: -1, distanceKm: 1 })).toBeNull();
    expect(normalizeHealthDay({ date: '2026-05-25', steps: 100, distanceKm: -2 })).toBeNull();
    expect(normalizeHealthDay({ date: '2026-05-25', steps: 'x', distanceKm: 1 })).toBeNull();
    expect(normalizeHealthDay({ date: '2026-05-25', steps: 100 })).toBeNull();
    expect(normalizeHealthDay({ date: '2026-05-25', steps: NaN, distanceKm: 1 })).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(normalizeHealthDay(null)).toBeNull();
    expect(normalizeHealthDay('2026-05-25')).toBeNull();
  });
});
