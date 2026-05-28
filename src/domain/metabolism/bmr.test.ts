import { describe, expect, it } from 'vitest';

import type { UserProfile } from '@/domain/profile/userProfile';

import { computeBmrMifflinStJeor, computeTodaysBmr } from './bmr';

describe('computeBmrMifflinStJeor', () => {
  it('matches the textbook value for a male example (75 kg, 175 cm, 35 y)', () => {
    // 10*75 + 6.25*175 - 5*35 + 5 = 750 + 1093.75 - 175 + 5 = 1673.75
    const bmr = computeBmrMifflinStJeor({
      weightKg: 75,
      heightCm: 175,
      ageYears: 35,
      sex: 'male',
    });
    expect(bmr).toBeCloseTo(1673.75, 5);
  });

  it('matches the textbook value for a female example (65 kg, 165 cm, 30 y)', () => {
    // 10*65 + 6.25*165 - 5*30 - 161 = 650 + 1031.25 - 150 - 161 = 1370.25
    const bmr = computeBmrMifflinStJeor({
      weightKg: 65,
      heightCm: 165,
      ageYears: 30,
      sex: 'female',
    });
    expect(bmr).toBeCloseTo(1370.25, 5);
  });

  it('throws RangeError for non-finite or non-positive inputs', () => {
    const base = { weightKg: 75, heightCm: 175, ageYears: 35, sex: 'male' as const };
    expect(() => computeBmrMifflinStJeor({ ...base, weightKg: 0 })).toThrow(RangeError);
    expect(() => computeBmrMifflinStJeor({ ...base, weightKg: -5 })).toThrow(RangeError);
    expect(() => computeBmrMifflinStJeor({ ...base, weightKg: Number.NaN })).toThrow(RangeError);
    expect(() => computeBmrMifflinStJeor({ ...base, heightCm: 0 })).toThrow(RangeError);
    expect(() => computeBmrMifflinStJeor({ ...base, ageYears: -1 })).toThrow(RangeError);
    expect(() => computeBmrMifflinStJeor({ ...base, heightCm: Number.POSITIVE_INFINITY })).toThrow(
      RangeError,
    );
  });

  it('is a pure function (same inputs → same output, no side effects)', () => {
    const input = { weightKg: 80, heightCm: 180, ageYears: 40, sex: 'male' as const };
    const a = computeBmrMifflinStJeor(input);
    const b = computeBmrMifflinStJeor(input);
    expect(a).toBe(b);
    // No mutation of the input object.
    expect(input).toEqual({ weightKg: 80, heightCm: 180, ageYears: 40, sex: 'male' });
  });

  it('accepts ageYears = 0 (just-born baseline, defensive)', () => {
    // Not a realistic case, but the formula is defined for any non-negative age.
    const bmr = computeBmrMifflinStJeor({
      weightKg: 75,
      heightCm: 175,
      ageYears: 0,
      sex: 'male',
    });
    expect(bmr).toBeCloseTo(10 * 75 + 6.25 * 175 + 5, 5);
  });
});

describe('computeTodaysBmr', () => {
  const profile: UserProfile = {
    heightCm: 175,
    birthdate: '1990-05-26',
    sex: 'male',
  };

  it('returns null when profile is null', () => {
    expect(
      computeTodaysBmr({ profile: null, latestWeightKg: 75, today: new Date(2026, 4, 28) }),
    ).toBeNull();
  });

  it('returns null when latestWeightKg is null', () => {
    expect(
      computeTodaysBmr({ profile, latestWeightKg: null, today: new Date(2026, 4, 28) }),
    ).toBeNull();
  });

  it('returns the BMR using profile + latest weight + today', () => {
    // 2026-05-28: age = 36 (birthday 26 may already passed).
    // 10*75 + 6.25*175 - 5*36 + 5 = 750 + 1093.75 - 180 + 5 = 1668.75
    const bmr = computeTodaysBmr({
      profile,
      latestWeightKg: 75,
      today: new Date(2026, 4, 28),
    });
    expect(bmr).toBeCloseTo(1668.75, 5);
  });

  it('uses computeAgeYears with the provided today', () => {
    // 2026-05-25: birthday not yet (26 may), age = 35.
    // 10*75 + 6.25*175 - 5*35 + 5 = 1673.75
    const bmr = computeTodaysBmr({
      profile,
      latestWeightKg: 75,
      today: new Date(2026, 4, 25),
    });
    expect(bmr).toBeCloseTo(1673.75, 5);
  });
});
