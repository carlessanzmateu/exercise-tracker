import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { ExercisePicker } from './ExercisePicker';

describe('<ExercisePicker />', () => {
  it('renders the 8 categories as headings', () => {
    render(<ExercisePicker onSelect={vi.fn()} />);

    const headings = screen.getAllByRole('heading', { level: 4 });
    const labels = headings.map((h) => h.textContent);
    for (const expected of [
      'Pecho',
      'Espalda',
      'Hombros',
      'Piernas',
      'Brazos',
      'Core',
      'Autocarga',
      'Cardio',
    ]) {
      expect(labels).toContain(expected);
    }
    expect(headings).toHaveLength(8);
  });

  it('renders the types of each category as buttons', () => {
    render(<ExercisePicker onSelect={vi.fn()} />);

    // Total catalogue size = 24.
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(24);

    // Representative examples per category.
    expect(screen.getByRole('button', { name: /press banca/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /plancha/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /caminar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /correr/i })).toBeInTheDocument();
  });

  it('emits the corresponding typeId via onSelect when a type is clicked', () => {
    const onSelect = vi.fn();
    render(<ExercisePicker onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /press banca/i }));

    expect(onSelect).toHaveBeenCalledWith('press-banca');
  });

  it('renders a search input', () => {
    render(<ExercisePicker onSelect={vi.fn()} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('filters exercises by name as the user types', () => {
    render(<ExercisePicker onSelect={vi.fn()} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'press' } });

    // "Press banca (barra)", "Press pecho máquina", "Press militar / Press hombros máquina" match
    expect(screen.getByRole('button', { name: /press banca/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /press pecho/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /press militar/i })).toBeInTheDocument();
    // Exercises that don't match are hidden
    expect(screen.queryByRole('button', { name: /caminar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /plancha/i })).not.toBeInTheDocument();
  });

  it('hides categories that have no matching exercises', () => {
    render(<ExercisePicker onSelect={vi.fn()} />);
    const input = screen.getByRole('searchbox');

    // "correr" only belongs to Cardio
    fireEvent.change(input, { target: { value: 'correr' } });

    const headings = screen.getAllByRole('heading', { level: 4 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Cardio');
  });

  it('shows all exercises again when the search is cleared', () => {
    render(<ExercisePicker onSelect={vi.fn()} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'press' } });
    fireEvent.change(input, { target: { value: '' } });

    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(8);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(24);
  });

  it('filter is case-insensitive', () => {
    render(<ExercisePicker onSelect={vi.fn()} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'CORRER' } });

    expect(screen.getByRole('button', { name: /correr/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /caminar/i })).not.toBeInTheDocument();
  });
});

describe('<ExercisePicker /> button classes (F2-T003)', () => {
  it('exercise type buttons have class btn-ghost', () => {
    render(<ExercisePicker onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    // All exercise buttons (not search-related) should have btn-ghost
    buttons.forEach((btn) => expect(btn).toHaveClass('btn-ghost'));
  });
});

describe('<ExercisePicker /> styling (F2-T012)', () => {
  it('search input has class "exercise-picker__search"', () => {
    render(<ExercisePicker onSelect={vi.fn()} />);
    expect(screen.getByRole('searchbox')).toHaveClass('exercise-picker__search');
  });

  it('category headings have class "picker-category-heading"', () => {
    render(<ExercisePicker onSelect={vi.fn()} />);
    const headings = screen.getAllByRole('heading', { level: 4 });
    headings.forEach((h) => expect(h).toHaveClass('picker-category-heading'));
  });

  it('exercise buttons have class "picker-exercise-btn"', () => {
    render(<ExercisePicker onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toHaveClass('picker-exercise-btn'));
  });
});
