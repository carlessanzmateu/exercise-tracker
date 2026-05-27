import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { BodyweightSetForm } from './BodyweightSetForm';

describe('<BodyweightSetForm />', () => {
  it('emits a set without weightKg when "Añadir" is clicked with reps only', () => {
    const onAdd = vi.fn();
    render(<BodyweightSetForm onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    const set = onAdd.mock.calls[0]![0];
    expect(set.reps).toBe(10);
    expect(set.weightKg).toBeUndefined();
    expect(set.id).toEqual(expect.any(String));
  });

  it('emits a set with weightKg when "Añadir" is clicked with reps and weight', () => {
    const onAdd = vi.fn();
    render(<BodyweightSetForm onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ reps: 10, weightKg: 5 }));
  });

  it('does not emit if reps is empty', () => {
    const onAdd = vi.fn();
    render(<BodyweightSetForm onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not emit if reps is 0', () => {
    const onAdd = vi.fn();
    render(<BodyweightSetForm onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('clears the form after adding a set', () => {
    render(<BodyweightSetForm onAdd={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect((screen.getByLabelText(/^reps/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/peso/i) as HTMLInputElement).value).toBe('');
  });

  it('inputs declare the appropriate inputmode (T040)', () => {
    render(<BodyweightSetForm onAdd={vi.fn()} />);
    expect(screen.getByLabelText(/^reps/i)).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByLabelText(/peso/i)).toHaveAttribute('inputmode', 'decimal');
  });

  it('rejects negative reps and negative weight (T040)', () => {
    const onAdd = vi.fn();
    render(<BodyweightSetForm onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/^reps/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: '-3' } });
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('numeric inputs have min=0 (T040)', () => {
    render(<BodyweightSetForm onAdd={vi.fn()} />);
    expect(screen.getByLabelText(/^reps/i)).toHaveAttribute('min', '0');
    expect(screen.getByLabelText(/peso/i)).toHaveAttribute('min', '0');
  });
});

describe('<BodyweightSetForm /> button classes (F2-T003)', () => {
  it('submit "Añadir" button has class btn-secondary', () => {
    render(<BodyweightSetForm onAdd={vi.fn()} />);
    expect(screen.getByRole('button', { name: /añadir/i })).toHaveClass('btn-secondary');
  });
});
