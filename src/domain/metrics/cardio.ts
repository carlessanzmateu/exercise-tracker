import type { Session } from '@/domain/types';

import { bucketKeyLabel, periodIndex, type Granularity } from './frequency';

export interface CardioTotals {
  totalDistanceKm: number;
  totalDurationMinutes: number;
}

export interface CardioBucket {
  key: string;
  label: string;
  distanceKm: number;
  durationMinutes: number;
}

export function cardioTotals(sessions: Session[]): CardioTotals {
  let totalDistanceKm = 0;
  let totalDurationMinutes = 0;
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (exercise.shape !== 'cardio') continue;
      totalDurationMinutes += exercise.cardio.durationMinutes;
      totalDistanceKm += exercise.cardio.distanceKm ?? 0;
    }
  }
  return { totalDistanceKm, totalDurationMinutes };
}

export function cardioByPeriod(sessions: Session[], granularity: Granularity): CardioBucket[] {
  const byIndex = new Map<number, { distanceKm: number; durationMinutes: number }>();
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (exercise.shape !== 'cardio') continue;
      const index = periodIndex(new Date(session.startedAt), granularity);
      const entry = byIndex.get(index) ?? { distanceKm: 0, durationMinutes: 0 };
      entry.durationMinutes += exercise.cardio.durationMinutes;
      entry.distanceKm += exercise.cardio.distanceKm ?? 0;
      byIndex.set(index, entry);
    }
  }

  if (byIndex.size === 0) return [];

  const indices = [...byIndex.keys()];
  const min = Math.min(...indices);
  const max = Math.max(...indices);

  const buckets: CardioBucket[] = [];
  for (let index = min; index <= max; index += 1) {
    const { key, label } = bucketKeyLabel(index, granularity);
    const entry = byIndex.get(index) ?? { distanceKm: 0, durationMinutes: 0 };
    buckets.push({
      key,
      label,
      distanceKm: entry.distanceKm,
      durationMinutes: entry.durationMinutes,
    });
  }
  return buckets;
}
