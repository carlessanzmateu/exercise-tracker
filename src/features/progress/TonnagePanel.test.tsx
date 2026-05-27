import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { BodyweightExercise, Session, StrengthExercise, StrengthSet } from '@/domain/types';

import { TonnagePanel } from './TonnagePanel';

function strength(typeId: string, sets: StrengthSet[]): StrengthExercise {
  return { id: `${typeId}-x`, typeId, order: 0, shape: 'strength', sets };
}

function session(startedAt: string, exercises: Session['exercises']): Session {
  return { id: startedAt, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises };
}

const sessions: Session[] = [
  session('2026-01-05T12:00:00.000Z', [
    strength('press-banca', [{ id: 'a', reps: 10, weightKg: 50 }]),
  ]),
  session('2026-03-05T12:00:00.000Z', [
    strength('prensa-piernas', [{ id: 'b', reps: 10, weightKg: 100 }]),
  ]),
];

describe('<TonnagePanel />', () => {
  it('renders monthly tonnage bars', () => {
    const { container } = render(<TonnagePanel sessions={sessions} />);
    // Jan, Feb (gap), Mar → 3 bars
    expect(container.querySelectorAll('rect.chart-bar')).toHaveLength(3);
  });

  it('formats values in kg', () => {
    const { container } = render(<TonnagePanel sessions={sessions} />);
    const yLabels = Array.from(container.querySelectorAll('.chart-tick--y')).map(
      (el) => el.textContent ?? '',
    );
    expect(yLabels.some((t) => /kg/.test(t))).toBe(true);
  });

  it('renders an empty state when there is no weighted volume', () => {
    const flexiones: BodyweightExercise = {
      id: 'f',
      typeId: 'flexiones',
      order: 0,
      shape: 'bodyweight',
      sets: [{ id: 's', reps: 20 }],
    };
    render(<TonnagePanel sessions={[session('2026-01-05T12:00:00.000Z', [flexiones])]} />);
    expect(screen.getByText(/sin datos/i)).toBeInTheDocument();
  });
});
