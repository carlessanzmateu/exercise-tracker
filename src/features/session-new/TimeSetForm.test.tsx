import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { TimeSetForm } from './TimeSetForm';

function fill(reps: string, seconds: string) {
  fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: reps } });
  fireEvent.change(screen.getByLabelText(/tiempo|segundos/i), { target: { value: seconds } });
}

describe('<TimeSetForm />', () => {
  it('emits a set with reps and durationSeconds when "Añadir" is clicked', () => {
    const onAdd = vi.fn();
    render(<TimeSetForm onAdd={onAdd} />);

    fill('3', '30');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ reps: 3, durationSeconds: 30 }));
  });

  it('clears the form after adding a set', () => {
    render(<TimeSetForm onAdd={vi.fn()} />);
    fill('3', '30');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect((screen.getByLabelText(/^reps/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/tiempo|segundos/i) as HTMLInputElement).value).toBe('');
  });

  it('does not emit if reps or seconds are 0 or empty', () => {
    const onAdd = vi.fn();
    render(<TimeSetForm onAdd={onAdd} />);

    fill('0', '30');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();

    fill('3', '0');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();

    fill('', '');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('inputs declare the appropriate inputmode (T040)', () => {
    render(<TimeSetForm onAdd={vi.fn()} />);
    expect(screen.getByLabelText(/^reps/i)).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByLabelText(/tiempo|segundos/i)).toHaveAttribute('inputmode', 'numeric');
  });

  it('rejects negative values (T040)', () => {
    const onAdd = vi.fn();
    render(<TimeSetForm onAdd={onAdd} />);

    fill('-3', '30');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();

    fill('3', '-30');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('numeric inputs have min=0 (T040)', () => {
    render(<TimeSetForm onAdd={vi.fn()} />);
    expect(screen.getByLabelText(/^reps/i)).toHaveAttribute('min', '0');
    expect(screen.getByLabelText(/tiempo|segundos/i)).toHaveAttribute('min', '0');
  });
});

describe('<TimeSetForm /> button classes (F2-T003)', () => {
  it('submit "Añadir" button has class btn-secondary', () => {
    render(<TimeSetForm onAdd={vi.fn()} />);
    expect(screen.getByRole('button', { name: /añadir/i })).toHaveClass('btn-secondary');
  });
});
