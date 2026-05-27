import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { CardioExercise, Session, StrengthExercise } from '@/domain/types';

import { CardioPanel } from './CardioPanel';

function cardio(typeId: string, durationMinutes: number, distanceKm?: number): CardioExercise {
  return {
    id: `${typeId}-x`,
    typeId,
    order: 0,
    shape: 'cardio',
    cardio: { durationMinutes, distanceKm },
  };
}

function strength(typeId: string): StrengthExercise {
  return {
    id: `${typeId}-s`,
    typeId,
    order: 0,
    shape: 'strength',
    sets: [{ id: 'a', reps: 5, weightKg: 50 }],
  };
}

function session(startedAt: string, exercises: Session['exercises']): Session {
  return { id: startedAt, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises };
}

const sessions: Session[] = [
  session('2026-01-05T12:00:00.000Z', [cardio('correr', 30, 5)]),
  session('2026-02-05T12:00:00.000Z', [cardio('caminar', 20, 2)]),
];

describe('<CardioPanel />', () => {
  it('shows total distance and duration', () => {
    render(<CardioPanel sessions={sessions} />);
    expect(screen.getByText(/7 km/)).toBeInTheDocument();
    expect(screen.getByText(/50 min/)).toBeInTheDocument();
  });

  it('renders a distance line chart over time', () => {
    const { container } = render(<CardioPanel sessions={sessions} />);
    expect(container.querySelector('path.chart-line')).toBeInTheDocument();
  });

  it('renders an empty state when there is no cardio', () => {
    render(
      <CardioPanel sessions={[session('2026-01-05T12:00:00.000Z', [strength('press-banca')])]} />,
    );
    expect(screen.getByText(/sin datos/i)).toBeInTheDocument();
  });
});
