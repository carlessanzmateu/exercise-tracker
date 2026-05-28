import type { HealthDay } from './healthDay';

export type HealthMetric = 'steps' | 'distance';

export interface HealthSample {
  metric: HealthMetric;
  date: string;
  value: number;
}

interface DayAccumulator {
  steps: number;
  distanceKm: number;
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidSample(sample: unknown): sample is HealthSample {
  if (typeof sample !== 'object' || sample === null) return false;
  const { metric, date, value } = sample as Record<string, unknown>;
  if (metric !== 'steps' && metric !== 'distance') return false;
  if (typeof date !== 'string') return false;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return false;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return false;
  return true;
}

export function aggregateSamplesToDays(samples: HealthSample[]): HealthDay[] {
  const byDay = new Map<string, DayAccumulator>();

  for (const sample of samples) {
    if (!isValidSample(sample)) continue;
    const dayKey = toLocalDateKey(new Date(sample.date));
    const acc = byDay.get(dayKey) ?? { steps: 0, distanceKm: 0 };
    if (sample.metric === 'steps') {
      acc.steps += sample.value;
    } else {
      acc.distanceKm += sample.value;
    }
    byDay.set(dayKey, acc);
  }

  return [...byDay.entries()]
    .map(([date, { steps, distanceKm }]) => ({
      date,
      steps: Math.round(steps),
      distanceKm,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
