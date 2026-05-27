import { getExerciseTypeById } from './catalog';
import type { BodyweightSet, CardioData, Exercise, Session, StrengthSet, TimeSet } from './types';

export function newSession({ now }: { now: Date }): Session {
  const iso = now.toISOString();
  return {
    id: crypto.randomUUID(),
    startedAt: iso,
    createdAt: iso,
    updatedAt: iso,
    exercises: [],
  };
}

export function newExercise(typeId: string, order: number, cardio?: CardioData): Exercise {
  const type = getExerciseTypeById(typeId);
  if (!type) {
    throw new Error(`Tipo de ejercicio desconocido: "${typeId}"`);
  }

  const base = { id: crypto.randomUUID(), typeId, order };

  switch (type.shape) {
    case 'strength':
      return { ...base, shape: 'strength', sets: [] };
    case 'bodyweight':
      return { ...base, shape: 'bodyweight', sets: [] };
    case 'time':
      return { ...base, shape: 'time', sets: [] };
    case 'cardio':
      if (!cardio) {
        throw new Error(
          `Crear un ejercicio cardio (typeId "${typeId}") requiere su CardioData inicial`,
        );
      }
      return { ...base, shape: 'cardio', cardio };
  }
}

export function newSetForShape(
  shape: 'strength',
  input: { reps: number; weightKg: number },
): StrengthSet;
export function newSetForShape(
  shape: 'bodyweight',
  input: { reps: number; weightKg?: number },
): BodyweightSet;
export function newSetForShape(
  shape: 'time',
  input: { reps: number; durationSeconds: number },
): TimeSet;
export function newSetForShape(
  shape: 'strength' | 'bodyweight' | 'time',
  input: { reps: number; weightKg?: number; durationSeconds?: number },
): StrengthSet | BodyweightSet | TimeSet {
  const id = crypto.randomUUID();

  if (shape === 'strength') {
    if (input.reps < 0) throw new Error('strength.reps debe ser >= 0');
    if (input.weightKg === undefined || input.weightKg < 0) {
      throw new Error('strength.weightKg es obligatorio y debe ser >= 0');
    }
    return { id, reps: input.reps, weightKg: input.weightKg };
  }

  if (shape === 'bodyweight') {
    if (input.reps < 0) throw new Error('bodyweight.reps debe ser >= 0');
    if (input.weightKg !== undefined && input.weightKg < 0) {
      throw new Error('bodyweight.weightKg, si está presente, debe ser >= 0');
    }
    const set: BodyweightSet = { id, reps: input.reps };
    if (input.weightKg !== undefined) {
      set.weightKg = input.weightKg;
    }
    return set;
  }

  // shape === 'time'
  if (input.reps <= 0) throw new Error('time.reps debe ser > 0');
  if (input.durationSeconds === undefined || input.durationSeconds <= 0) {
    throw new Error('time.durationSeconds es obligatorio y debe ser > 0');
  }
  return { id, reps: input.reps, durationSeconds: input.durationSeconds };
}

export function newCardioBlock(input: {
  durationMinutes: number;
  distanceKm?: number;
}): CardioData {
  if (input.durationMinutes <= 0) {
    throw new Error('cardio.durationMinutes debe ser > 0');
  }
  if (input.distanceKm !== undefined && input.distanceKm < 0) {
    throw new Error('cardio.distanceKm, si está presente, debe ser >= 0');
  }
  const block: CardioData = { durationMinutes: input.durationMinutes };
  if (input.distanceKm !== undefined) {
    block.distanceKm = input.distanceKm;
  }
  return block;
}
