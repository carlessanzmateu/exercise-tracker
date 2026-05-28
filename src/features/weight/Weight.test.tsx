import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { RepositoryProvider } from '@/data/RepositoryProvider';
import type { SessionRepository } from '@/data/sessionRepository';
import { createMockRepo } from '@/test/createMockRepo';

import { Weight } from './Weight';

const PROFILE = { heightCm: 175, birthdate: '1990-05-26', sex: 'male' as const };

function renderWeight(repo: SessionRepository = createMockRepo(), now?: () => Date) {
  return render(
    <MemoryRouter initialEntries={['/weight']}>
      <RepositoryProvider repo={repo}>
        <Weight now={now} />
      </RepositoryProvider>
    </MemoryRouter>,
  );
}

describe('<Weight /> shell (F6-T010)', () => {
  it('shows a loading state while fetching the profile', () => {
    renderWeight(createMockRepo({ getProfile: () => new Promise(() => {}) }));
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows a block CTA linking to /settings#perfil when no profile is stored', async () => {
    renderWeight(createMockRepo({ getProfile: async () => null }));
    const cta = await screen.findByRole('link', { name: /configurar perfil/i });
    expect(cta).toHaveAttribute('href', '/settings#perfil');
  });

  it('renders the weight view shell when a profile is stored', async () => {
    renderWeight(createMockRepo({ getProfile: async () => PROFILE }));
    expect(await screen.findByRole('heading', { name: /^peso$/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /configurar perfil/i })).toBeNull();
  });
});

describe('<Weight /> add form (F6-T011)', () => {
  it('renders an inline form with weight and datetime fields', async () => {
    renderWeight(createMockRepo({ getProfile: async () => PROFILE }));
    expect(await screen.findByLabelText(/peso \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha y hora/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar peso/i })).toBeInTheDocument();
  });

  it('prefills the datetime with the current local time', async () => {
    const fixedNow = () => new Date(2026, 4, 28, 8, 30, 0);
    renderWeight(createMockRepo({ getProfile: async () => PROFILE }), fixedNow);
    const datetimeInput = (await screen.findByLabelText(/fecha y hora/i)) as HTMLInputElement;
    expect(datetimeInput.value).toBe('2026-05-28T08:30');
  });

  it('saves a valid entry via repo.addWeightEntry and refreshes the list', async () => {
    const addWeightEntry = vi.fn().mockResolvedValue(undefined);
    const listWeightEntries = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'w1', recordedAt: '2026-05-28T08:30:00', weightKg: 75.3 }]);
    const repo = createMockRepo({
      getProfile: async () => PROFILE,
      addWeightEntry,
      listWeightEntries,
    });
    renderWeight(repo, () => new Date(2026, 4, 28, 8, 30, 0));

    fireEvent.change(await screen.findByLabelText(/peso \(kg\)/i), {
      target: { value: '75.3' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar peso/i }));

    await waitFor(() => expect(addWeightEntry).toHaveBeenCalledTimes(1));
    const call = addWeightEntry.mock.calls[0][0];
    expect(call.weightKg).toBe(75.3);
    expect(call.recordedAt).toBe('2026-05-28T08:30:00');
    expect(call.id).toBeTruthy();
    // The list is re-fetched (twice: once on mount, once after add).
    await waitFor(() => expect(listWeightEntries).toHaveBeenCalledTimes(2));
  });

  it('shows an inline error when weight is non-positive', async () => {
    const addWeightEntry = vi.fn().mockResolvedValue(undefined);
    renderWeight(
      createMockRepo({ getProfile: async () => PROFILE, addWeightEntry }),
      () => new Date(2026, 4, 28, 8, 30, 0),
    );

    fireEvent.change(await screen.findByLabelText(/peso \(kg\)/i), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar peso/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/peso/i);
    expect(addWeightEntry).not.toHaveBeenCalled();
  });
});
