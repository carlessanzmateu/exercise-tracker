import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { FilterPills } from './FilterPills';

const OPTIONS = [
  { value: 'a' as const, label: 'A' },
  { value: 'b' as const, label: 'B' },
  { value: 'c' as const, label: 'C' },
];

describe('<FilterPills />', () => {
  it('renders one button per option with its label', () => {
    render(<FilterPills options={OPTIONS} value="a" onChange={vi.fn()} ariaLabel="x" />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
  });

  it('marks the active pill with aria-pressed="true"', () => {
    render(<FilterPills options={OPTIONS} value="b" onChange={vi.fn()} ariaLabel="x" />);
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onChange with the value when a pill is clicked', () => {
    const onChange = vi.fn();
    render(<FilterPills options={OPTIONS} value="a" onChange={onChange} ariaLabel="x" />);
    fireEvent.click(screen.getByRole('button', { name: 'C' }));
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('sets aria-label on the container', () => {
    const { container } = render(
      <FilterPills options={OPTIONS} value="a" onChange={vi.fn()} ariaLabel="Filtro" />,
    );
    const root = container.querySelector('.filter-pills');
    expect(root).toHaveAttribute('aria-label', 'Filtro');
  });
});
