import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { SegmentedControl, type SegmentedOption } from './SegmentedControl';

type Period = 'month' | 'quarter' | 'year';

const options: SegmentedOption<Period>[] = [
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Año' },
];

describe('<SegmentedControl />', () => {
  it('renders one button per option', () => {
    render(
      <SegmentedControl options={options} value="month" onChange={vi.fn()} ariaLabel="Periodo" />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('marks the selected option with aria-pressed="true"', () => {
    render(
      <SegmentedControl options={options} value="quarter" onChange={vi.fn()} ariaLabel="Periodo" />,
    );
    expect(screen.getByRole('button', { name: 'Trimestre' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Mes' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with the value when an option is clicked', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl options={options} value="month" onChange={onChange} ariaLabel="Periodo" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Año' }));
    expect(onChange).toHaveBeenCalledWith('year');
  });

  it('exposes the group aria-label', () => {
    render(
      <SegmentedControl options={options} value="month" onChange={vi.fn()} ariaLabel="Periodo" />,
    );
    expect(screen.getByRole('group', { name: 'Periodo' })).toBeInTheDocument();
  });
});
