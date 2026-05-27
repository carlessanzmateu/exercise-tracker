import { describe, it, expect } from 'vitest';

import type { BodyweightExercise, Session, StrengthExercise, StrengthSet } from '@/domain/types';

import { personalRecords } from './personalRecords';

function strength(typeId: string, sets: StrengthSet[]): StrengthExercise {
  return { id: `${typeId}-x`, typeId, order: 0, shape: 'strength', sets };
}

function session(startedAt: string, exercises: Session['exercises']): Session {
  return { id: startedAt, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises };
}

describe('personalRecords', () => {
  it('reports best weight and the date it was achieved', () => {
    const records = personalRecords([
      session('2026-01-05T12:00:00.000Z', [
        strength('press-banca', [{ id: 'a', reps: 5, weightKg: 60 }]),
      ]),
      session('2026-02-05T12:00:00.000Z', [
        strength('press-banca', [{ id: 'b', reps: 3, weightKg: 80 }]),
      ]),
    ]);
    const pr = records.find((r) => r.typeId === 'press-banca')!;
    expect(pr.bestWeightKg).toBe(80);
    expect(pr.bestWeightAt).toBe('2026-02-05T12:00:00.000Z');
    expect(pr.name).toBe('Press banca (barra)');
  });

  it('reports best estimated 1RM (may differ from best weight)', () => {
    const records = personalRecords([
      session('2026-01-05T12:00:00.000Z', [
        // 100kg x1 → 1RM 100, weight 100
        strength('press-banca', [{ id: 'a', reps: 1, weightKg: 100 }]),
      ]),
      session('2026-02-05T12:00:00.000Z', [
        // 90kg x5 → 1RM 90*(1+5/30)=105, weight 90
        strength('press-banca', [{ id: 'b', reps: 5, weightKg: 90 }]),
      ]),
    ]);
    const pr = records.find((r) => r.typeId === 'press-banca')!;
    expect(pr.bestWeightKg).toBe(100);
    expect(pr.bestWeightAt).toBe('2026-01-05T12:00:00.000Z');
    expect(pr.bestOneRepMax).toBeCloseTo(105, 6);
    expect(pr.bestOneRepMaxAt).toBe('2026-02-05T12:00:00.000Z');
  });

  it('keeps the earliest date on ties', () => {
    const records = personalRecords([
      session('2026-03-05T12:00:00.000Z', [
        strength('press-banca', [{ id: 'a', reps: 1, weightKg: 100 }]),
      ]),
      session('2026-01-05T12:00:00.000Z', [
        strength('press-banca', [{ id: 'b', reps: 1, weightKg: 100 }]),
      ]),
    ]);
    const pr = records.find((r) => r.typeId === 'press-banca')!;
    expect(pr.bestWeightAt).toBe('2026-01-05T12:00:00.000Z');
  });

  it('ignores exercises without weighted sets', () => {
    const flexiones: BodyweightExercise = {
      id: 'f',
      typeId: 'flexiones',
      order: 0,
      shape: 'bodyweight',
      sets: [{ id: 's', reps: 20 }],
    };
    const records = personalRecords([session('2026-01-05T12:00:00.000Z', [flexiones])]);
    expect(records).toEqual([]);
  });

  it('returns empty array for no sessions', () => {
    expect(personalRecords([])).toEqual([]);
  });

  it('sorts records by exercise name', () => {
    const records = personalRecords([
      session('2026-01-05T12:00:00.000Z', [
        strength('prensa-piernas', [{ id: 'a', reps: 5, weightKg: 100 }]),
        strength('curl-biceps', [{ id: 'b', reps: 5, weightKg: 20 }]),
      ]),
    ]);
    expect(records.map((r) => r.name)).toEqual([
      'Curl de bíceps (polea o mancuerna)',
      'Prensa de piernas',
    ]);
  });
});
