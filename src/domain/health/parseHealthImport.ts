import { normalizeHealthDay, type HealthDay } from './healthDay';

export const HEALTH_IMPORT_VERSION = 1;

export class InvalidHealthImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidHealthImportError';
  }
}

export class UnsupportedHealthImportVersionError extends Error {
  constructor(public readonly receivedVersion: unknown) {
    super(`Versión de importación de Salud no soportada: ${String(receivedVersion)}`);
    this.name = 'UnsupportedHealthImportVersionError';
  }
}

export function parseHealthImport(payload: unknown): HealthDay[] {
  if (typeof payload !== 'object' || payload === null) {
    throw new InvalidHealthImportError('El payload debe ser un objeto');
  }
  const candidate = payload as Record<string, unknown>;

  if (candidate.version !== HEALTH_IMPORT_VERSION) {
    throw new UnsupportedHealthImportVersionError(candidate.version);
  }
  if (!Array.isArray(candidate.days)) {
    throw new InvalidHealthImportError('El payload no contiene "days" como array');
  }

  const byDate = new Map<string, HealthDay>();
  for (const raw of candidate.days) {
    const day = normalizeHealthDay(raw);
    if (day) byDate.set(day.date, day); // la última ocurrencia gana
  }

  if (byDate.size === 0) {
    throw new InvalidHealthImportError('No hay días de actividad válidos en el fichero');
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
