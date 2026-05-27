import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { RepositoryProvider } from '@/data/RepositoryProvider';
import type { Session } from '@/domain/types';
import { createMockRepo } from '@/test/createMockRepo';

import { Progress } from './Progress';

function makeSession(id: string, startedAt: string): Session {
  return { id, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises: [] };
}

function renderProgressWith(repo = createMockRepo()) {
  return render(
    <MemoryRouter>
      <RepositoryProvider repo={repo}>
        <Progress />
      </RepositoryProvider>
    </MemoryRouter>,
  );
}

describe('<Progress /> shell', () => {
  it('shows a loading state initially', () => {
    renderProgressWith(createMockRepo({ list: () => new Promise(() => {}) }));
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows an empty state with a CTA to /new when there are no sessions', async () => {
    renderProgressWith(createMockRepo({ list: async () => [] }));
    const cta = await screen.findByRole('link', { name: /añadir entrenamiento/i });
    expect(cta).toHaveAttribute('href', '/new');
  });

  it('renders the panel sections when sessions exist', async () => {
    renderProgressWith(
      createMockRepo({ list: async () => [makeSession('s-1', '2026-05-01T10:00:00.000Z')] }),
    );
    await screen.findByText(/frecuencia/i);
    for (const panel of [
      'frequency',
      'exercise',
      'prs',
      'muscle-volume',
      'cardio',
      'tonnage',
      'activity',
    ]) {
      expect(document.querySelector(`[data-panel="${panel}"]`)).not.toBeNull();
    }
  });
});
