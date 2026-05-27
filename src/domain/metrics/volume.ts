import { getExerciseTypeById } from '@/domain/catalog';
import type { Session } from '@/domain/types';

import { bucketKeyLabel, periodIndex, type Granularity } from './frequency';

export interface CategoryVolume {
  category: string;
  volumeKg: number;
}

export interface TonnageBucket {
  key: string;
  label: string;
  tonnageKg: number;
}

interface WeightedSet {
  typeId: string;
  startedAt: string;
  volumeKg: number;
}

// Recorre todas las series con peso (reps · weightKg > 0). La autocarga sin peso
// y los ejercicios de tiempo/cardio no aportan kg.
function weightedSets(sessions: Session[]): WeightedSet[] {
  const result: WeightedSet[] = [];
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (exercise.shape === 'cardio') continue;
      for (const set of exercise.sets) {
        const weightKg = 'weightKg' in set ? set.weightKg : undefined;
        if (typeof weightKg === 'number' && weightKg > 0) {
          result.push({
            typeId: exercise.typeId,
            startedAt: session.startedAt,
            volumeKg: set.reps * weightKg,
          });
        }
      }
    }
  }
  return result;
}

export function volumeByCategory(sessions: Session[]): CategoryVolume[] {
  const byCategory = new Map<string, number>();
  for (const { typeId, volumeKg } of weightedSets(sessions)) {
    const category = getExerciseTypeById(typeId)?.category;
    if (!category) continue;
    byCategory.set(category, (byCategory.get(category) ?? 0) + volumeKg);
  }

  return [...byCategory.entries()]
    .map(([category, volumeKg]) => ({ category, volumeKg }))
    .filter((entry) => entry.volumeKg > 0)
    .sort((a, b) => b.volumeKg - a.volumeKg);
}

export function tonnageByPeriod(sessions: Session[], granularity: Granularity): TonnageBucket[] {
  const sets = weightedSets(sessions);
  if (sets.length === 0) return [];

  const byIndex = new Map<number, number>();
  for (const { startedAt, volumeKg } of sets) {
    const index = periodIndex(new Date(startedAt), granularity);
    byIndex.set(index, (byIndex.get(index) ?? 0) + volumeKg);
  }

  const indices = [...byIndex.keys()];
  const min = Math.min(...indices);
  const max = Math.max(...indices);

  const buckets: TonnageBucket[] = [];
  for (let index = min; index <= max; index += 1) {
    const { key, label } = bucketKeyLabel(index, granularity);
    buckets.push({ key, label, tonnageKg: byIndex.get(index) ?? 0 });
  }
  return buckets;
}
