import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { RepositoryProvider } from '@/data/RepositoryProvider';
import type { SessionRepository } from '@/data/sessionRepository';
import { createMockRepo } from '@/test/createMockRepo';

import { NewSession } from './NewSession';

interface RenderOptions {
  now?: Date;
  repo?: SessionRepository;
}

function renderNewSession({
  now = new Date('2026-05-25T10:30:00'),
  repo = createMockRepo(),
}: RenderOptions = {}) {
  return render(
    <MemoryRouter initialEntries={['/new']}>
      <RepositoryProvider repo={repo}>
        <Routes>
          <Route path="/new" element={<NewSession now={now} />} />
          <Route path="/" element={<div data-testid="feed-route">FEED</div>} />
        </Routes>
      </RepositoryProvider>
    </MemoryRouter>,
  );
}

describe('<NewSession /> editable date+time', () => {
  it('initialises the datetime input with the injected clock (local datetime-local format)', () => {
    renderNewSession({ now: new Date('2026-05-25T10:30:00') });

    const input = screen.getByLabelText(/fecha y hora/i) as HTMLInputElement;
    expect(input.type).toBe('datetime-local');
    expect(input.value).toBe('2026-05-25T10:30');
  });

  it('updates the displayed value when the datetime is edited', () => {
    renderNewSession({ now: new Date('2026-05-25T10:30:00') });

    const input = screen.getByLabelText(/fecha y hora/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2026-06-01T15:00' } });

    expect(input.value).toBe('2026-06-01T15:00');
  });
});

describe('<NewSession /> saving an empty session', () => {
  it('calls repo.save with the current session when "Guardar" is clicked', async () => {
    const repo = createMockRepo();
    const now = new Date('2026-05-25T10:30:00');
    renderNewSession({ now, repo });

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await new Promise((r) => setTimeout(r, 0));

    expect(repo.save).toHaveBeenCalledTimes(1);
    const saved = (repo.save as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(saved.startedAt).toBe(now.toISOString());
    expect(saved.exercises).toEqual([]);
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(saved.createdAt).toBe(now.toISOString());
    expect(saved.updatedAt).toBe(now.toISOString());
  });

  it('persists the edited startedAt, not the original injected clock', async () => {
    const repo = createMockRepo();
    renderNewSession({ now: new Date('2026-05-25T10:30:00'), repo });

    const input = screen.getByLabelText(/fecha y hora/i);
    fireEvent.change(input, { target: { value: '2026-06-01T15:00' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await new Promise((r) => setTimeout(r, 0));

    const saved = (repo.save as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(saved.startedAt).toBe(new Date('2026-06-01T15:00').toISOString());
  });

  it('navigates to the feed ("/") after saving', async () => {
    const repo = createMockRepo();
    renderNewSession({ repo });

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByTestId('feed-route')).toBeInTheDocument();
  });
});

describe('<NewSession /> adding an exercise', () => {
  function openPickerAndSelect(typeName: RegExp) {
    fireEvent.click(screen.getByRole('button', { name: /añadir ejercicio/i }));
    fireEvent.click(screen.getByRole('button', { name: typeName }));
  }

  it('shows the added exercise in the session (strength → empty sets, order 0)', async () => {
    const repo = createMockRepo();
    renderNewSession({ repo });

    openPickerAndSelect(/press banca/i);

    expect(screen.getByText('Press banca (barra)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /guardar sesión/i }));
    await new Promise((r) => setTimeout(r, 0));

    const saved = (repo.save as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(saved.exercises).toHaveLength(1);
    expect(saved.exercises[0]).toMatchObject({
      typeId: 'press-banca',
      order: 0,
      shape: 'strength',
      sets: [],
    });
  });

  it('assigns order = 1 to the second added exercise', async () => {
    const repo = createMockRepo();
    renderNewSession({ repo });

    openPickerAndSelect(/press banca/i);
    openPickerAndSelect(/jalón al pecho/i);

    fireEvent.click(screen.getByRole('button', { name: /guardar sesión/i }));
    await new Promise((r) => setTimeout(r, 0));

    const saved = (repo.save as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(saved.exercises).toHaveLength(2);
    expect(saved.exercises[0]!.order).toBe(0);
    expect(saved.exercises[1]!.order).toBe(1);
    expect(saved.exercises[1]!.typeId).toBe('jalon-al-pecho');
  });

  it('adds a cardio exercise with shape "cardio" and an empty cardio block', async () => {
    const repo = createMockRepo();
    renderNewSession({ repo });

    openPickerAndSelect(/correr/i);

    fireEvent.click(screen.getByRole('button', { name: /guardar sesión/i }));
    await new Promise((r) => setTimeout(r, 0));

    const saved = (repo.save as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(saved.exercises[0]).toMatchObject({
      typeId: 'correr',
      order: 0,
      shape: 'cardio',
    });
    expect(saved.exercises[0]!.cardio).toBeDefined();
  });
});

describe('<NewSession /> end-to-end flow (T039)', () => {
  function openPickerAndSelect(typeName: RegExp) {
    fireEvent.click(screen.getByRole('button', { name: /añadir ejercicio/i }));
    fireEvent.click(screen.getByRole('button', { name: typeName }));
  }

  it('saves a session with a strength exercise + its sets and navigates to the feed', async () => {
    const repo = createMockRepo();
    renderNewSession({ repo });

    openPickerAndSelect(/press banca/i);

    // Add 2 strength sets.
    fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: /añadir serie/i }));

    fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: '65' } });
    fireEvent.click(screen.getByRole('button', { name: /añadir serie/i }));

    // Numbered sets must be rendered.
    expect(screen.getByText('Serie 1')).toBeInTheDocument();
    expect(screen.getByText('Serie 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /guardar sesión/i }));

    expect(await screen.findByTestId('feed-route')).toBeInTheDocument();

    const saved = (repo.save as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(saved.exercises).toHaveLength(1);
    expect(saved.exercises[0]!.sets).toHaveLength(2);
    expect(saved.exercises[0]!.sets[0]).toMatchObject({ reps: 8, weightKg: 60 });
    expect(saved.exercises[0]!.sets[1]).toMatchObject({ reps: 6, weightKg: 65 });
  });

  it('saves a session with a cardio exercise + its block', async () => {
    const repo = createMockRepo();
    renderNewSession({ repo });

    openPickerAndSelect(/correr/i);

    fireEvent.change(screen.getByLabelText(/duración/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/distancia/i), { target: { value: '3.5' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar bloque/i }));

    fireEvent.click(screen.getByRole('button', { name: /guardar sesión/i }));
    await new Promise((r) => setTimeout(r, 0));

    const saved = (repo.save as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(saved.exercises[0]!.cardio).toEqual({ durationMinutes: 20, distanceKm: 3.5 });
  });
});

describe('<NewSession /> button classes (F2-T003)', () => {
  it('"Guardar sesión" button has class btn-primary', () => {
    render(
      <MemoryRouter>
        <RepositoryProvider repo={createMockRepo()}>
          <NewSession now={new Date('2026-05-25T10:00:00Z')} />
        </RepositoryProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /guardar sesión/i })).toHaveClass('btn-primary');
  });

  it('"Añadir ejercicio" button has class btn-secondary', () => {
    render(
      <MemoryRouter>
        <RepositoryProvider repo={createMockRepo()}>
          <NewSession now={new Date('2026-05-25T10:00:00Z')} />
        </RepositoryProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /añadir ejercicio/i })).toHaveClass('btn-secondary');
  });
});

describe('<NewSession /> styling (F2-T009)', () => {
  it('page heading has class "page-title"', () => {
    renderNewSession();
    expect(screen.getByRole('heading', { level: 2, name: /nueva sesión/i })).toHaveClass(
      'page-title',
    );
  });

  it('exercises list has class "exercises-list"', () => {
    renderNewSession();
    expect(document.querySelector('.exercises-list')).not.toBeNull();
  });
});
