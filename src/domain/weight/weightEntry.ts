export interface WeightEntry {
  id: string; // UUID v4
  recordedAt: string; // ISO 8601 local: 'YYYY-MM-DDTHH:mm:ss' (o variantes)
  weightKg: number; // > 0, finito, hasta 1 decimal
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isParseableDate(value: string): boolean {
  if (value.length === 0) return false;
  const ms = new Date(value).getTime();
  return !Number.isNaN(ms);
}

function roundTo1Decimal(value: number): number {
  return Math.round(value * 10) / 10;
}

// Devuelve un WeightEntry normalizado o null si la entrada es inválida.
// Si `id` falta o es vacío, se genera con crypto.randomUUID().
export function normalizeWeightEntry(input: unknown): WeightEntry | null {
  if (typeof input !== 'object' || input === null) return null;
  const { id, recordedAt, weightKg } = input as Record<string, unknown>;

  if (typeof recordedAt !== 'string' || !isParseableDate(recordedAt)) return null;
  if (!isPositiveFiniteNumber(weightKg)) return null;

  const finalId = typeof id === 'string' && id.length > 0 ? id : crypto.randomUUID();

  return {
    id: finalId,
    recordedAt,
    weightKg: roundTo1Decimal(weightKg),
  };
}
