import type {
  BodyweightExercise,
  BodyweightSet,
  StrengthExercise,
  StrengthSet,
  TimeExercise,
  TimeSet,
} from '@/domain/types';

type SetBasedExercise = StrengthExercise | BodyweightExercise | TimeExercise;

function describeStrengthSet(set: StrengthSet): string {
  return `${set.reps} reps · ${set.weightKg} kg`;
}

function describeBodyweightSet(set: BodyweightSet): string {
  if (set.weightKg !== undefined) {
    return `${set.reps} reps · ${set.weightKg} kg`;
  }
  return `${set.reps} reps`;
}

function describeTimeSet(set: TimeSet): string {
  return `${set.reps} reps · ${set.durationSeconds} s`;
}

function describeSet(exercise: SetBasedExercise, index: number): string {
  const set = exercise.sets[index]!;
  switch (exercise.shape) {
    case 'strength':
      return describeStrengthSet(set as StrengthSet);
    case 'bodyweight':
      return describeBodyweightSet(set as BodyweightSet);
    case 'time':
      return describeTimeSet(set as TimeSet);
  }
}

export function ExerciseSetsList({ exercise }: { exercise: SetBasedExercise }) {
  return (
    <ol className="sets-list">
      {exercise.sets.map((set, idx) => (
        <li key={set.id}>
          <span className="sets-list__label">Serie {idx + 1}</span>
          <span className="sets-list__data">{describeSet(exercise, idx)}</span>
        </li>
      ))}
    </ol>
  );
}
