import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { BodyweightExercise, Session, StrengthExercise, StrengthSet } from '@/domain/types';

import { MuscleVolumePanel } from './MuscleVolumePanel';

function strength(typeId: string, sets: StrengthSet[]): StrengthExercise {
  return { id: `${typeId}-x`, typeId, order: 0, shape: 'strength', sets };
}

function session(startedAt: string, exercises: Session['exercises']): Session {
  return { id: startedAt, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises };
}

const sessions: Session[] = [
  session('2026-01-05T12:00:00.000Z', [
    strength('press-banca', [{ id: 'a', reps: 1, weightKg: 100 }]), // Pecho 100
    strength('prensa-piernas', [{ id: 'b', reps: 10, weightKg: 100 }]), // Piernas 1000
  ]),
];

describe('<MuscleVolumePanel />', () => {
  it('renders one bar per category with volume', () => {
    const { container } = render(<MuscleVolumePanel sessions={sessions} />);
    expect(container.querySelectorAll('rect.chart-bar')).toHaveLength(2);
  });

  it('orders categories by volume descending', () => {
    const { container } = render(<MuscleVolumePanel sessions={sessions} />);
    const labels = Array.from(container.querySelectorAll('.chart-tick--x')).map(
      (el) => el.textContent,
    );
    expect(labels).toEqual(['Piernas', 'Pecho']);
  });

  it('renders an empty state when there is no weighted volume', () => {
    const flexiones: BodyweightExercise = {
      id: 'f',
      typeId: 'flexiones',
      order: 0,
      shape: 'bodyweight',
      sets: [{ id: 's', reps: 20 }],
    };
    render(<MuscleVolumePanel sessions={[session('2026-01-05T12:00:00.000Z', [flexiones])]} />);
    expect(screen.getByText(/sin datos/i)).toBeInTheDocument();
  });
});
