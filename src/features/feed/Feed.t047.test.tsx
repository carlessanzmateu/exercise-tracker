import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from '@/App';
import { RepositoryProvider } from '@/data/RepositoryProvider';
import type { Session } from '@/domain/types';
import { createMockRepo } from '@/test/createMockRepo';

function makeSession(id: string, startedAt: string): Session {
  return {
    id,
    startedAt,
    createdAt: startedAt,
    updatedAt: startedAt,
    exercises: [],
  };
}

describe('Feed reloads after mutations (T047)', () => {
  it('Feed calls repo.list on every mount (no stale cache between mounts)', async () => {
    const list = vi.fn().mockResolvedValue([]);
    const repo = createMockRepo({ list });

    const Wrapper = () => (
      <MemoryRouter initialEntries={['/']}>
        <RepositoryProvider repo={repo}>
          <App />
        </RepositoryProvider>
      </MemoryRouter>
    );

    const { unmount } = render(<Wrapper />);
    await screen.findByText(/aún no hay entrenamientos/i);
    expect(list).toHaveBeenCalledTimes(1);

    unmount();

    render(<Wrapper />);
    await screen.findByText(/aún no hay entrenamientos/i);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('after deleting the session from detail, the feed reflects the updated state', async () => {
    let sessions: Session[] = [
      makeSession('s-1', '2026-05-01T10:00:00.000Z'),
      makeSession('s-2', '2026-04-01T10:00:00.000Z'),
    ];
    const repo = createMockRepo({
      list: vi.fn().mockImplementation(async () => [...sessions]),
      getById: vi.fn().mockImplementation(async (id: string) => sessions.find((s) => s.id === id)),
      delete: vi.fn().mockImplementation(async (id: string) => {
        sessions = sessions.filter((s) => s.id !== id);
      }),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <RepositoryProvider repo={repo}>
          <App />
        </RepositoryProvider>
      </MemoryRouter>,
    );

    // Initial feed shows 2 cards.
    expect(await screen.findAllByRole('listitem')).toHaveLength(2);

    // Click on the first card to navigate to the detail screen.
    fireEvent.click(screen.getAllByRole('link', { name: /lun|mar|mié|jue|vie|sáb|dom/i })[0]!);

    await screen.findByText(/detalle de sesión/i);

    // Delete the session.
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: /eliminar entrenamiento/i }));

    // After navigating back to the feed, only 1 session is shown (s-2).
    await screen.findByText(/abril 2026/i);
    expect(screen.queryByText(/mayo 2026/i)).not.toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});
