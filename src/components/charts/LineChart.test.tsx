import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { LineChart, type LinePoint, type ProjectionBand } from './LineChart';

const data: LinePoint[] = [
  { date: '2026-01-01T00:00:00.000Z', value: 100 },
  { date: '2026-02-01T00:00:00.000Z', value: 110 },
  { date: '2026-03-01T00:00:00.000Z', value: 120 },
];

describe('<LineChart />', () => {
  it('renders an svg with the given aria-label', () => {
    const { container } = render(<LineChart data={data} ariaLabel="Progreso de 1RM" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Progreso de 1RM');
  });

  it('draws a path with class "chart-line" for the data', () => {
    const { container } = render(<LineChart data={data} ariaLabel="x" />);
    const line = container.querySelector('path.chart-line');
    expect(line).toBeInTheDocument();
    expect(line).toHaveAttribute('d');
  });

  it('renders Y axis tick labels', () => {
    const { container } = render(<LineChart data={data} ariaLabel="x" />);
    expect(container.querySelectorAll('.chart-tick--y').length).toBeGreaterThan(0);
  });

  it('renders a projection band and projected line when projection is provided', () => {
    const projection: ProjectionBand = {
      center: [
        { date: '2026-03-01T00:00:00.000Z', value: 120 },
        { date: '2026-04-01T00:00:00.000Z', value: 130 },
      ],
      lower: [
        { date: '2026-03-01T00:00:00.000Z', value: 120 },
        { date: '2026-04-01T00:00:00.000Z', value: 122 },
      ],
      upper: [
        { date: '2026-03-01T00:00:00.000Z', value: 120 },
        { date: '2026-04-01T00:00:00.000Z', value: 138 },
      ],
    };
    const { container } = render(<LineChart data={data} projection={projection} ariaLabel="x" />);
    expect(container.querySelector('.chart-band')).toBeInTheDocument();
    expect(container.querySelector('.chart-line--projected')).toBeInTheDocument();
  });

  it('shows an empty state when data is empty', () => {
    render(<LineChart data={[]} ariaLabel="x" />);
    expect(screen.getByText(/sin datos/i)).toBeInTheDocument();
  });

  it('renders a secondary overlay line when overlay is provided', () => {
    const { container } = render(
      <LineChart data={data} overlay={{ points: data }} ariaLabel="x" />,
    );
    expect(container.querySelector('.chart-line--overlay')).toBeInTheDocument();
  });

  it('uses day/month ticks (distinct per day) when the range spans only a few days', () => {
    const shortRange: LinePoint[] = [
      { date: '2026-05-26', value: 1000 },
      { date: '2026-05-27', value: 1500 },
      { date: '2026-05-28', value: 2000 },
    ];
    const { container } = render(<LineChart data={shortRange} ariaLabel="x" />);
    const ticks = Array.from(container.querySelectorAll('.chart-tick--x')).map(
      (n) => n.textContent ?? '',
    );
    expect(ticks.length).toBeGreaterThan(1);
    expect(ticks.every((t) => /^\d{1,2}\/\d{1,2}$/.test(t))).toBe(true);
    // The day component must vary between ticks (the bug was: all collapsed to "5/26").
    const days = ticks.map((t) => t.split('/')[0]);
    expect(new Set(days).size).toBeGreaterThan(1);
  });

  it('uses month/year ticks when the range spans several months', () => {
    const multiMonth: LinePoint[] = [
      { date: '2026-01-01T00:00:00.000Z', value: 1 },
      { date: '2026-04-01T00:00:00.000Z', value: 2 },
      { date: '2026-07-01T00:00:00.000Z', value: 3 },
    ];
    const { container } = render(<LineChart data={multiMonth} ariaLabel="x" />);
    const ticks = Array.from(container.querySelectorAll('.chart-tick--x')).map(
      (n) => n.textContent ?? '',
    );
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.every((t) => /^\d{1,2}\/\d{2}$/.test(t))).toBe(true);
  });

  it('uses four-digit year ticks when the range spans more than two years', () => {
    const multiYear: LinePoint[] = [
      { date: '2022-01-01T00:00:00.000Z', value: 1 },
      { date: '2024-01-01T00:00:00.000Z', value: 2 },
      { date: '2026-01-01T00:00:00.000Z', value: 3 },
    ];
    const { container } = render(<LineChart data={multiYear} ariaLabel="x" />);
    const ticks = Array.from(container.querySelectorAll('.chart-tick--x')).map(
      (n) => n.textContent ?? '',
    );
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.every((t) => /^\d{4}$/.test(t))).toBe(true);
  });
});
