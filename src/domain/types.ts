export type ExerciseShape = 'strength' | 'bodyweight' | 'time' | 'cardio';

export interface ExerciseType {
  id: string;
  name: string;
  category: string;
  shape: ExerciseShape;
}

export interface StrengthSet {
  id: string;
  reps: number;
  weightKg: number;
}

export interface BodyweightSet {
  id: string;
  reps: number;
  weightKg?: number;
}

export interface TimeSet {
  id: string;
  reps: number;
  durationSeconds: number;
}

export type ExerciseSet = StrengthSet | BodyweightSet | TimeSet;

export interface CardioData {
  durationMinutes: number;
  distanceKm?: number;
}

interface BaseExercise {
  id: string;
  typeId: string;
  order: number;
}

export interface StrengthExercise extends BaseExercise {
  shape: 'strength';
  sets: StrengthSet[];
}

export interface BodyweightExercise extends BaseExercise {
  shape: 'bodyweight';
  sets: BodyweightSet[];
}

export interface TimeExercise extends BaseExercise {
  shape: 'time';
  sets: TimeSet[];
}

export interface CardioExercise extends BaseExercise {
  shape: 'cardio';
  cardio: CardioData;
}

export type Exercise = StrengthExercise | BodyweightExercise | TimeExercise | CardioExercise;

export interface Session {
  id: string;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
  exercises: Exercise[];
}
