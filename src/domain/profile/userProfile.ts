export type Sex = 'male' | 'female';

export interface UserProfile {
  heightCm: number; // > 0, finito
  birthdate: string; // 'YYYY-MM-DD' (no futuro, edad >= 5)
  sex: Sex;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MIN_AGE_YEARS = 5;

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isSex(value: unknown): value is Sex {
  return value === 'male' || value === 'female';
}

function parseBirthdate(value: string): Date | null {
  if (!DATE_RE.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d ||
    Number.isNaN(date.getTime())
  ) {
    return null;
  }
  return date;
}

// Edad en años completos respetando mes y día. 0 si la fecha es futura.
export function computeAgeYears(birthdate: string, today: Date = new Date()): number {
  const birth = parseBirthdate(birthdate);
  if (!birth) return 0;
  if (birth.getTime() > today.getTime()) return 0;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

// Devuelve un UserProfile normalizado, o null si la entrada no es válida.
export function normalizeUserProfile(input: unknown, today: Date = new Date()): UserProfile | null {
  if (typeof input !== 'object' || input === null) return null;
  const { heightCm, birthdate, sex } = input as Record<string, unknown>;

  if (!isPositiveFiniteNumber(heightCm)) return null;
  if (typeof birthdate !== 'string') return null;

  const birth = parseBirthdate(birthdate);
  if (!birth) return null;
  if (birth.getTime() > today.getTime()) return null;
  if (computeAgeYears(birthdate, today) < MIN_AGE_YEARS) return null;

  if (!isSex(sex)) return null;

  return { heightCm, birthdate, sex };
}
