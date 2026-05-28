import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { WeightEntry } from '@/domain/weight/weightEntry';

import { WeightChartScroller } from './WeightChartScroller';

const TODAY = new Date(2026, 4, 28); // 28 may 2026

function entry(id: string, recordedAt: string, weightKg: number): WeightEntry {
  return { id, recordedAt, weightKg };
}

describe('<WeightChartScroller />', () => {
  it('renders 6 filter pills (Sem/Mes/Trim/Sem(estre)/Año/YTD)', () => {
    render(<WeightChartScroller entries={[]} today={TODAY} isTabletOrAbove={false} />);
    expect(screen.getByRole('button', { name: /^semana$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^mes$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^trimestre$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^semestre$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^año$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ytd$/i })).toBeInTheDocument();
  });

  it('shows an empty state when no entries fall in the visible window', () => {
    render(<WeightChartScroller entries={[]} today={TODAY} isTabletOrAbove={false} />);
    expect(screen.getByText(/sin datos en esta ventana/i)).toBeInTheDocument();
  });

  it('does not render arrow buttons on mobile (isTabletOrAbove=false)', () => {
    render(<WeightChartScroller entries={[]} today={TODAY} isTabletOrAbove={false} />);
    expect(screen.queryByRole('button', { name: /ventana anterior/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /ventana siguiente/i })).toBeNull();
  });

  it('renders arrow buttons on tablet+ (isTabletOrAbove=true)', () => {
    render(<WeightChartScroller entries={[]} today={TODAY} isTabletOrAbove={true} />);
    expect(screen.getByRole('button', { name: /ventana anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ventana siguiente/i })).toBeInTheDocument();
  });

  it('disables the right arrow at offsetUnits = 0', () => {
    render(<WeightChartScroller entries={[]} today={TODAY} isTabletOrAbove={true} />);
    expect(screen.getByRole('button', { name: /ventana siguiente/i })).toBeDisabled();
  });

  it('disables the left arrow when no older data exists', () => {
    const entries: WeightEntry[] = [
      entry('a', '2026-05-15T08:00:00', 75),
      entry('b', '2026-05-28T08:00:00', 76),
    ];
    render(<WeightChartScroller entries={entries} today={TODAY} isTabletOrAbove={true} />);
    expect(screen.getByRole('button', { name: /ventana anterior/i })).toBeDisabled();
  });

  it('enables the left arrow when older data exists (previous month has entries)', () => {
    const entries: WeightEntry[] = [
      entry('old', '2026-04-15T08:00:00', 74),
      entry('cur', '2026-05-28T08:00:00', 76),
    ];
    render(<WeightChartScroller entries={entries} today={TODAY} isTabletOrAbove={true} />);
    expect(screen.getByRole('button', { name: /ventana anterior/i })).not.toBeDisabled();
  });

  it('navigates back when clicking the left arrow (tablet+)', () => {
    const entries: WeightEntry[] = [
      entry('apr', '2026-04-15T08:00:00', 74),
      entry('may', '2026-05-28T08:00:00', 76),
    ];
    render(<WeightChartScroller entries={entries} today={TODAY} isTabletOrAbove={true} />);
    fireEvent.click(screen.getByRole('button', { name: /ventana anterior/i }));
    // After going back, the right arrow should become enabled.
    expect(screen.getByRole('button', { name: /ventana siguiente/i })).not.toBeDisabled();
  });

  it('disables both arrows when filter is YTD', () => {
    const entries: WeightEntry[] = [entry('a', '2026-04-15T08:00:00', 74)];
    render(<WeightChartScroller entries={entries} today={TODAY} isTabletOrAbove={true} />);
    fireEvent.click(screen.getByRole('button', { name: /^ytd$/i }));
    expect(screen.getByRole('button', { name: /ventana anterior/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /ventana siguiente/i })).toBeDisabled();
  });

  it('changes the visible window when switching the filter', () => {
    const entries: WeightEntry[] = [
      entry('older', '2026-04-15T08:00:00', 74),
      entry('current', '2026-05-28T08:00:00', 76),
    ];
    const { container } = render(
      <WeightChartScroller entries={entries} today={TODAY} isTabletOrAbove={true} />,
    );
    // Default month window: only the current entry is visible.
    // Switch to year: both entries should fall in window. The chart line path should change.
    const pathBefore = container.querySelector('path.chart-line')?.getAttribute('d');
    fireEvent.click(screen.getByRole('button', { name: /^año$/i }));
    const pathAfter = container.querySelector('path.chart-line')?.getAttribute('d');
    expect(pathAfter).not.toBe(pathBefore);
  });

  it('renders a range label in the header', () => {
    const entries: WeightEntry[] = [entry('a', '2026-05-15T08:00:00', 75)];
    render(<WeightChartScroller entries={entries} today={TODAY} isTabletOrAbove={true} />);
    // Default month: header should mention "mayo 2026" (case-insensitive).
    expect(screen.getByTestId('weight-chart-range').textContent).toMatch(/mayo.*2026/i);
  });
});

describe('<WeightChartScroller /> trend and projection (F6-T015)', () => {
  it('does not draw a trend overlay when fewer than 2 visible points exist', () => {
    const entries: WeightEntry[] = [entry('a', '2026-05-15T08:00:00', 75)];
    const { container } = render(
      <WeightChartScroller entries={entries} today={TODAY} isTabletOrAbove={false} />,
    );
    expect(container.querySelector('.chart-line--overlay')).toBeNull();
  });

  it('draws a trend overlay when 2+ visible points exist', () => {
    const entries: WeightEntry[] = [
      entry('a', '2026-05-10T08:00:00', 75),
      entry('b', '2026-05-15T08:00:00', 76),
      entry('c', '2026-05-20T08:00:00', 77),
    ];
    const { container } = render(
      <WeightChartScroller entries={entries} today={TODAY} isTabletOrAbove={false} />,
    );
    expect(container.querySelector('.chart-line--overlay')).not.toBeNull();
  });

  it('draws a projection band 1 unit ahead in the latest window (today belongs to it)', () => {
    const entries: WeightEntry[] = [
      entry('a', '2026-05-10T08:00:00', 75),
      entry('b', '2026-05-15T08:00:00', 76),
      entry('c', '2026-05-20T08:00:00', 77),
    ];
    const { container } = render(
      <WeightChartScroller entries={entries} today={TODAY} isTabletOrAbove={true} />,
    );
    expect(container.querySelector('.chart-band')).not.toBeNull();
    expect(container.querySelector('.chart-line--projected')).not.toBeNull();
  });

  it('does not draw a projection when scrolled to a historical window', () => {
    const entries: WeightEntry[] = [
      entry('a1', '2026-04-05T08:00:00', 74),
      entry('a2', '2026-04-10T08:00:00', 75),
      entry('a3', '2026-04-15T08:00:00', 75),
      entry('b1', '2026-05-10T08:00:00', 76),
      entry('b2', '2026-05-15T08:00:00', 77),
      entry('b3', '2026-05-20T08:00:00', 78),
    ];
    const { container } = render(
      <WeightChartScroller entries={entries} today={TODAY} isTabletOrAbove={true} />,
    );
    // Scroll back to April.
    fireEvent.click(screen.getByRole('button', { name: /ventana anterior/i }));
    expect(container.querySelector('.chart-band')).toBeNull();
    expect(container.querySelector('.chart-line--projected')).toBeNull();
    // But the trend overlay must still be there (>= 2 points in April).
    expect(container.querySelector('.chart-line--overlay')).not.toBeNull();
  });
});
