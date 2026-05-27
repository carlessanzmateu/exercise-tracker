import { describe, it, expect } from 'vitest';
import type {
  ExerciseShape,
  ExerciseType,
  Session,
  Exercise,
  StrengthExercise,
  BodyweightExercise,
  TimeExercise,
  CardioExercise,
  StrengthSet,
  BodyweightSet,
  TimeSet,
  CardioData,
} from '@/domain/types';

describe('domain types', () => {
  it('ExerciseShape accepts the 4 defined values', () => {
    const shapes: ExerciseShape[] = ['strength', 'bodyweight', 'time', 'cardio'];
    expect(shapes).toHaveLength(4);
  });

  it('ExerciseType describes a catalogue entry', () => {
    const type: ExerciseType = {
      id: 'prensa',
      name: 'Prensa de piernas',
      category: 'Piernas',
      shape: 'strength',
    };
    expect(type.shape).toBe('strength');
  });

  it('StrengthSet requires reps and weightKg', () => {
    const set: StrengthSet = { id: 's1', reps: 10, weightKg: 80 };
    expect(set.reps).toBe(10);
    expect(set.weightKg).toBe(80);
  });

  it('BodyweightSet allows an optional weightKg', () => {
    const withWeight: BodyweightSet = { id: 'b1', reps: 12, weightKg: 5 };
    const withoutWeight: BodyweightSet = { id: 'b2', reps: 15 };
    expect(withWeight.weightKg).toBe(5);
    expect(withoutWeight.weightKg).toBeUndefined();
  });

  it('TimeSet requires reps and durationSeconds', () => {
    const set: TimeSet = { id: 't1', reps: 1, durationSeconds: 60 };
    expect(set.durationSeconds).toBe(60);
  });

  it('CardioData requires durationMinutes and allows an optional distanceKm', () => {
    const withDistance: CardioData = { durationMinutes: 30, distanceKm: 5 };
    const noDistance: CardioData = { durationMinutes: 30 };
    expect(withDistance.distanceKm).toBe(5);
    expect(noDistance.distanceKm).toBeUndefined();
  });

  it('Exercise is a discriminated union by shape (strength/bodyweight/time/cardio)', () => {
    const strength: StrengthExercise = {
      id: 'e1',
      typeId: 'prensa',
      order: 0,
      shape: 'strength',
      sets: [{ id: 's1', reps: 10, weightKg: 80 }],
    };
    const bodyweight: BodyweightExercise = {
      id: 'e2',
      typeId: 'flexiones',
      order: 1,
      shape: 'bodyweight',
      sets: [{ id: 'b1', reps: 15 }],
    };
    const time: TimeExercise = {
      id: 'e3',
      typeId: 'plancha',
      order: 2,
      shape: 'time',
      sets: [{ id: 't1', reps: 1, durationSeconds: 60 }],
    };
    const cardio: CardioExercise = {
      id: 'e4',
      typeId: 'correr',
      order: 3,
      shape: 'cardio',
      cardio: { durationMinutes: 30, distanceKm: 5 },
    };

    const exercises: Exercise[] = [strength, bodyweight, time, cardio];

    let strengthCount = 0;
    let bodyweightCount = 0;
    let timeCount = 0;
    let cardioCount = 0;
    for (const ex of exercises) {
      switch (ex.shape) {
        case 'strength':
          strengthCount += ex.sets.length;
          break;
        case 'bodyweight':
          bodyweightCount += ex.sets.length;
          break;
        case 'time':
          timeCount += ex.sets.length;
          break;
        case 'cardio':
          cardioCount += ex.cardio.durationMinutes;
          break;
      }
    }
    expect(strengthCount).toBe(1);
    expect(bodyweightCount).toBe(1);
    expect(timeCount).toBe(1);
    expect(cardioCount).toBe(30);
  });

  it('Session contains id, startedAt, createdAt, updatedAt and exercises', () => {
    const session: Session = {
      id: 'sess1',
      startedAt: '2026-05-25T10:30:00.000+02:00',
      createdAt: '2026-05-25T10:30:00.000+02:00',
      updatedAt: '2026-05-25T10:30:00.000+02:00',
      exercises: [],
    };
    expect(session.id).toBe('sess1');
    expect(session.exercises).toEqual([]);
  });
});
