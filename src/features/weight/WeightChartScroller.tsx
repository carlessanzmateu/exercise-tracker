import { useEffect, useState, type TouchEvent } from 'react';

import { LineChart, type LinePoint, type ProjectionBand } from '@/components/charts/LineChart';
import { FilterPills, type FilterPillsOption } from '@/components/FilterPills';
import { linearRegression, predictionInterval } from '@/domain/metrics/regression';
import { aggregateByDay, type DailyWeightPoint } from '@/domain/weight/aggregateByDay';
import type { WeightEntry } from '@/domain/weight/weightEntry';
import {
  computeWindowRange,
  isLatestWindow,
  type WeightFilter,
  type WindowRange,
} from '@/domain/weight/window';

const DAY_MS = 86_400_000;

const FILTER_OPTIONS: FilterPillsOption<WeightFilter>[] = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'semester', label: 'Semestre' },
  { value: 'year', label: 'Año' },
  { value: 'ytd', label: 'YTD' },
];

const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatRangeLabel(filter: WeightFilter, range: WindowRange): string {
  const from = parseLocalDate(range.from);
  const to = parseLocalDate(range.to);
  switch (filter) {
    case 'week':
      return `${from.getDate()} ${MONTH_NAMES[from.getMonth()]} – ${to.getDate()} ${MONTH_NAMES[to.getMonth()]} ${to.getFullYear()}`;
    case 'month':
      return `${MONTH_NAMES[from.getMonth()].replace(/^./, (c) => c.toUpperCase())} ${from.getFullYear()}`;
    case 'quarter': {
      const qIndex = Math.floor(from.getMonth() / 3) + 1;
      return `T${qIndex} ${from.getFullYear()} (${MONTH_NAMES[from.getMonth()].slice(0, 3)}–${MONTH_NAMES[to.getMonth()].slice(0, 3)})`;
    }
    case 'semester': {
      const sIndex = Math.floor(from.getMonth() / 6) + 1;
      return `S${sIndex} ${from.getFullYear()} (${MONTH_NAMES[from.getMonth()].slice(0, 3)}–${MONTH_NAMES[to.getMonth()].slice(0, 3)})`;
    }
    case 'year':
      return String(from.getFullYear());
    case 'ytd':
      return `YTD: 1 ene – ${to.getDate()} ${MONTH_NAMES[to.getMonth()].slice(0, 3)}`;
  }
}

interface RegressionInput {
  x: number;
  y: number;
}

function buildRegressionPoints(points: DailyWeightPoint[]): RegressionInput[] {
  if (points.length === 0) return [];
  const baseMs = parseLocalDate(points[0].date).getTime();
  return points.map((p) => ({
    x: (parseLocalDate(p.date).getTime() - baseMs) / DAY_MS,
    y: p.avgKg,
  }));
}

function buildTrendOverlay(points: DailyWeightPoint[]): LinePoint[] | null {
  if (points.length < 2) return null;
  const regPoints = buildRegressionPoints(points);
  const reg = linearRegression(regPoints);
  const firstX = regPoints[0].x;
  const lastX = regPoints[regPoints.length - 1].x;
  return [
    { date: `${points[0].date}T00:00:00`, value: reg.predict(firstX) },
    { date: `${points[points.length - 1].date}T00:00:00`, value: reg.predict(lastX) },
  ];
}

function buildProjectionBand(
  points: DailyWeightPoint[],
  nextRange: WindowRange,
): ProjectionBand | null {
  if (points.length < 3) return null;
  const regPoints = buildRegressionPoints(points);
  const baseMs = parseLocalDate(points[0].date).getTime();
  const lastPoint = points[points.length - 1];
  const projDateMs = parseLocalDate(nextRange.to).getTime();
  const x0 = (projDateMs - baseMs) / DAY_MS;

  const { yHat, lower, upper } = predictionInterval(regPoints, x0, 0.8);
  const lastIso = `${lastPoint.date}T00:00:00`;
  const projIso = `${nextRange.to}T00:00:00`;

  return {
    center: [
      { date: lastIso, value: lastPoint.avgKg },
      { date: projIso, value: yHat },
    ],
    lower: [
      { date: lastIso, value: lastPoint.avgKg },
      { date: projIso, value: lower },
    ],
    upper: [
      { date: lastIso, value: lastPoint.avgKg },
      { date: projIso, value: upper },
    ],
  };
}

function useIsTabletOrAbove(): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(min-width: 640px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(min-width: 640px)');
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return matches;
}

interface WeightChartScrollerProps {
  entries: WeightEntry[];
  today?: Date;
  /** Override solo para tests. */
  isTabletOrAbove?: boolean;
}

const SWIPE_THRESHOLD_PX = 50;

export function WeightChartScroller({
  entries,
  today = new Date(),
  isTabletOrAbove,
}: WeightChartScrollerProps) {
  const [filter, setFilter] = useState<WeightFilter>('month');
  const [offsetUnits, setOffsetUnits] = useState<number>(0);
  const detectedTablet = useIsTabletOrAbove();
  const showArrows = isTabletOrAbove ?? detectedTablet;

  const isYtd = filter === 'ytd';

  const dailyPoints = aggregateByDay(entries);
  const range = computeWindowRange(filter, today, offsetUnits);
  const visible = dailyPoints.filter((p) => p.date >= range.from && p.date <= range.to);
  const linePoints: LinePoint[] = visible.map((p) => ({
    date: `${p.date}T00:00:00`,
    value: p.avgKg,
  }));

  const trendPoints = buildTrendOverlay(visible);
  const showProjection = !isYtd && isLatestWindow(range, today);
  const projectionBand = showProjection
    ? buildProjectionBand(visible, computeWindowRange(filter, today, offsetUnits + 1))
    : null;

  const rightDisabled = isYtd || offsetUnits >= 0;
  const prevRange = !isYtd ? computeWindowRange(filter, today, offsetUnits - 1) : null;
  const hasOlderData = prevRange !== null && dailyPoints.some((p) => p.date <= prevRange.to);
  const leftDisabled = isYtd || !hasOlderData;

  const goPrev = () => {
    if (leftDisabled) return;
    setOffsetUnits((n) => n - 1);
  };
  const goNext = () => {
    if (rightDisabled) return;
    setOffsetUnits((n) => Math.min(0, n + 1));
  };

  // Swipe handling.
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  function handleTouchStart(e: TouchEvent<HTMLDivElement>) {
    if (e.touches.length !== 1) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  }

  function handleTouchEnd(e: TouchEvent<HTMLDivElement>) {
    if (touchStartX === null || touchStartY === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY;
    const dx = endX - touchStartX;
    const dy = endY - touchStartY;
    setTouchStartX(null);
    setTouchStartY(null);
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    if (Math.abs(dy) > Math.abs(dx)) return; // mostly vertical → ignore
    if (dx < 0) {
      goPrev();
    } else {
      goNext();
    }
  }

  function handleFilterChange(next: WeightFilter) {
    setFilter(next);
    setOffsetUnits(0);
  }

  return (
    <section className="weight-chart">
      <FilterPills
        options={FILTER_OPTIONS}
        value={filter}
        onChange={handleFilterChange}
        ariaLabel="Filtro temporal del peso"
      />
      <header className="weight-chart__header">
        {showArrows ? (
          <button
            type="button"
            className="weight-chart__nav"
            onClick={goPrev}
            disabled={leftDisabled}
            aria-label="Ventana anterior"
          >
            ←
          </button>
        ) : null}
        <span className="weight-chart__range" data-testid="weight-chart-range">
          {formatRangeLabel(filter, range)}
        </span>
        {showArrows ? (
          <button
            type="button"
            className="weight-chart__nav"
            onClick={goNext}
            disabled={rightDisabled}
            aria-label="Ventana siguiente"
          >
            →
          </button>
        ) : null}
      </header>

      <div
        className="weight-chart__body"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {visible.length === 0 ? (
          <p className="chart-empty">Sin datos en esta ventana.</p>
        ) : (
          <LineChart
            data={linePoints}
            overlay={trendPoints ? { points: trendPoints } : undefined}
            projection={projectionBand ?? undefined}
            yLabel="kg"
            formatValue={(n) => n.toFixed(1)}
            ariaLabel={`Peso diario · ${formatRangeLabel(filter, range)}`}
          />
        )}
      </div>
    </section>
  );
}
