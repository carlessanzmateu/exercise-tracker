import { computeAgeYears, type Sex, type UserProfile } from '@/domain/profile/userProfile';

// Función pura. Diseñada para reutilizarse en fase 7 (TDEE/balance energético)
// sin modificar: la fase 7 envolverá esta función con `computeTdee(bmr, activityKcal)`.

export interface BmrInput {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: Sex;
}

function ensurePositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`BMR input "${name}" must be a positive finite number, got ${value}`);
  }
}

function ensureNonNegativeFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`BMR input "${name}" must be a non-negative finite number, got ${value}`);
  }
}

// Mifflin-St Jeor (kcal/día). NO redondea; el llamante decide cómo mostrarlo.
export function computeBmrMifflinStJeor(input: BmrInput): number {
  ensurePositiveFinite(input.weightKg, 'weightKg');
  ensurePositiveFinite(input.heightCm, 'heightCm');
  ensureNonNegativeFinite(input.ageYears, 'ageYears');

  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.ageYears;
  return input.sex === 'male' ? base + 5 : base - 161;
}

// Compositor: perfil + último peso + reloj → BMR (o null si falta algo).
export function computeTodaysBmr(args: {
  profile: UserProfile | null;
  latestWeightKg: number | null;
  today?: Date;
}): number | null {
  if (args.profile === null) return null;
  if (args.latestWeightKg === null) return null;
  const today = args.today ?? new Date();
  return computeBmrMifflinStJeor({
    weightKg: args.latestWeightKg,
    heightCm: args.profile.heightCm,
    ageYears: computeAgeYears(args.profile.birthdate, today),
    sex: args.profile.sex,
  });
}
