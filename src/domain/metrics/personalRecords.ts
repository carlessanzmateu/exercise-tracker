import { getExerciseTypeById } from '@/domain/catalog';
import type { Session } from '@/domain/types';

import { estimateOneRepMax } from './oneRepMax';

export interface PersonalRecord {
  typeId: string;
  name: string;
  bestWeightKg: number;
  bestWeightAt: string;
  bestOneRepMax: number;
  bestOneRepMaxAt: string;
}

interface Accumulator {
  bestWeightKg: number;
  bestWeightAt: string;
  bestOneRepMax: number | null;
  bestOneRepMaxAt: string;
}

export function personalRecords(sessions: Session[]): PersonalRecord[] {
  // Orden ascendente para que, ante empates, gane la fecha más temprana (comparación estricta).
  const ordered = [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  const byType = new Map<string, Accumulator>();

  for (const session of ordered) {
    for (const exercise of session.exercises) {
      if (exercise.shape === 'cardio') continue;
      for (const set of exercise.sets) {
        const weightKg = 'weightKg' in set ? set.weightKg : undefined;
        if (typeof weightKg !== 'number' || weightKg <= 0) continue;

        const acc = byType.get(exercise.typeId);
        const oneRepMax = estimateOneRepMax(weightKg, set.reps);

        if (!acc) {
          byType.set(exercise.typeId, {
            bestWeightKg: weightKg,
            bestWeightAt: session.startedAt,
            bestOneRepMax: oneRepMax,
            bestOneRepMaxAt: session.startedAt,
          });
          continue;
        }

        if (weightKg > acc.bestWeightKg) {
          acc.bestWeightKg = weightKg;
          acc.bestWeightAt = session.startedAt;
        }
        if (oneRepMax !== null && (acc.bestOneRepMax === null || oneRepMax > acc.bestOneRepMax)) {
          acc.bestOneRepMax = oneRepMax;
          acc.bestOneRepMaxAt = session.startedAt;
        }
      }
    }
  }

  const records: PersonalRecord[] = [];
  for (const [typeId, acc] of byType.entries()) {
    const name = getExerciseTypeById(typeId)?.name ?? typeId;
    // Si ninguna serie permitió estimar 1RM (p. ej. todas con reps > 12), usar el mejor peso.
    const bestOneRepMax = acc.bestOneRepMax ?? acc.bestWeightKg;
    const bestOneRepMaxAt = acc.bestOneRepMax === null ? acc.bestWeightAt : acc.bestOneRepMaxAt;
    records.push({
      typeId,
      name,
      bestWeightKg: acc.bestWeightKg,
      bestWeightAt: acc.bestWeightAt,
      bestOneRepMax,
      bestOneRepMaxAt,
    });
  }

  return records.sort((a, b) => a.name.localeCompare(b.name));
}
