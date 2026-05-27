import { describe, it, expect } from 'vitest';

import type { BodyweightExercise, Session, StrengthExercise, StrengthSet } from '@/domain/types';

import { volumeByCategory, tonnageByPeriod } from './volume';

function strength(typeId: string, sets: StrengthSet[]): StrengthExercise {
  return { id: `${typeId}-x`, typeId, order: 0, shape: 'strength', sets };
}

function session(startedAt: string, exercises: Session['exercises']): Session {
  return { id: startedAt, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises };
}

describe('volumeByCategory', () => {
  it('sums reps*weight per category for weighted sets', () => {
    const result = volumeByCategory([
      session('2026-01-05T12:00:00.000Z', [
        // Pecho: 10*50 + 8*60 = 980
        strength('press-banca', [
          { id: 'a', reps: 10, weightKg: 50 },
          { id: 'b', reps: 8, weightKg: 60 },
        ]),
        // Piernas: 12*100 = 1200
        strength('prensa-piernas', [{ id: 'c', reps: 12, weightKg: 100 }]),
      ]),
    ]);
    const byCat = Object.fromEntries(result.map((r) => [r.category, r.volumeKg]));
    expect(byCat['Pecho']).toBe(980);
    expect(byCat['Piernas']).toBe(1200);
  });

  it('ignores bodyweight sets without weight', () => {
    const flexiones: BodyweightExercise = {
      id: 'f',
      typeId: 'flexiones',
      order: 0,
      shape: 'bodyweight',
      sets: [{ id: 's', reps: 20 }],
    };
    const result = volumeByCategory([session('2026-01-05T12:00:00.000Z', [flexiones])]);
    expect(result.find((r) => r.category === 'Autocarga')).toBeUndefined();
  });

  it('sorts categories by volume descending', () => {
    const result = volumeByCategory([
      session('2026-01-05T12:00:00.000Z', [
        strength('press-banca', [{ id: 'a', reps: 1, weightKg: 100 }]), // Pecho 100
        strength('prensa-piernas', [{ id: 'b', reps: 10, weightKg: 100 }]), // Piernas 1000
      ]),
    ]);
    expect(result.map((r) => r.category)).toEqual(['Piernas', 'Pecho']);
  });

  it('returns empty array for no sessions', () => {
    expect(volumeByCategory([])).toEqual([]);
  });
});

describe('tonnageByPeriod', () => {
  it('aggregates tonnage per month with gap filling', () => {
    const result = tonnageByPeriod(
      [
        session('2026-01-05T12:00:00.000Z', [
          strength('press-banca', [{ id: 'a', reps: 10, weightKg: 50 }]), // 500
        ]),
        session('2026-03-10T12:00:00.000Z', [
          strength('prensa-piernas', [{ id: 'b', reps: 10, weightKg: 100 }]), // 1000
        ]),
      ],
      'month',
    );
    expect(result.map((b) => b.key)).toEqual(['2026-01', '2026-02', '2026-03']);
    expect(result.map((b) => b.tonnageKg)).toEqual([500, 0, 1000]);
  });

  it('returns empty array for no sessions', () => {
    expect(tonnageByPeriod([], 'month')).toEqual([]);
  });
});
