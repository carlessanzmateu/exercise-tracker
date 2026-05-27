import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { BodyweightExercise, Session, StrengthExercise, StrengthSet } from '@/domain/types';

import { ExerciseProgressPanel } from './ExerciseProgressPanel';

function strength(typeId: string, sets: StrengthSet[]): StrengthExercise {
  return { id: `${typeId}-x`, typeId, order: 0, shape: 'strength', sets };
}

function flexiones(reps: number): BodyweightExercise {
  return { id: 'f', typeId: 'flexiones', order: 0, shape: 'bodyweight', sets: [{ id: 's', reps }] };
}

function session(startedAt: string, exercises: Session['exercises']): Session {
  return { id: startedAt, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises };
}

describe('<ExerciseProgressPanel />', () => {
  it('lists only exercises that have recorded data', () => {
    render(
      <ExerciseProgressPanel
        sessions={[
          session('2026-01-05T12:00:00.000Z', [
            strength('press-banca', [{ id: 'a', reps: 5, weightKg: 80 }]),
            strength('curl-biceps', [{ id: 'b', reps: 8, weightKg: 20 }]),
          ]),
        ]}
      />,
    );
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options.map((o) => o.textContent)).toEqual([
      'Curl de bíceps (polea o mancuerna)',
      'Press banca (barra)',
    ]);
  });

  it('shows the 1RM line chart by default for a strength exercise', () => {
    const { container } = render(
      <ExerciseProgressPanel
        sessions={[
          session('2026-01-05T12:00:00.000Z', [
            strength('press-banca', [{ id: 'a', reps: 5, weightKg: 80 }]),
          ]),
        ]}
      />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1RM' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches the metric when a toggle is clicked', () => {
    render(
      <ExerciseProgressPanel
        sessions={[
          session('2026-01-05T12:00:00.000Z', [
            strength('press-banca', [{ id: 'a', reps: 5, weightKg: 80 }]),
          ]),
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Volumen' }));
    expect(screen.getByRole('button', { name: 'Volumen' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '1RM' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('changes the chart when a different exercise is selected', () => {
    render(
      <ExerciseProgressPanel
        sessions={[
          session('2026-01-05T12:00:00.000Z', [
            strength('press-banca', [{ id: 'a', reps: 5, weightKg: 80 }]),
            flexiones(20),
          ]),
        ]}
      />,
    );
    // Default is "Flexiones" (sorted by name) → reps metric, no 1RM toggle.
    expect(screen.queryByRole('button', { name: '1RM' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'press-banca' } });
    expect(screen.getByRole('button', { name: '1RM' })).toBeInTheDocument();
  });

  it('renders an empty state when no exercise has data', () => {
    render(<ExerciseProgressPanel sessions={[]} />);
    expect(screen.getByText(/sin datos|sin ejercicios/i)).toBeInTheDocument();
  });
});

describe('<ExerciseProgressPanel /> projection (F3-T016)', () => {
  const growing: Session[] = [
    session('2026-01-01T12:00:00.000Z', [
      strength('press-banca', [{ id: 'a', reps: 1, weightKg: 100 }]),
    ]),
    session('2026-01-15T12:00:00.000Z', [
      strength('press-banca', [{ id: 'b', reps: 1, weightKg: 105 }]),
    ]),
    session('2026-02-01T12:00:00.000Z', [
      strength('press-banca', [{ id: 'c', reps: 1, weightKg: 110 }]),
    ]),
  ];

  it('shows a projection band and a "próximo mes" range with 3+ data points', () => {
    const { container } = render(<ExerciseProgressPanel sessions={growing} />);
    expect(container.querySelector('.chart-band')).toBeInTheDocument();
    expect(screen.getByText(/próximo mes/i)).toBeInTheDocument();
  });

  it('shows the monthly improvement rate text', () => {
    render(<ExerciseProgressPanel sessions={growing} />);
    expect(screen.getByText(/\/mes/i)).toBeInTheDocument();
  });

  it('hides the projection and shows a hint with fewer than 3 points', () => {
    const { container } = render(<ExerciseProgressPanel sessions={[growing[0], growing[1]]} />);
    expect(container.querySelector('.chart-band')).not.toBeInTheDocument();
    expect(screen.getByText(/al menos 3/i)).toBeInTheDocument();
  });

  it('recomputes the projection when the metric toggle changes', () => {
    const { container } = render(<ExerciseProgressPanel sessions={growing} />);
    fireEvent.click(screen.getByRole('button', { name: 'Volumen' }));
    expect(container.querySelector('.chart-band')).toBeInTheDocument();
    expect(screen.getByText(/próximo mes/i)).toBeInTheDocument();
  });
});
