import { useState } from 'react';

import { BarChart } from '@/components/charts/BarChart';
import { SegmentedControl, type SegmentedOption } from '@/components/SegmentedControl';
import { aggregateFrequency, type Granularity } from '@/domain/metrics/frequency';
import type { Session } from '@/domain/types';

const PERIOD_OPTIONS: SegmentedOption<Granularity>[] = [
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Año' },
];

const UNIT_LABEL: Record<Granularity, string> = {
  month: 'mes',
  quarter: 'trimestre',
  year: 'año',
};

export function FrequencyPanel({ sessions }: { sessions: Session[] }) {
  const [granularity, setGranularity] = useState<Granularity>('month');
  const { buckets, average } = aggregateFrequency(sessions, granularity);

  const bars = buckets.map((b) => ({ label: b.label, value: b.count }));
  const averageText = average.toLocaleString('es-ES', { maximumFractionDigits: 1 });

  return (
    <div className="frequency-panel">
      <SegmentedControl
        options={PERIOD_OPTIONS}
        value={granularity}
        onChange={setGranularity}
        ariaLabel="Periodo de frecuencia"
      />
      <BarChart
        bars={bars}
        averageValue={buckets.length > 0 ? average : undefined}
        ariaLabel="Sesiones por periodo"
      />
      {buckets.length > 0 && (
        <p className="frequency-average">
          Media: {averageText} sesiones/{UNIT_LABEL[granularity]}
        </p>
      )}
    </div>
  );
}
