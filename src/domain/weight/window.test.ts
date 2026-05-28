import { describe, expect, it } from 'vitest';

import { computeWindowRange, isLatestWindow } from './window';

describe('computeWindowRange', () => {
  describe('week filter (Monday to Sunday)', () => {
    it('returns Monday to Sunday of the anchor week (offset 0)', () => {
      // 2026-05-28 is a Thursday. Week = Mon 2026-05-25 to Sun 2026-05-31.
      const range = computeWindowRange('week', new Date(2026, 4, 28), 0);
      expect(range).toEqual({ from: '2026-05-25', to: '2026-05-31' });
    });

    it('returns the previous Monday-Sunday window (offset -1)', () => {
      const range = computeWindowRange('week', new Date(2026, 4, 28), -1);
      expect(range).toEqual({ from: '2026-05-18', to: '2026-05-24' });
    });

    it('handles a Monday anchor correctly', () => {
      const range = computeWindowRange('week', new Date(2026, 4, 25), 0);
      expect(range).toEqual({ from: '2026-05-25', to: '2026-05-31' });
    });

    it('handles a Sunday anchor correctly', () => {
      const range = computeWindowRange('week', new Date(2026, 4, 31), 0);
      expect(range).toEqual({ from: '2026-05-25', to: '2026-05-31' });
    });
  });

  describe('month filter', () => {
    it('returns the full calendar month of the anchor (offset 0)', () => {
      const range = computeWindowRange('month', new Date(2026, 4, 28), 0);
      expect(range).toEqual({ from: '2026-05-01', to: '2026-05-31' });
    });

    it('returns the previous calendar month (offset -1)', () => {
      const range = computeWindowRange('month', new Date(2026, 4, 28), -1);
      expect(range).toEqual({ from: '2026-04-01', to: '2026-04-30' });
    });

    it('crosses years correctly going backwards', () => {
      const range = computeWindowRange('month', new Date(2026, 0, 15), -1);
      expect(range).toEqual({ from: '2025-12-01', to: '2025-12-31' });
    });
  });

  describe('quarter filter', () => {
    it('returns the natural quarter containing the anchor (offset 0)', () => {
      const range = computeWindowRange('quarter', new Date(2026, 4, 28), 0);
      expect(range).toEqual({ from: '2026-04-01', to: '2026-06-30' });
    });

    it('returns the previous quarter (offset -1)', () => {
      const range = computeWindowRange('quarter', new Date(2026, 4, 28), -1);
      expect(range).toEqual({ from: '2026-01-01', to: '2026-03-31' });
    });

    it('crosses years going backwards from Q1', () => {
      const range = computeWindowRange('quarter', new Date(2026, 1, 15), -1);
      expect(range).toEqual({ from: '2025-10-01', to: '2025-12-31' });
    });
  });

  describe('semester filter', () => {
    it('returns Jan-Jun or Jul-Dec containing the anchor (offset 0)', () => {
      const range = computeWindowRange('semester', new Date(2026, 4, 28), 0);
      expect(range).toEqual({ from: '2026-01-01', to: '2026-06-30' });
    });

    it('returns the previous semester (offset -1)', () => {
      const range = computeWindowRange('semester', new Date(2026, 4, 28), -1);
      expect(range).toEqual({ from: '2025-07-01', to: '2025-12-31' });
    });

    it('handles the second semester correctly', () => {
      const range = computeWindowRange('semester', new Date(2026, 9, 15), 0);
      expect(range).toEqual({ from: '2026-07-01', to: '2026-12-31' });
    });
  });

  describe('year filter', () => {
    it('returns Jan 1 to Dec 31 of the anchor year (offset 0)', () => {
      const range = computeWindowRange('year', new Date(2026, 4, 28), 0);
      expect(range).toEqual({ from: '2026-01-01', to: '2026-12-31' });
    });

    it('returns the previous year (offset -1)', () => {
      const range = computeWindowRange('year', new Date(2026, 4, 28), -1);
      expect(range).toEqual({ from: '2025-01-01', to: '2025-12-31' });
    });
  });

  describe('ytd filter', () => {
    it('returns Jan 1 to anchor (inclusive)', () => {
      const range = computeWindowRange('ytd', new Date(2026, 4, 28), 0);
      expect(range).toEqual({ from: '2026-01-01', to: '2026-05-28' });
    });

    it('ignores offsetUnits and always returns YTD', () => {
      const range = computeWindowRange('ytd', new Date(2026, 4, 28), -5);
      expect(range).toEqual({ from: '2026-01-01', to: '2026-05-28' });
    });
  });
});

describe('isLatestWindow', () => {
  it('returns true when today is within the range', () => {
    expect(isLatestWindow({ from: '2026-05-25', to: '2026-05-31' }, new Date(2026, 4, 28))).toBe(
      true,
    );
  });

  it('returns true when today equals the boundary', () => {
    expect(isLatestWindow({ from: '2026-05-25', to: '2026-05-31' }, new Date(2026, 4, 25))).toBe(
      true,
    );
    expect(isLatestWindow({ from: '2026-05-25', to: '2026-05-31' }, new Date(2026, 4, 31))).toBe(
      true,
    );
  });

  it('returns false when today is after the range', () => {
    expect(isLatestWindow({ from: '2026-05-25', to: '2026-05-31' }, new Date(2026, 5, 1))).toBe(
      false,
    );
  });

  it('returns false when today is before the range', () => {
    expect(isLatestWindow({ from: '2026-05-25', to: '2026-05-31' }, new Date(2026, 4, 24))).toBe(
      false,
    );
  });
});
