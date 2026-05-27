import type { Session } from '@/domain/types';

export type Granularity = 'month' | 'quarter' | 'year';

export interface FrequencyBucket {
  key: string;
  label: string;
  count: number;
}

export interface FrequencyResult {
  buckets: FrequencyBucket[];
  average: number;
}

const MONTHS_ABBR = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// Índice entero monótono del periodo al que pertenece la fecha (hora local).
// Permite enumerar periodos consecutivos y rellenar huecos.
export function periodIndex(date: Date, granularity: Granularity): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  switch (granularity) {
    case 'month':
      return year * 12 + month;
    case 'quarter':
      return year * 4 + Math.floor(month / 3);
    case 'year':
      return year;
  }
}

export function bucketKeyLabel(
  index: number,
  granularity: Granularity,
): { key: string; label: string } {
  switch (granularity) {
    case 'month': {
      const year = Math.floor(index / 12);
      const month = index % 12;
      return { key: `${year}-${pad2(month + 1)}`, label: `${MONTHS_ABBR[month]} ${year}` };
    }
    case 'quarter': {
      const year = Math.floor(index / 4);
      const quarter = (index % 4) + 1;
      return { key: `${year}-Q${quarter}`, label: `T${quarter} ${year}` };
    }
    case 'year':
      return { key: `${index}`, label: `${index}` };
  }
}

export function aggregateFrequency(sessions: Session[], granularity: Granularity): FrequencyResult {
  if (sessions.length === 0) return { buckets: [], average: 0 };

  const counts = new Map<number, number>();
  for (const session of sessions) {
    const index = periodIndex(new Date(session.startedAt), granularity);
    counts.set(index, (counts.get(index) ?? 0) + 1);
  }

  const indices = [...counts.keys()];
  const min = Math.min(...indices);
  const max = Math.max(...indices);

  const buckets: FrequencyBucket[] = [];
  for (let index = min; index <= max; index += 1) {
    const { key, label } = bucketKeyLabel(index, granularity);
    buckets.push({ key, label, count: counts.get(index) ?? 0 });
  }

  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  return { buckets, average: total / buckets.length };
}
