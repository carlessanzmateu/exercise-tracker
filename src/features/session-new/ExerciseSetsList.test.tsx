import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { BodyweightExercise, StrengthExercise, TimeExercise } from '@/domain/types';

import { ExerciseSetsList } from './ExerciseSetsList';

function strength(sets: StrengthExercise['sets']): StrengthExercise {
  return { id: 'ex-1', typeId: 'press-banca', order: 0, shape: 'strength', sets };
}

function bodyweight(sets: BodyweightExercise['sets']): BodyweightExercise {
  return { id: 'ex-2', typeId: 'flexiones', order: 0, shape: 'bodyweight', sets };
}

function timeExercise(sets: TimeExercise['sets']): TimeExercise {
  return { id: 'ex-3', typeId: 'plancha', order: 0, shape: 'time', sets };
}

describe('<ExerciseSetsList />', () => {
  it('renders "Serie 1", "Serie 2", "Serie 3" for a strength exercise with 3 sets', () => {
    const exercise = strength([
      { id: 's-1', reps: 8, weightKg: 60 },
      { id: 's-2', reps: 6, weightKg: 65 },
      { id: 's-3', reps: 5, weightKg: 70 },
    ]);
    render(<ExerciseSetsList exercise={exercise} />);

    expect(screen.getByText(/serie 1/i)).toBeInTheDocument();
    expect(screen.getByText(/serie 2/i)).toBeInTheDocument();
    expect(screen.getByText(/serie 3/i)).toBeInTheDocument();
    expect(screen.queryByText(/serie 4/i)).not.toBeInTheDocument();
  });

  it('shows the data of each strength set (reps + weight)', () => {
    const exercise = strength([{ id: 's-1', reps: 8, weightKg: 60 }]);
    render(<ExerciseSetsList exercise={exercise} />);

    expect(screen.getByText(/8.*reps/i)).toBeInTheDocument();
    expect(screen.getByText(/60.*kg/i)).toBeInTheDocument();
  });

  it('shows weight on a bodyweight set only when it is provided', () => {
    const exercise = bodyweight([
      { id: 's-1', reps: 10 },
      { id: 's-2', reps: 8, weightKg: 5 },
    ]);
    const { container } = render(<ExerciseSetsList exercise={exercise} />);

    expect(screen.getByText('Serie 1')).toBeInTheDocument();
    expect(screen.getByText('Serie 2')).toBeInTheDocument();
    expect(container.textContent).toContain('5');
    expect(container.textContent).toMatch(/kg/);
  });

  it('shows duration in seconds for time sets', () => {
    const exercise = timeExercise([{ id: 's-1', reps: 3, durationSeconds: 30 }]);
    render(<ExerciseSetsList exercise={exercise} />);

    expect(screen.getByText('Serie 1')).toBeInTheDocument();
    expect(screen.getByText(/30.*s(eg|$)/i)).toBeInTheDocument();
  });

  it('renders nothing when the sets list is empty (no list items)', () => {
    const { container } = render(<ExerciseSetsList exercise={strength([])} />);
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });
});
