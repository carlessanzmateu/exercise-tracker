import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { RepositoryProvider } from '@/data/RepositoryProvider';
import type { Session } from '@/domain/types';
import { createMockRepo } from '@/test/createMockRepo';

import { Feed } from './Feed';

function makeSession(id: string, startedAt: string): Session {
  return {
    id,
    startedAt,
    createdAt: startedAt,
    updatedAt: startedAt,
    exercises: [],
  };
}

function renderFeedWith(repo = createMockRepo()) {
  return render(
    <MemoryRouter>
      <RepositoryProvider repo={repo}>
        <Feed />
      </RepositoryProvider>
    </MemoryRouter>,
  );
}

describe('<Feed /> empty state', () => {
  it('shows an empty-state message when the repository returns []', async () => {
    renderFeedWith(createMockRepo({ list: async () => [] }));

    expect(await screen.findByText(/aún no hay entrenamientos/i)).toBeInTheDocument();
  });

  it('shows an "Añadir entrenamiento" CTA linking to /new when empty', async () => {
    renderFeedWith(createMockRepo({ list: async () => [] }));

    const cta = await screen.findByRole('link', { name: /añadir entrenamiento/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/new');
  });

  it('does not render a standalone settings link (navigation moved to TabBar in F2-T007)', async () => {
    renderFeedWith(createMockRepo({ list: async () => [] }));

    await screen.findByRole('link', { name: /añadir entrenamiento/i });
    expect(screen.queryByRole('link', { name: /^ajustes$/i })).not.toBeInTheDocument();
  });
});

describe('<Feed /> with sessions', () => {
  it('renders N cards in the order returned by the repo', async () => {
    const newest = makeSession('s-new', '2026-05-26T10:00:00.000Z');
    const middle = makeSession('s-mid', '2026-04-15T18:30:00.000Z');
    const oldest = makeSession('s-old', '2026-03-01T08:00:00.000Z');
    renderFeedWith(createMockRepo({ list: async () => [newest, middle, oldest] }));

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items.map((el) => el.getAttribute('data-session-id'))).toEqual([
      's-new',
      's-mid',
      's-old',
    ]);
  });

  it('keeps the "Añadir entrenamiento" CTA visible even with sessions present', async () => {
    const session = makeSession('s-1', '2026-05-26T10:00:00.000Z');
    renderFeedWith(createMockRepo({ list: async () => [session] }));

    await screen.findAllByRole('listitem');
    expect(screen.getByRole('link', { name: /añadir entrenamiento/i })).toHaveAttribute(
      'href',
      '/new',
    );
  });
});

describe('<Feed /> month grouping', () => {
  it('renders one heading per month in order of appearance', async () => {
    const sessions = [
      makeSession('s-may', '2026-05-26T10:00:00.000Z'),
      makeSession('s-apr', '2026-04-15T18:30:00.000Z'),
    ];
    renderFeedWith(createMockRepo({ list: async () => sessions }));

    const headings = await screen.findAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(['Mayo 2026', 'Abril 2026']);
  });

  it('places each card under its corresponding month heading', async () => {
    const sessions = [
      makeSession('s-may-a', '2026-05-26T10:00:00.000Z'),
      makeSession('s-may-b', '2026-05-10T10:00:00.000Z'),
      makeSession('s-apr', '2026-04-15T10:00:00.000Z'),
    ];
    renderFeedWith(createMockRepo({ list: async () => sessions }));

    await screen.findAllByRole('listitem');

    const monthGroups = document.querySelectorAll('[data-month-key]');
    expect(monthGroups).toHaveLength(2);

    const may = document.querySelector('[data-month-key="2026-05"]')!;
    const april = document.querySelector('[data-month-key="2026-04"]')!;
    expect(may.querySelectorAll('[data-session-id]')).toHaveLength(2);
    expect(april.querySelectorAll('[data-session-id]')).toHaveLength(1);
    expect(april.querySelector('[data-session-id]')?.getAttribute('data-session-id')).toBe('s-apr');
  });
});

describe('<Feed /> button classes (F2-T003)', () => {
  it('"Añadir entrenamiento" CTA has class btn-primary', async () => {
    renderFeedWith(createMockRepo({ list: async () => [] }));
    const cta = await screen.findByRole('link', { name: /añadir entrenamiento/i });
    expect(cta).toHaveClass('btn-primary');
  });
});

describe('<Feed /> styling (F2-T008)', () => {
  it('feed heading has class "feed-title"', async () => {
    renderFeedWith(createMockRepo({ list: async () => [] }));
    await screen.findByRole('link', { name: /añadir entrenamiento/i });
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('feed-title');
  });

  it('month heading has class "month-heading"', async () => {
    const session = makeSession('s-1', '2026-05-26T10:00:00.000Z');
    renderFeedWith(createMockRepo({ list: async () => [session] }));
    const heading = await screen.findByRole('heading', { level: 3 });
    expect(heading).toHaveClass('month-heading');
  });

  it('session list has class "session-list"', async () => {
    const session = makeSession('s-1', '2026-05-26T10:00:00.000Z');
    renderFeedWith(createMockRepo({ list: async () => [session] }));
    await screen.findAllByRole('listitem');
    expect(document.querySelector('.session-list')).not.toBeNull();
  });
});
