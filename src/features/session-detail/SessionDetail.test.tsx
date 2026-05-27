import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { RepositoryProvider } from '@/data/RepositoryProvider';
import type { SessionRepository } from '@/data/sessionRepository';
import type { Session } from '@/domain/types';
import { createMockRepo } from '@/test/createMockRepo';

import { SessionDetail } from './SessionDetail';

function renderDetail(sessionId: string, repo: SessionRepository) {
  return render(
    <MemoryRouter initialEntries={[`/session/${sessionId}`]}>
      <RepositoryProvider repo={repo}>
        <Routes>
          <Route path="/session/:id" element={<SessionDetail />} />
          <Route path="/" element={<div data-testid="feed-route">FEED</div>} />
        </Routes>
      </RepositoryProvider>
    </MemoryRouter>,
  );
}

function makeStrengthSession(id: string): Session {
  return {
    id,
    startedAt: '2026-05-25T10:30:00.000Z',
    createdAt: '2026-05-25T10:30:00.000Z',
    updatedAt: '2026-05-25T10:30:00.000Z',
    exercises: [
      {
        id: 'ex-1',
        typeId: 'press-banca',
        order: 0,
        shape: 'strength',
        sets: [
          { id: 's-1', reps: 8, weightKg: 60 },
          { id: 's-2', reps: 6, weightKg: 65 },
        ],
      },
    ],
  };
}

function makeCardioSession(id: string): Session {
  return {
    id,
    startedAt: '2026-05-25T10:30:00.000Z',
    createdAt: '2026-05-25T10:30:00.000Z',
    updatedAt: '2026-05-25T10:30:00.000Z',
    exercises: [
      {
        id: 'ex-1',
        typeId: 'correr',
        order: 0,
        shape: 'cardio',
        cardio: { durationMinutes: 20, distanceKm: 3.5 },
      },
    ],
  };
}

describe('<SessionDetail /> loads and displays the session', () => {
  it('calls repo.getById with the id from the URL', async () => {
    const getById = vi.fn().mockResolvedValue(makeStrengthSession('abc'));
    const repo = createMockRepo({ getById });
    renderDetail('abc', repo);

    await screen.findByText(/press banca/i);
    expect(getById).toHaveBeenCalledWith('abc');
  });

  it('shows the exercise name (strength) and its numbered sets', async () => {
    const repo = createMockRepo({ getById: async () => makeStrengthSession('abc') });
    renderDetail('abc', repo);

    expect(await screen.findByText('Press banca (barra)')).toBeInTheDocument();
    expect(screen.getByText('Serie 1')).toBeInTheDocument();
    expect(screen.getByText('Serie 2')).toBeInTheDocument();
  });

  it('shows the formatted date+time of the session', async () => {
    const repo = createMockRepo({ getById: async () => makeStrengthSession('abc') });
    const { container } = renderDetail('abc', repo);

    await screen.findByText('Press banca (barra)');
    const time = container.querySelector('time');
    expect(time).toBeInTheDocument();
    expect(time).toHaveAttribute('datetime', '2026-05-25T10:30:00.000Z');
  });

  it('shows the cardio block data (duration and distance)', async () => {
    const repo = createMockRepo({ getById: async () => makeCardioSession('abc') });
    renderDetail('abc', repo);

    expect(await screen.findByText(/correr/i)).toBeInTheDocument();
    const region = screen.getByTestId('route-session-detail');
    expect(region.textContent).toContain('20');
    expect(region.textContent).toMatch(/min/i);
    expect(region.textContent).toContain('3.5');
    expect(region.textContent).toMatch(/km/i);
  });

  it('shows a "not found" message when the session does not exist', async () => {
    const repo = createMockRepo({ getById: async () => undefined });
    renderDetail('does-not-exist', repo);

    expect(await screen.findByText(/sesión no encontrada/i)).toBeInTheDocument();
  });
});

describe('<SessionDetail /> edit date+time (T042)', () => {
  it('calls repo.update with the new startedAt when the datetime changes', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({
      getById: vi.fn().mockResolvedValue(makeStrengthSession('abc')),
      update,
    });
    renderDetail('abc', repo);

    const input = (await screen.findByLabelText(/fecha y hora/i)) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2026-06-15T18:30' } });

    expect(update).toHaveBeenCalledTimes(1);
    const [savedSession, nowArg] = update.mock.calls[0]!;
    expect(savedSession.startedAt).toBe(new Date('2026-06-15T18:30').toISOString());
    expect(savedSession.id).toBe('abc');
    expect(nowArg).toBeInstanceOf(Date);
  });
});

describe('<SessionDetail /> edit a set (T043)', () => {
  it('opens the form with the current values prefilled when "Editar" is clicked on a set', async () => {
    const repo = createMockRepo({ getById: vi.fn().mockResolvedValue(makeStrengthSession('abc')) });
    renderDetail('abc', repo);

    await screen.findByText('Press banca (barra)');
    fireEvent.click(screen.getAllByRole('button', { name: /editar/i })[0]!);

    expect((screen.getByLabelText(/^reps/i) as HTMLInputElement).value).toBe('8');
    expect((screen.getByLabelText(/peso/i) as HTMLInputElement).value).toBe('60');
  });

  it('passes the session with the modified set (id preserved) to repo.update on confirm', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({
      getById: vi.fn().mockResolvedValue(makeStrengthSession('abc')),
      update,
    });
    renderDetail('abc', repo);

    await screen.findByText('Press banca (barra)');
    fireEvent.click(screen.getAllByRole('button', { name: /editar/i })[0]!);
    fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: '70' } });
    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));

    expect(update).toHaveBeenCalled();
    const updatedSession = update.mock.calls.at(-1)![0];
    expect(updatedSession.exercises[0].sets[0]).toMatchObject({
      id: 's-1',
      reps: 10,
      weightKg: 70,
    });
    // El segundo set permanece intacto
    expect(updatedSession.exercises[0].sets[1]).toMatchObject({ id: 's-2', reps: 6, weightKg: 65 });
  });

  it('cancelling the edit closes the form and does not call repo.update', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({
      getById: vi.fn().mockResolvedValue(makeStrengthSession('abc')),
      update,
    });
    renderDetail('abc', repo);

    await screen.findByText('Press banca (barra)');
    fireEvent.click(screen.getAllByRole('button', { name: /editar/i })[0]!);
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.queryByLabelText(/^reps/i)).not.toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();
  });
});

describe('<SessionDetail /> delete a set (T044)', () => {
  it('deletes the set and persists via repo.update when the dialog is confirmed', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const update = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({
      getById: vi.fn().mockResolvedValue(makeStrengthSession('abc')),
      update,
    });
    renderDetail('abc', repo);

    await screen.findByText('Press banca (barra)');

    const deleteSetButtons = screen.getAllByRole('button', { name: /eliminar serie/i });
    fireEvent.click(deleteSetButtons[0]!);

    expect(confirmSpy).toHaveBeenCalled();
    expect(update).toHaveBeenCalled();
    const updated = update.mock.calls.at(-1)![0];
    expect(updated.exercises[0].sets).toHaveLength(1);
    expect(updated.exercises[0].sets[0].id).toBe('s-2');

    confirmSpy.mockRestore();
  });

  it('cancelling the dialog does not call repo.update and keeps the sets', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const update = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({
      getById: vi.fn().mockResolvedValue(makeStrengthSession('abc')),
      update,
    });
    renderDetail('abc', repo);

    await screen.findByText('Press banca (barra)');
    fireEvent.click(screen.getAllByRole('button', { name: /eliminar serie/i })[0]!);

    expect(confirmSpy).toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(screen.getByText('Serie 1')).toBeInTheDocument();
    expect(screen.getByText('Serie 2')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});

describe('<SessionDetail /> delete an exercise (T045)', () => {
  it('deletes the exercise on confirm; the session may end up with exercises: []', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const update = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({
      getById: vi.fn().mockResolvedValue(makeStrengthSession('abc')),
      update,
    });
    renderDetail('abc', repo);

    await screen.findByText('Press banca (barra)');
    fireEvent.click(screen.getByRole('button', { name: /eliminar ejercicio/i }));

    expect(update).toHaveBeenCalled();
    const updated = update.mock.calls.at(-1)![0];
    expect(updated.exercises).toEqual([]);

    confirmSpy.mockRestore();
  });

  it('cancelling the dialog leaves the exercise in place', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const update = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({
      getById: vi.fn().mockResolvedValue(makeStrengthSession('abc')),
      update,
    });
    renderDetail('abc', repo);

    await screen.findByText('Press banca (barra)');
    fireEvent.click(screen.getByRole('button', { name: /eliminar ejercicio/i }));

    expect(update).not.toHaveBeenCalled();
    expect(screen.getByText('Press banca (barra)')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});

describe('<SessionDetail /> delete the whole session (T046)', () => {
  it('calls repo.delete with the id and navigates to the feed on confirm', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const del = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({
      getById: vi.fn().mockResolvedValue(makeStrengthSession('abc')),
      delete: del,
    });
    renderDetail('abc', repo);

    await screen.findByText('Press banca (barra)');
    fireEvent.click(
      screen.getByRole('button', { name: /eliminar sesión|eliminar entrenamiento/i }),
    );

    expect(del).toHaveBeenCalledWith('abc');
    expect(await screen.findByTestId('feed-route')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it('cancelling the dialog does not call repo.delete nor navigate', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const del = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({
      getById: vi.fn().mockResolvedValue(makeStrengthSession('abc')),
      delete: del,
    });
    renderDetail('abc', repo);

    await screen.findByText('Press banca (barra)');
    fireEvent.click(
      screen.getByRole('button', { name: /eliminar sesión|eliminar entrenamiento/i }),
    );

    expect(del).not.toHaveBeenCalled();
    expect(screen.queryByTestId('feed-route')).not.toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});

describe('<SessionDetail /> button classes (F2-T003)', () => {
  it('"Eliminar entrenamiento" button has class btn-danger', async () => {
    const session = makeStrengthSession('s-1');
    const repo = createMockRepo({ getById: async () => session });
    renderDetail('s-1', repo);
    const btn = await screen.findByRole('button', { name: /eliminar entrenamiento/i });
    expect(btn).toHaveClass('btn-danger');
  });
});

describe('<SessionDetail /> styling (F2-T010)', () => {
  it('page heading has class "page-title"', async () => {
    const repo = createMockRepo({ getById: async () => makeStrengthSession('s-1') });
    renderDetail('s-1', repo);
    const heading = await screen.findByRole('heading', { level: 2, name: /detalle de sesión/i });
    expect(heading).toHaveClass('page-title');
  });

  it('"Eliminar ejercicio" button has class btn-danger', async () => {
    const repo = createMockRepo({ getById: async () => makeStrengthSession('s-1') });
    renderDetail('s-1', repo);
    const btn = await screen.findByRole('button', { name: /eliminar ejercicio/i });
    expect(btn).toHaveClass('btn-danger');
  });

  it('"Editar" set button has class btn-ghost', async () => {
    const repo = createMockRepo({ getById: async () => makeStrengthSession('s-1') });
    renderDetail('s-1', repo);
    const buttons = await screen.findAllByRole('button', { name: /editar/i });
    expect(buttons[0]).toHaveClass('btn-ghost');
  });

  it('the visible session date has class "session-date"', async () => {
    const repo = createMockRepo({ getById: async () => makeStrengthSession('s-1') });
    renderDetail('s-1', repo);
    await screen.findByRole('heading', { level: 2, name: /detalle de sesión/i });
    expect(document.querySelector('.session-date')).not.toBeNull();
  });
});
