import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { StrengthSetForm } from './StrengthSetForm';

function fill(reps: string, weight: string) {
  fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: reps } });
  fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: weight } });
}

describe('<StrengthSetForm />', () => {
  it('emits the set via onAdd when "Añadir" is clicked with valid reps and weight', () => {
    const onAdd = vi.fn();
    render(<StrengthSetForm onAdd={onAdd} />);

    fill('8', '60');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ reps: 8, weightKg: 60, id: expect.any(String) }),
    );
  });

  it('clears the form after adding a set', () => {
    render(<StrengthSetForm onAdd={vi.fn()} />);

    fill('8', '60');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));

    expect((screen.getByLabelText(/^reps/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/peso/i) as HTMLInputElement).value).toBe('');
  });

  it('does not emit if reps is empty', () => {
    const onAdd = vi.fn();
    render(<StrengthSetForm onAdd={onAdd} />);
    fill('', '60');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not emit if weight is 0 or negative', () => {
    const onAdd = vi.fn();
    render(<StrengthSetForm onAdd={onAdd} />);

    fill('8', '0');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();

    fill('8', '-5');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('reps and weight inputs declare the appropriate inputmode (T040)', () => {
    render(<StrengthSetForm onAdd={vi.fn()} />);
    expect(screen.getByLabelText(/^reps/i)).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByLabelText(/peso/i)).toHaveAttribute('inputmode', 'decimal');
  });

  it('rejects negative reps (T040)', () => {
    const onAdd = vi.fn();
    render(<StrengthSetForm onAdd={onAdd} />);
    fill('-5', '60');
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('numeric inputs have min=0 (T040)', () => {
    render(<StrengthSetForm onAdd={vi.fn()} />);
    expect(screen.getByLabelText(/^reps/i)).toHaveAttribute('min', '0');
    expect(screen.getByLabelText(/peso/i)).toHaveAttribute('min', '0');
  });
});

describe('<StrengthSetForm /> button classes (F2-T003)', () => {
  it('submit "Añadir" button has class btn-secondary', () => {
    render(<StrengthSetForm onAdd={vi.fn()} />);
    expect(screen.getByRole('button', { name: /añadir/i })).toHaveClass('btn-secondary');
  });
});

describe('<StrengthSetForm /> field wrappers (F2-T004)', () => {
  it('reps and weight inputs are wrapped in a .field container', () => {
    render(<StrengthSetForm onAdd={vi.fn()} />);
    const repsInput = screen.getByLabelText(/^reps/i);
    const weightInput = screen.getByLabelText(/peso/i);
    expect(repsInput.closest('.field')).not.toBeNull();
    expect(weightInput.closest('.field')).not.toBeNull();
  });
});
