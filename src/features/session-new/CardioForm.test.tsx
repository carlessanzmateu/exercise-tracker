import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { CardioForm } from './CardioForm';

describe('<CardioForm />', () => {
  it('emits the block when "Guardar bloque" is clicked with duration > 0 and no distance', () => {
    const onSubmit = vi.fn();
    render(<CardioForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/duración/i), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar bloque/i }));

    expect(onSubmit).toHaveBeenCalledWith({ durationMinutes: 20 });
  });

  it('emits the block including distance when distance > 0', () => {
    const onSubmit = vi.fn();
    render(<CardioForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/duración/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/distancia/i), { target: { value: '5.5' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar bloque/i }));

    expect(onSubmit).toHaveBeenCalledWith({ durationMinutes: 30, distanceKm: 5.5 });
  });

  it('does not emit if duration is 0, negative or empty', () => {
    const onSubmit = vi.fn();
    render(<CardioForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/duración/i), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar bloque/i }));
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/duración/i), { target: { value: '-1' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar bloque/i }));
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/duración/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar bloque/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('prefills inputs with initial values when the "initial" prop is provided', () => {
    render(<CardioForm initial={{ durationMinutes: 25, distanceKm: 4 }} onSubmit={vi.fn()} />);
    expect((screen.getByLabelText(/duración/i) as HTMLInputElement).value).toBe('25');
    expect((screen.getByLabelText(/distancia/i) as HTMLInputElement).value).toBe('4');
  });

  it('inputs declare the appropriate inputmode (T040)', () => {
    render(<CardioForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/duración/i)).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByLabelText(/distancia/i)).toHaveAttribute('inputmode', 'decimal');
  });

  it('rejects negative distance (T040)', () => {
    const onSubmit = vi.fn();
    render(<CardioForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/duración/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/distancia/i), { target: { value: '-2' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar bloque/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('numeric inputs have min=0 (T040)', () => {
    render(<CardioForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/duración/i)).toHaveAttribute('min', '0');
    expect(screen.getByLabelText(/distancia/i)).toHaveAttribute('min', '0');
  });
});

describe('<CardioForm /> button classes (F2-T003)', () => {
  it('"Guardar bloque" submit button has class btn-secondary', () => {
    render(<CardioForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /guardar bloque/i })).toHaveClass('btn-secondary');
  });
});
