export interface HealthDay {
  date: string; // 'YYYY-MM-DD' (día local)
  steps: number; // entero >= 0
  distanceKm: number; // >= 0
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

// Devuelve un HealthDay normalizado, o null si el registro no es válido.
export function normalizeHealthDay(input: unknown): HealthDay | null {
  if (typeof input !== 'object' || input === null) return null;
  const { date, steps, distanceKm } = input as Record<string, unknown>;

  if (typeof date !== 'string' || !DATE_RE.test(date)) return null;
  if (!isNonNegativeNumber(steps) || !isNonNegativeNumber(distanceKm)) return null;

  return { date, steps: Math.round(steps), distanceKm };
}
