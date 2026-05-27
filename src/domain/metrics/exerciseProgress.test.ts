import { describe, it, expect } from 'vitest';

import type {
  BodyweightExercise,
  CardioExercise,
  Session,
  StrengthExercise,
  StrengthSet,
  TimeExercise,
} from '@/domain/types';

import { buildExerciseProgress } from './exerciseProgress';

function strength(typeId: string, sets: StrengthSet[]): StrengthExercise {
  return { id: `${typeId}-${sets[0]?.id ?? 'x'}`, typeId, order: 0, shape: 'strength', sets };
}

function session(startedAt: string, exercises: Session['exercises']): Session {
  return { id: startedAt, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises };
}

describe('buildExerciseProgress', () => {
  it('builds a 1RM series for a strength exercise across sessions', () => {
    const progress = buildExerciseProgress(
      [
        session('2026-02-05T12:00:00.000Z', [
          strength('press-banca', [{ id: 'b', reps: 5, weightKg: 90 }]),
        ]),
        session('2026-01-05T12:00:00.000Z', [
          strength('press-banca', [{ id: 'a', reps: 1, weightKg: 100 }]),
        ]),
      ],
      'press-banca',
    );
    expect(progress.primaryMetric).toBe('oneRepMax');
    const series = progress.series.oneRepMax!;
    expect(series.map((p) => p.date)).toEqual([
      '2026-01-05T12:00:00.000Z',
      '2026-02-05T12:00:00.000Z',
    ]);
    expect(series[0].value).toBeCloseTo(100, 6);
    expect(series[1].value).toBeCloseTo(105, 6);
  });

  it('exposes maxWeight, volume and reps as available metrics for strength', () => {
    const progress = buildExerciseProgress(
      [
        session('2026-01-05T12:00:00.000Z', [
          strength('press-banca', [{ id: 'a', reps: 5, weightKg: 80 }]),
        ]),
      ],
      'press-banca',
    );
    expect(progress.availableMetrics).toEqual(['oneRepMax', 'maxWeight', 'volume', 'reps']);
    expect(progress.series.maxWeight![0].value).toBe(80);
    expect(progress.series.volume![0].value).toBe(400);
    expect(progress.series.reps![0].value).toBe(5);
  });

  it('uses reps as primary for bodyweight without weight', () => {
    const flexiones: BodyweightExercise = {
      id: 'f',
      typeId: 'flexiones',
      order: 0,
      shape: 'bodyweight',
      sets: [
        { id: 's1', reps: 20 },
        { id: 's2', reps: 18 },
      ],
    };
    const progress = buildExerciseProgress(
      [session('2026-01-05T12:00:00.000Z', [flexiones])],
      'flexiones',
    );
    expect(progress.primaryMetric).toBe('reps');
    expect(progress.series.oneRepMax).toBeUndefined();
    expect(progress.series.reps![0].value).toBe(20);
    expect(progress.series.volume![0].value).toBe(38);
  });

  it('uses duration for a time exercise (plank)', () => {
    const plancha: TimeExercise = {
      id: 'p',
      typeId: 'plancha',
      order: 0,
      shape: 'time',
      sets: [
        { id: 's1', reps: 1, durationSeconds: 30 },
        { id: 's2', reps: 1, durationSeconds: 45 },
      ],
    };
    const progress = buildExerciseProgress(
      [session('2026-01-05T12:00:00.000Z', [plancha])],
      'plancha',
    );
    expect(progress.primaryMetric).toBe('duration');
    expect(progress.series.duration![0].value).toBe(45);
  });

  it('uses distance for a cardio exercise', () => {
    const correr: CardioExercise = {
      id: 'c',
      typeId: 'correr',
      order: 0,
      shape: 'cardio',
      cardio: { durationMinutes: 30, distanceKm: 5 },
    };
    const progress = buildExerciseProgress(
      [session('2026-01-05T12:00:00.000Z', [correr])],
      'correr',
    );
    expect(progress.primaryMetric).toBe('distance');
    expect(progress.series.distance![0].value).toBe(5);
    expect(progress.series.duration![0].value).toBe(30);
  });

  it('combines multiple occurrences of the same exercise within one session', () => {
    const progress = buildExerciseProgress(
      [
        session('2026-01-05T12:00:00.000Z', [
          strength('press-banca', [{ id: 'a', reps: 5, weightKg: 80 }]),
          strength('press-banca', [{ id: 'b', reps: 3, weightKg: 100 }]),
        ]),
      ],
      'press-banca',
    );
    expect(progress.series.oneRepMax!).toHaveLength(1);
    expect(progress.series.maxWeight![0].value).toBe(100);
    expect(progress.series.volume![0].value).toBe(700); // 5*80 + 3*100
    expect(progress.series.reps![0].value).toBe(5);
  });

  it('returns empty series when the exercise was never performed', () => {
    const progress = buildExerciseProgress(
      [
        session('2026-01-05T12:00:00.000Z', [
          strength('curl-biceps', [{ id: 'a', reps: 5, weightKg: 20 }]),
        ]),
      ],
      'press-banca',
    );
    expect(progress.availableMetrics).toEqual([]);
    expect(progress.series).toEqual({});
  });
});
