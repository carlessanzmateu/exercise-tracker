import { describe, expect, it } from 'vitest';

import { computeAgeYears, normalizeUserProfile } from './userProfile';

describe('normalizeUserProfile', () => {
  const today = new Date('2026-05-28T12:00:00');

  it('normalizes a valid profile', () => {
    const result = normalizeUserProfile(
      { heightCm: 175, birthdate: '1990-05-26', sex: 'male' },
      today,
    );
    expect(result).toEqual({ heightCm: 175, birthdate: '1990-05-26', sex: 'male' });
  });

  it('returns null when heightCm is missing, non-positive, or non-finite', () => {
    const base = { birthdate: '1990-05-26', sex: 'female' as const };
    expect(normalizeUserProfile({ ...base }, today)).toBeNull();
    expect(normalizeUserProfile({ ...base, heightCm: 0 }, today)).toBeNull();
    expect(normalizeUserProfile({ ...base, heightCm: -10 }, today)).toBeNull();
    expect(normalizeUserProfile({ ...base, heightCm: Number.POSITIVE_INFINITY }, today)).toBeNull();
    expect(normalizeUserProfile({ ...base, heightCm: Number.NaN }, today)).toBeNull();
    expect(normalizeUserProfile({ ...base, heightCm: '175' }, today)).toBeNull();
  });

  it('returns null when birthdate is malformed or in the future', () => {
    const base = { heightCm: 175, sex: 'male' as const };
    expect(normalizeUserProfile({ ...base, birthdate: '1990/05/26' }, today)).toBeNull();
    expect(normalizeUserProfile({ ...base, birthdate: 'not-a-date' }, today)).toBeNull();
    expect(normalizeUserProfile({ ...base, birthdate: '' }, today)).toBeNull();
    expect(normalizeUserProfile({ ...base, birthdate: '2099-01-01' }, today)).toBeNull();
  });

  it('returns null when birthdate implies age < 5', () => {
    const result = normalizeUserProfile(
      { heightCm: 120, birthdate: '2023-01-01', sex: 'female' },
      today,
    );
    expect(result).toBeNull();
  });

  it('returns null when sex is not "male" or "female"', () => {
    const base = { heightCm: 175, birthdate: '1990-05-26' };
    expect(normalizeUserProfile({ ...base }, today)).toBeNull();
    expect(normalizeUserProfile({ ...base, sex: 'other' }, today)).toBeNull();
    expect(normalizeUserProfile({ ...base, sex: '' }, today)).toBeNull();
    expect(normalizeUserProfile({ ...base, sex: 1 }, today)).toBeNull();
  });
});

describe('computeAgeYears', () => {
  it('returns full years respecting month and day', () => {
    // Birthday already passed this year.
    expect(computeAgeYears('1990-01-15', new Date('2026-05-28'))).toBe(36);
    // Birthday not yet this year.
    expect(computeAgeYears('1990-12-15', new Date('2026-05-28'))).toBe(35);
    // Birthday today.
    expect(computeAgeYears('1990-05-28', new Date('2026-05-28'))).toBe(36);
    // Day before birthday.
    expect(computeAgeYears('1990-05-29', new Date('2026-05-28'))).toBe(35);
  });

  it('returns 0 when birthdate is in the future', () => {
    expect(computeAgeYears('2099-01-01', new Date('2026-05-28'))).toBe(0);
  });
});
