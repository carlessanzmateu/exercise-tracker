import { describe, it, expect } from 'vitest';

import {
  parseHealthImport,
  InvalidHealthImportError,
  UnsupportedHealthImportVersionError,
} from './parseHealthImport';

describe('parseHealthImport', () => {
  it('parses a valid health import into HealthDay[] sorted by date asc', () => {
    const result = parseHealthImport({
      version: 1,
      days: [
        { date: '2026-05-26', steps: 11050, distanceKm: 8.04 },
        { date: '2026-05-25', steps: 8423, distanceKm: 6.21 },
      ],
    });
    expect(result).toEqual([
      { date: '2026-05-25', steps: 8423, distanceKm: 6.21 },
      { date: '2026-05-26', steps: 11050, distanceKm: 8.04 },
    ]);
  });

  it('throws UnsupportedHealthImportVersionError on a wrong version', () => {
    expect(() => parseHealthImport({ version: 99, days: [] })).toThrow(
      UnsupportedHealthImportVersionError,
    );
  });

  it('throws InvalidHealthImportError when days is not an array', () => {
    expect(() => parseHealthImport({ version: 1, days: 'nope' })).toThrow(InvalidHealthImportError);
  });

  it('throws InvalidHealthImportError when payload is not an object', () => {
    expect(() => parseHealthImport(null)).toThrow(InvalidHealthImportError);
  });

  it('drops invalid day entries but keeps the valid ones', () => {
    const result = parseHealthImport({
      version: 1,
      days: [
        { date: '2026-05-25', steps: 8423, distanceKm: 6.21 },
        { date: 'bad', steps: 1, distanceKm: 1 },
        { date: '2026-05-26', steps: -5, distanceKm: 1 },
      ],
    });
    expect(result).toEqual([{ date: '2026-05-25', steps: 8423, distanceKm: 6.21 }]);
  });

  it('throws InvalidHealthImportError when no valid days remain', () => {
    expect(() =>
      parseHealthImport({ version: 1, days: [{ date: 'bad', steps: 1, distanceKm: 1 }] }),
    ).toThrow(InvalidHealthImportError);
  });

  it('dedupes by date keeping the last occurrence', () => {
    const result = parseHealthImport({
      version: 1,
      days: [
        { date: '2026-05-25', steps: 100, distanceKm: 1 },
        { date: '2026-05-25', steps: 9000, distanceKm: 7 },
      ],
    });
    expect(result).toEqual([{ date: '2026-05-25', steps: 9000, distanceKm: 7 }]);
  });

  it('parses a v2 raw-samples payload aggregated into daily HealthDay[]', () => {
    const result = parseHealthImport({
      version: 2,
      samples: [
        { metric: 'steps', date: '2026-05-25T08:13:00', value: 1200 },
        { metric: 'steps', date: '2026-05-25T18:40:00', value: 3050 },
        { metric: 'distance', date: '2026-05-25T08:13:00', value: 0.92 },
      ],
    });
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-05-25');
    expect(result[0].steps).toBe(4250);
    expect(result[0].distanceKm).toBeCloseTo(0.92, 5);
  });

  it('sums v2 samples of the same day across metrics', () => {
    const result = parseHealthImport({
      version: 2,
      samples: [
        { metric: 'steps', date: '2026-05-25T08:00:00', value: 500 },
        { metric: 'steps', date: '2026-05-26T08:00:00', value: 2000 },
        { metric: 'distance', date: '2026-05-26T09:00:00', value: 1.5 },
      ],
    });
    expect(result).toEqual([
      { date: '2026-05-25', steps: 500, distanceKm: 0 },
      { date: '2026-05-26', steps: 2000, distanceKm: 1.5 },
    ]);
  });

  it('still parses a v1 (daily) payload unchanged', () => {
    const result = parseHealthImport({
      version: 1,
      days: [{ date: '2026-05-25', steps: 8423, distanceKm: 6.21 }],
    });
    expect(result).toEqual([{ date: '2026-05-25', steps: 8423, distanceKm: 6.21 }]);
  });

  it('throws UnsupportedHealthImportVersionError on an unknown version (e.g. 99)', () => {
    expect(() => parseHealthImport({ version: 99, samples: [] })).toThrow(
      UnsupportedHealthImportVersionError,
    );
  });

  it('throws InvalidHealthImportError when v2 samples is not an array', () => {
    expect(() => parseHealthImport({ version: 2, samples: 'nope' })).toThrow(
      InvalidHealthImportError,
    );
  });

  it('throws InvalidHealthImportError when v2 yields no valid days', () => {
    expect(() =>
      parseHealthImport({
        version: 2,
        samples: [{ metric: 'steps', date: 'bad', value: 100 }],
      }),
    ).toThrow(InvalidHealthImportError);
  });
});
