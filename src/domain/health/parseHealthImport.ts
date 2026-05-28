import { aggregateSamplesToDays, type HealthSample } from './aggregateSamples';
import { normalizeHealthDay, type HealthDay } from './healthDay';

export const HEALTH_IMPORT_VERSIONS = [1, 2] as const;
export type HealthImportVersion = (typeof HEALTH_IMPORT_VERSIONS)[number];

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

function isSupportedVersion(value: unknown): value is HealthImportVersion {
  return (HEALTH_IMPORT_VERSIONS as readonly number[]).includes(value as number);
}

function parseV1Days(raw: unknown): HealthDay[] {
  if (!Array.isArray(raw)) {
    throw new InvalidHealthImportError('El payload no contiene "days" como array');
  }
  const byDate = new Map<string, HealthDay>();
  for (const entry of raw) {
    const day = normalizeHealthDay(entry);
    if (day) byDate.set(day.date, day);
  }
  return [...byDate.values()];
}

function parseV2Samples(raw: unknown): HealthDay[] {
  if (!Array.isArray(raw)) {
    throw new InvalidHealthImportError('El payload no contiene "samples" como array');
  }
  return aggregateSamplesToDays(raw as HealthSample[]);
}

export function parseHealthImport(payload: unknown): HealthDay[] {
  if (typeof payload !== 'object' || payload === null) {
    throw new InvalidHealthImportError('El payload debe ser un objeto');
  }
  const candidate = payload as Record<string, unknown>;

  if (!isSupportedVersion(candidate.version)) {
    throw new UnsupportedHealthImportVersionError(candidate.version);
  }

  const days =
    candidate.version === 1 ? parseV1Days(candidate.days) : parseV2Samples(candidate.samples);

  if (days.length === 0) {
    throw new InvalidHealthImportError('No hay días de actividad válidos en el fichero');
  }

  return days.sort((a, b) => a.date.localeCompare(b.date));
}
