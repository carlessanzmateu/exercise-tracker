import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { WeightEntry } from '@/domain/weight/weightEntry';

import { WeightEntriesList } from './WeightEntriesList';

const entries: WeightEntry[] = [
  { id: 'b', recordedAt: '2026-05-28T08:00:00', weightKg: 75.3 },
  { id: 'a', recordedAt: '2026-05-27T20:00:00', weightKg: 75.5 },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<WeightEntriesList />', () => {
  it('renders an empty state when there are no entries', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    render(<WeightEntriesList entries={[]} onUpdate={onUpdate} onDelete={onDelete} />);
    expect(screen.getByText(/aún no has registrado pesos/i)).toBeInTheDocument();
  });

  it('lists entries as provided (descending order is the caller responsibility)', () => {
    render(<WeightEntriesList entries={entries} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    const items = screen.getAllByTestId('weight-entry');
    expect(items).toHaveLength(2);
    // The first row should be the first entry in the array.
    expect(items[0].textContent).toMatch(/75\.3 kg/);
    expect(items[1].textContent).toMatch(/75\.5 kg/);
  });

  it('enters edit mode on "Editar" and calls onUpdate with the new values', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(<WeightEntriesList entries={entries} onUpdate={onUpdate} onDelete={vi.fn()} />);

    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    fireEvent.click(editButtons[0]);

    const kgInput = screen.getByLabelText(/peso \(kg\)/i) as HTMLInputElement;
    expect(kgInput.value).toBe('75.3');
    fireEvent.change(kgInput, { target: { value: '76' } });

    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));

    expect(onUpdate).toHaveBeenCalledWith('b', {
      recordedAt: '2026-05-28T08:00:00',
      weightKg: 76,
    });
  });

  it('cancels edit without calling onUpdate', () => {
    const onUpdate = vi.fn();
    render(<WeightEntriesList entries={entries} onUpdate={onUpdate} onDelete={vi.fn()} />);

    fireEvent.click(screen.getAllByRole('button', { name: /editar/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(/peso \(kg\)/i)).toBeNull();
  });

  it('confirms before delete and calls onDelete only when confirmed', () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<WeightEntriesList entries={entries} onUpdate={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getAllByRole('button', { name: /borrar/i })[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith('b');
  });

  it('does not call onDelete when the confirm is cancelled', () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<WeightEntriesList entries={entries} onUpdate={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getAllByRole('button', { name: /borrar/i })[0]);

    expect(onDelete).not.toHaveBeenCalled();
  });
});
