import type { HealthDay } from '@/domain/health/healthDay';

import type { Granularity } from './frequency';

export interface ActivityPoint {
  date: string;
  value: number;
}

export interface ActivitySeries {
  steps: ActivityPoint[];
  distanceKm: ActivityPoint[];
  totalSteps: number;
  totalDistanceKm: number;
  avgSteps: number;
  avgDistanceKm: number;
  dayCount: number;
}

const DAY_MS = 86_400_000;

const WINDOW_DAYS: Record<Granularity, number> = {
  month: 30,
  quarter: 90,
  year: 365,
};

function dayMs(date: string): number {
  return new Date(`${date}T00:00:00.000Z`).getTime();
}

const EMPTY: ActivitySeries = {
  steps: [],
  distanceKm: [],
  totalSteps: 0,
  totalDistanceKm: 0,
  avgSteps: 0,
  avgDistanceKm: 0,
  dayCount: 0,
};

// Series diarias de pasos y distancia dentro de una ventana trailing (relativa al día más reciente),
// más totales y media diaria sobre los días presentes en la ventana.
export function buildActivitySeries(days: HealthDay[], granularity: Granularity): ActivitySeries {
  if (days.length === 0) return { ...EMPTY };

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const lastMs = dayMs(sorted[sorted.length - 1].date);
  const cutoffMs = lastMs - WINDOW_DAYS[granularity] * DAY_MS;

  const windowed = sorted.filter((d) => dayMs(d.date) > cutoffMs);
  if (windowed.length === 0) return { ...EMPTY };

  const totalSteps = windowed.reduce((sum, d) => sum + d.steps, 0);
  const totalDistanceKm = windowed.reduce((sum, d) => sum + d.distanceKm, 0);
  const dayCount = windowed.length;

  return {
    steps: windowed.map((d) => ({ date: d.date, value: d.steps })),
    distanceKm: windowed.map((d) => ({ date: d.date, value: d.distanceKm })),
    totalSteps,
    totalDistanceKm,
    avgSteps: totalSteps / dayCount,
    avgDistanceKm: totalDistanceKm / dayCount,
    dayCount,
  };
}
