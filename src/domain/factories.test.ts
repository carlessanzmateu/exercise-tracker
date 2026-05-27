import { describe, it, expect } from 'vitest';
import { newCardioBlock, newExercise, newSession, newSetForShape } from '@/domain/factories';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('newSession', () => {
  it('produces a session with a valid UUID v4 id', () => {
    const session = newSession({ now: new Date('2026-05-25T10:30:00.000Z') });
    expect(session.id).toMatch(UUID_V4_REGEX);
  });

  it('startedAt, createdAt and updatedAt match the injected now in ISO 8601 format', () => {
    const now = new Date('2026-05-25T10:30:00.000Z');
    const session = newSession({ now });
    expect(session.startedAt).toBe(now.toISOString());
    expect(session.createdAt).toBe(now.toISOString());
    expect(session.updatedAt).toBe(now.toISOString());
  });

  it('createdAt === updatedAt === startedAt at creation time', () => {
    const session = newSession({ now: new Date('2026-05-25T10:30:00.000Z') });
    expect(session.startedAt).toBe(session.createdAt);
    expect(session.createdAt).toBe(session.updatedAt);
  });

  it('exercises is an empty array', () => {
    const session = newSession({ now: new Date('2026-05-25T10:30:00.000Z') });
    expect(session.exercises).toEqual([]);
  });

  it('produces a different id on each call', () => {
    const now = new Date('2026-05-25T10:30:00.000Z');
    const a = newSession({ now });
    const b = newSession({ now });
    expect(a.id).not.toBe(b.id);
  });
});

describe('newExercise', () => {
  it('throws when typeId does not exist in the catalogue', () => {
    expect(() => newExercise('no-existe', 0)).toThrow();
  });

  it('creates a StrengthExercise with sets: [] for "strength" shape types', () => {
    const ex = newExercise('press-banca', 0);
    expect(ex.shape).toBe('strength');
    expect(ex.typeId).toBe('press-banca');
    expect(ex.order).toBe(0);
    if (ex.shape === 'strength') {
      expect(ex.sets).toEqual([]);
    }
  });

  it('creates a BodyweightExercise with sets: [] for "bodyweight" shape types', () => {
    const ex = newExercise('flexiones', 1);
    expect(ex.shape).toBe('bodyweight');
    if (ex.shape === 'bodyweight') {
      expect(ex.sets).toEqual([]);
    }
  });

  it('creates a TimeExercise with sets: [] for Plank ("time" shape)', () => {
    const ex = newExercise('plancha', 2);
    expect(ex.shape).toBe('time');
    if (ex.shape === 'time') {
      expect(ex.sets).toEqual([]);
    }
  });

  it('creates a CardioExercise with the injected cardio data for "cardio" shape', () => {
    const ex = newExercise('correr', 3, { durationMinutes: 30, distanceKm: 5 });
    expect(ex.shape).toBe('cardio');
    if (ex.shape === 'cardio') {
      expect(ex.cardio.durationMinutes).toBe(30);
      expect(ex.cardio.distanceKm).toBe(5);
    }
  });

  it('throws for "cardio" shape without cardio data', () => {
    expect(() => newExercise('correr', 0)).toThrow();
  });

  it('produces a unique UUID v4 id between calls', () => {
    const a = newExercise('press-banca', 0);
    const b = newExercise('press-banca', 1);
    expect(a.id).not.toBe(b.id);
    expect(a.id).toMatch(UUID_V4_REGEX);
  });

  it('preserves the order argument', () => {
    const ex = newExercise('press-banca', 5);
    expect(ex.order).toBe(5);
  });
});

describe('newSetForShape', () => {
  describe('strength', () => {
    it('creates a StrengthSet with reps and weightKg', () => {
      const set = newSetForShape('strength', { reps: 10, weightKg: 80 });
      expect(set.reps).toBe(10);
      expect(set.weightKg).toBe(80);
      expect(set.id).toMatch(UUID_V4_REGEX);
    });

    it('produces a unique id between calls', () => {
      const a = newSetForShape('strength', { reps: 10, weightKg: 80 });
      const b = newSetForShape('strength', { reps: 10, weightKg: 80 });
      expect(a.id).not.toBe(b.id);
    });

    it('accepts reps and weightKg >= 0', () => {
      const set = newSetForShape('strength', { reps: 0, weightKg: 0 });
      expect(set.reps).toBe(0);
      expect(set.weightKg).toBe(0);
    });

    it('throws with negative reps', () => {
      expect(() => newSetForShape('strength', { reps: -1, weightKg: 80 })).toThrow();
    });

    it('throws with negative weightKg', () => {
      expect(() => newSetForShape('strength', { reps: 10, weightKg: -1 })).toThrow();
    });
  });

  describe('bodyweight', () => {
    it('creates a BodyweightSet with reps and weightKg', () => {
      const set = newSetForShape('bodyweight', { reps: 12, weightKg: 5 });
      expect(set.reps).toBe(12);
      expect(set.weightKg).toBe(5);
    });

    it('creates a BodyweightSet without weightKg when omitted', () => {
      const set = newSetForShape('bodyweight', { reps: 15 });
      expect(set.reps).toBe(15);
      expect(set.weightKg).toBeUndefined();
    });

    it('throws with negative reps', () => {
      expect(() => newSetForShape('bodyweight', { reps: -1 })).toThrow();
    });

    it('throws with negative weightKg', () => {
      expect(() => newSetForShape('bodyweight', { reps: 10, weightKg: -1 })).toThrow();
    });
  });

  describe('time', () => {
    it('creates a TimeSet with reps and durationSeconds', () => {
      const set = newSetForShape('time', { reps: 3, durationSeconds: 60 });
      expect(set.reps).toBe(3);
      expect(set.durationSeconds).toBe(60);
    });

    it('throws with reps <= 0', () => {
      expect(() => newSetForShape('time', { reps: 0, durationSeconds: 60 })).toThrow();
    });

    it('throws with durationSeconds <= 0', () => {
      expect(() => newSetForShape('time', { reps: 1, durationSeconds: 0 })).toThrow();
    });
  });
});

describe('newCardioBlock', () => {
  it('creates a CardioData with durationMinutes and distanceKm', () => {
    const block = newCardioBlock({ durationMinutes: 30, distanceKm: 5 });
    expect(block.durationMinutes).toBe(30);
    expect(block.distanceKm).toBe(5);
  });

  it('allows omitting distanceKm', () => {
    const block = newCardioBlock({ durationMinutes: 30 });
    expect(block.durationMinutes).toBe(30);
    expect(block.distanceKm).toBeUndefined();
  });

  it('throws with durationMinutes <= 0', () => {
    expect(() => newCardioBlock({ durationMinutes: 0 })).toThrow();
    expect(() => newCardioBlock({ durationMinutes: -1 })).toThrow();
  });

  it('throws with distanceKm < 0', () => {
    expect(() => newCardioBlock({ durationMinutes: 30, distanceKm: -1 })).toThrow();
  });
});
