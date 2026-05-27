import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { Session } from '@/domain/types';

import { FrequencyPanel } from './FrequencyPanel';

function makeSession(startedAt: string): Session {
  return { id: startedAt, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises: [] };
}

const sessions: Session[] = [
  makeSession('2026-01-10T12:00:00.000Z'),
  makeSession('2026-01-20T12:00:00.000Z'),
  makeSession('2026-04-05T12:00:00.000Z'),
];

describe('<FrequencyPanel />', () => {
  it('renders monthly bars by default', () => {
    render(<FrequencyPanel sessions={sessions} />);
    expect(screen.getByText('Ene 2026')).toBeInTheDocument();
    expect(screen.getByText('Abr 2026')).toBeInTheDocument();
  });

  it('switches aggregation when selecting "Trimestre"', () => {
    render(<FrequencyPanel sessions={sessions} />);
    fireEvent.click(screen.getByRole('button', { name: 'Trimestre' }));
    expect(screen.getByText('T1 2026')).toBeInTheDocument();
    expect(screen.getByText('T2 2026')).toBeInTheDocument();
  });

  it('shows the average line and a textual average', () => {
    const { container } = render(<FrequencyPanel sessions={sessions} />);
    expect(container.querySelector('.chart-average')).toBeInTheDocument();
    expect(screen.getByText(/media/i)).toBeInTheDocument();
  });

  it('renders an empty state when there are no sessions', () => {
    render(<FrequencyPanel sessions={[]} />);
    expect(screen.getByText(/sin datos/i)).toBeInTheDocument();
  });
});
