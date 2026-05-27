import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { RepositoryProvider } from '@/data/RepositoryProvider';
import type { HealthDay } from '@/domain/health/healthDay';
import { createMockRepo } from '@/test/createMockRepo';

import { ActivityPanel } from './ActivityPanel';

function renderPanel(days: HealthDay[]) {
  return render(
    <RepositoryProvider repo={createMockRepo({ listHealthDays: async () => days })}>
      <ActivityPanel />
    </RepositoryProvider>,
  );
}

const sampleDays: HealthDay[] = [
  { date: '2026-05-24', steps: 8000, distanceKm: 6 },
  { date: '2026-05-25', steps: 10000, distanceKm: 7.5 },
  { date: '2026-05-26', steps: 12000, distanceKm: 9 },
];

describe('<ActivityPanel />', () => {
  it('renders steps and distance charts when health data exists', async () => {
    const { container } = renderPanel(sampleDays);
    await screen.findByRole('img', { name: /pasos/i });
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2);
  });

  it('shows totals and daily averages', async () => {
    renderPanel(sampleDays);
    // total steps 30000, avg 10000/day
    expect(await screen.findByText(/30000 pasos/)).toBeInTheDocument();
    expect(screen.getByText(/media 10000\/día/)).toBeInTheDocument();
  });

  it('overlays a 7-day moving average on the steps chart', async () => {
    const { container } = renderPanel(sampleDays);
    await screen.findByRole('img', { name: /pasos/i });
    expect(container.querySelector('.chart-line--overlay')).toBeInTheDocument();
  });

  it('switches the window when selecting "Trimestre"', async () => {
    renderPanel(sampleDays);
    await screen.findByRole('img', { name: /pasos/i });
    fireEvent.click(screen.getByRole('button', { name: 'Trimestre' }));
    expect(screen.getByRole('button', { name: 'Trimestre' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('renders an empty state with a hint to import from Settings when there is no data', async () => {
    renderPanel([]);
    expect(await screen.findByText(/ajustes/i)).toBeInTheDocument();
  });
});
