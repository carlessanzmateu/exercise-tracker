import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { BarChart, type Bar } from './BarChart';

const bars: Bar[] = [
  { label: 'Ene', value: 2 },
  { label: 'Feb', value: 0 },
  { label: 'Mar', value: 3 },
];

describe('<BarChart />', () => {
  it('renders an svg with the given aria-label', () => {
    const { container } = render(<BarChart bars={bars} ariaLabel="Sesiones por mes" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Sesiones por mes');
  });

  it('renders one rect per bar', () => {
    const { container } = render(<BarChart bars={bars} ariaLabel="x" />);
    expect(container.querySelectorAll('rect.chart-bar')).toHaveLength(3);
  });

  it('renders the X axis label for each bar', () => {
    render(<BarChart bars={bars} ariaLabel="x" />);
    expect(screen.getByText('Ene')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
  });

  it('renders an average line when averageValue is provided', () => {
    const { container } = render(<BarChart bars={bars} averageValue={1.67} ariaLabel="x" />);
    expect(container.querySelector('.chart-average')).toBeInTheDocument();
  });

  it('does not render an average line when averageValue is omitted', () => {
    const { container } = render(<BarChart bars={bars} ariaLabel="x" />);
    expect(container.querySelector('.chart-average')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no bars', () => {
    render(<BarChart bars={[]} ariaLabel="x" />);
    expect(screen.getByText(/sin datos/i)).toBeInTheDocument();
  });
});
