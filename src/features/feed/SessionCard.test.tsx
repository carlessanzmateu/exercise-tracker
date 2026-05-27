import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { CardioExercise, Session, StrengthExercise, StrengthSet } from '@/domain/types';

import { SessionCard } from './SessionCard';

function makeStrengthExercise(id: string, order: number, sets: StrengthSet[]): StrengthExercise {
  return { id, typeId: 'press-banca', order, shape: 'strength', sets };
}

function makeCardio(id: string, order: number): CardioExercise {
  return {
    id,
    typeId: 'correr',
    order,
    shape: 'cardio',
    cardio: { durationMinutes: 20 },
  };
}

function makeSession(exercisesCount: number): Session {
  const exercises = Array.from({ length: exercisesCount }, (_, i) =>
    i % 2 === 0 ? makeStrengthExercise(`ex-${i}`, i, []) : makeCardio(`ex-${i}`, i),
  );
  return {
    id: 'session-1',
    startedAt: '2026-05-25T10:30:00.000Z',
    createdAt: '2026-05-25T10:30:00.000Z',
    updatedAt: '2026-05-25T10:30:00.000Z',
    exercises,
  };
}

describe('<SessionCard /> card classes (F2-T005)', () => {
  it('root element has class "card" and "card--interactive"', () => {
    const { container } = render(<SessionCard session={makeSession(1)} />);
    const root = container.firstElementChild;
    expect(root).toHaveClass('card');
    expect(root).toHaveClass('card--interactive');
  });
});

describe('<SessionCard />', () => {
  it('shows "4 ejercicios" when there are 4 exercises', () => {
    render(<SessionCard session={makeSession(4)} />);
    expect(screen.getByText('4 ejercicios')).toBeInTheDocument();
  });

  it('shows "1 ejercicio" (singular) when there is only one exercise', () => {
    render(<SessionCard session={makeSession(1)} />);
    expect(screen.getByText('1 ejercicio')).toBeInTheDocument();
    expect(screen.queryByText('1 ejercicios')).not.toBeInTheDocument();
  });

  it('shows "0 ejercicios" when the session is empty', () => {
    render(<SessionCard session={makeSession(0)} />);
    expect(screen.getByText('0 ejercicios')).toBeInTheDocument();
  });

  it('renders a <time> element with the startedAt ISO in its datetime attribute', () => {
    const { container } = render(<SessionCard session={makeSession(2)} />);
    const time = container.querySelector('time');
    expect(time).toBeInTheDocument();
    expect(time).toHaveAttribute('datetime', '2026-05-25T10:30:00.000Z');
    // Visible text is the formatted date (exact format is locked in T029).
    expect(time?.textContent ?? '').not.toBe('');
  });
});
