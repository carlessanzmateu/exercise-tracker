import { getExerciseTypeById } from '@/domain/catalog';
import type { ExerciseShape, Session } from '@/domain/types';

import { estimateOneRepMax } from './oneRepMax';

export type ProgressMetric =
  | 'oneRepMax'
  | 'maxWeight'
  | 'volume'
  | 'reps'
  | 'duration'
  | 'distance';

export interface ProgressPoint {
  date: string;
  value: number;
}

export interface ExerciseProgress {
  shape: ExerciseShape;
  availableMetrics: ProgressMetric[];
  primaryMetric: ProgressMetric;
  series: Partial<Record<ProgressMetric, ProgressPoint[]>>;
}

type SessionValues = Partial<Record<ProgressMetric, number>>;

interface BranchConfig {
  candidates: ProgressMetric[];
  primary: ProgressMetric;
  weightedVolume: boolean;
}

function resolveBranch(shape: ExerciseShape, anyWeighted: boolean): BranchConfig {
  switch (shape) {
    case 'strength':
      return {
        candidates: ['oneRepMax', 'maxWeight', 'volume', 'reps'],
        primary: 'oneRepMax',
        weightedVolume: true,
      };
    case 'bodyweight':
      return anyWeighted
        ? {
            candidates: ['oneRepMax', 'maxWeight', 'volume', 'reps'],
            primary: 'oneRepMax',
            weightedVolume: true,
          }
        : { candidates: ['reps', 'volume'], primary: 'reps', weightedVolume: false };
    case 'time':
      return { candidates: ['duration', 'reps'], primary: 'duration', weightedVolume: false };
    case 'cardio':
      return { candidates: ['distance', 'duration'], primary: 'distance', weightedVolume: false };
  }
}

function sessionValues(session: Session, typeId: string, weightedVolume: boolean): SessionValues {
  const matches = session.exercises.filter((e) => e.typeId === typeId);
  if (matches.length === 0) return {};

  // Cardio: sin series; combinar ocurrencias por suma.
  if (matches.every((e) => e.shape === 'cardio')) {
    let duration = 0;
    let distance = 0;
    let hasDistance = false;
    for (const exercise of matches) {
      if (exercise.shape !== 'cardio') continue;
      duration += exercise.cardio.durationMinutes;
      if (exercise.cardio.distanceKm !== undefined) {
        distance += exercise.cardio.distanceKm;
        hasDistance = true;
      }
    }
    const values: SessionValues = { duration };
    if (hasDistance) values.distance = distance;
    return values;
  }

  // Series: combinar ocurrencias (máx para "mejor", suma para volumen).
  let maxWeight: number | undefined;
  let oneRepMax: number | undefined;
  let volumeKg = 0;
  let volumeReps = 0;
  let repsMax = 0;
  let durationMax = 0;

  for (const exercise of matches) {
    if (exercise.shape === 'cardio') continue;
    for (const set of exercise.sets) {
      repsMax = Math.max(repsMax, set.reps);
      volumeReps += set.reps;
      const weightKg = 'weightKg' in set ? set.weightKg : undefined;
      if (typeof weightKg === 'number' && weightKg > 0) {
        maxWeight = Math.max(maxWeight ?? 0, weightKg);
        volumeKg += set.reps * weightKg;
        const estimate = estimateOneRepMax(weightKg, set.reps);
        if (estimate !== null) oneRepMax = Math.max(oneRepMax ?? 0, estimate);
      }
      if ('durationSeconds' in set) durationMax = Math.max(durationMax, set.durationSeconds);
    }
  }

  const values: SessionValues = { reps: repsMax, volume: weightedVolume ? volumeKg : volumeReps };
  if (oneRepMax !== undefined) values.oneRepMax = oneRepMax;
  if (maxWeight !== undefined) values.maxWeight = maxWeight;
  if (durationMax > 0) values.duration = durationMax;
  return values;
}

export function buildExerciseProgress(sessions: Session[], typeId: string): ExerciseProgress {
  const shape = getExerciseTypeById(typeId)?.shape ?? 'strength';

  const matchingSessions = sessions
    .filter((s) => s.exercises.some((e) => e.typeId === typeId))
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  const anyWeighted = matchingSessions.some((s) =>
    s.exercises.some(
      (e) =>
        e.typeId === typeId &&
        e.shape !== 'cardio' &&
        e.sets.some(
          (set) => 'weightKg' in set && typeof set.weightKg === 'number' && set.weightKg > 0,
        ),
    ),
  );

  const { candidates, primary, weightedVolume } = resolveBranch(shape, anyWeighted);

  const series: Partial<Record<ProgressMetric, ProgressPoint[]>> = {};
  for (const session of matchingSessions) {
    const values = sessionValues(session, typeId, weightedVolume);
    for (const metric of candidates) {
      const value = values[metric];
      if (value === undefined) continue;
      (series[metric] ??= []).push({ date: session.startedAt, value });
    }
  }

  const availableMetrics = candidates.filter((m) => (series[m]?.length ?? 0) > 0);
  const primaryMetric = availableMetrics.includes(primary)
    ? primary
    : (availableMetrics[0] ?? primary);

  return { shape, availableMetrics, primaryMetric, series };
}
