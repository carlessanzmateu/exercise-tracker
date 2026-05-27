import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { BodyweightExercise, Session, StrengthExercise, StrengthSet } from '@/domain/types';

import { PersonalRecordsPanel } from './PersonalRecordsPanel';

function strength(typeId: string, sets: StrengthSet[]): StrengthExercise {
  return { id: `${typeId}-x`, typeId, order: 0, shape: 'strength', sets };
}

function session(startedAt: string, exercises: Session['exercises']): Session {
  return { id: startedAt, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises };
}

describe('<PersonalRecordsPanel />', () => {
  it('renders a row per exercise with a personal record', () => {
    const { container } = render(
      <PersonalRecordsPanel
        sessions={[
          session('2026-01-05T12:00:00.000Z', [
            strength('press-banca', [{ id: 'a', reps: 1, weightKg: 100 }]),
            strength('curl-biceps', [{ id: 'b', reps: 5, weightKg: 20 }]),
          ]),
        ]}
      />,
    );
    expect(container.querySelectorAll('[data-pr]')).toHaveLength(2);
    expect(screen.getByText('Press banca (barra)')).toBeInTheDocument();
  });

  it('shows best weight and best estimated 1RM with their dates', () => {
    render(
      <PersonalRecordsPanel
        sessions={[
          session('2026-01-05T12:00:00.000Z', [
            strength('press-banca', [{ id: 'a', reps: 1, weightKg: 100 }]),
          ]),
        ]}
      />,
    );
    expect(screen.getByText(/mejor peso/i)).toBeInTheDocument();
    expect(screen.getByText(/1rm/i)).toBeInTheDocument();
    expect(screen.getAllByText(/100 kg/).length).toBeGreaterThan(0);
  });

  it('renders an empty state when there are no weighted exercises', () => {
    const flexiones: BodyweightExercise = {
      id: 'f',
      typeId: 'flexiones',
      order: 0,
      shape: 'bodyweight',
      sets: [{ id: 's', reps: 20 }],
    };
    render(<PersonalRecordsPanel sessions={[session('2026-01-05T12:00:00.000Z', [flexiones])]} />);
    expect(screen.getByText(/sin records|aún no hay records/i)).toBeInTheDocument();
  });
});
