import { describe, it, expect } from 'vitest';

import type { CardioExercise, Session, StrengthExercise } from '@/domain/types';

import { cardioTotals, cardioByPeriod } from './cardio';

function cardio(typeId: string, durationMinutes: number, distanceKm?: number): CardioExercise {
  return {
    id: `${typeId}-x`,
    typeId,
    order: 0,
    shape: 'cardio',
    cardio: { durationMinutes, distanceKm },
  };
}

function strength(typeId: string): StrengthExercise {
  return {
    id: `${typeId}-s`,
    typeId,
    order: 0,
    shape: 'strength',
    sets: [{ id: 'a', reps: 5, weightKg: 50 }],
  };
}

function session(startedAt: string, exercises: Session['exercises']): Session {
  return { id: startedAt, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises };
}

describe('cardioTotals', () => {
  it('sums total distance and duration across cardio blocks', () => {
    const result = cardioTotals([
      session('2026-01-05T12:00:00.000Z', [cardio('correr', 30, 5), cardio('caminar', 20, 2)]),
    ]);
    expect(result.totalDurationMinutes).toBe(50);
    expect(result.totalDistanceKm).toBe(7);
  });

  it('treats missing distance as zero', () => {
    const result = cardioTotals([session('2026-01-05T12:00:00.000Z', [cardio('correr', 30)])]);
    expect(result.totalDistanceKm).toBe(0);
    expect(result.totalDurationMinutes).toBe(30);
  });

  it('ignores non-cardio exercises', () => {
    const result = cardioTotals([session('2026-01-05T12:00:00.000Z', [strength('press-banca')])]);
    expect(result).toEqual({ totalDistanceKm: 0, totalDurationMinutes: 0 });
  });
});

describe('cardioByPeriod', () => {
  it('aggregates cardio per month with gap filling', () => {
    const result = cardioByPeriod(
      [
        session('2026-01-05T12:00:00.000Z', [cardio('correr', 30, 5)]),
        session('2026-03-10T12:00:00.000Z', [cardio('caminar', 20, 2)]),
      ],
      'month',
    );
    expect(result.map((b) => b.key)).toEqual(['2026-01', '2026-02', '2026-03']);
    expect(result.map((b) => b.distanceKm)).toEqual([5, 0, 2]);
    expect(result.map((b) => b.durationMinutes)).toEqual([30, 0, 20]);
  });

  it('returns empty array for no cardio', () => {
    expect(cardioByPeriod([], 'month')).toEqual([]);
  });
});
