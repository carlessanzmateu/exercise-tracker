import type { WeightEntry } from './weightEntry';

export interface DailyWeightPoint {
  date: string; // 'YYYY-MM-DD' (día local)
  avgKg: number; // media aritmética del peso del día (redondeada a 1 decimal)
  count: number; // número de entradas agregadas ese día
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function localDateKey(isoDate: string): string | null {
  const ms = new Date(isoDate).getTime();
  if (Number.isNaN(ms)) return null;
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function roundTo1Decimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function aggregateByDay(entries: WeightEntry[]): DailyWeightPoint[] {
  const buckets = new Map<string, { sum: number; count: number }>();

  for (const entry of entries) {
    const key = localDateKey(entry.recordedAt);
    if (key === null) continue;
    const bucket = buckets.get(key) ?? { sum: 0, count: 0 };
    bucket.sum += entry.weightKg;
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .map(([date, { sum, count }]) => ({
      date,
      avgKg: roundTo1Decimal(sum / count),
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
