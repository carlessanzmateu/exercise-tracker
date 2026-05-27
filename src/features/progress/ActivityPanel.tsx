import { useEffect, useState } from 'react';

import { LineChart } from '@/components/charts/LineChart';
import { SegmentedControl, type SegmentedOption } from '@/components/SegmentedControl';
import { useSessionRepository } from '@/data/useSessionRepository';
import type { HealthDay } from '@/domain/health/healthDay';
import { buildActivitySeries } from '@/domain/metrics/activity';
import type { Granularity } from '@/domain/metrics/frequency';
import { movingAverage } from '@/domain/metrics/movingAverage';

const PERIOD_OPTIONS: SegmentedOption<Granularity>[] = [
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Año' },
];

export function ActivityPanel() {
  const repo = useSessionRepository();
  const [days, setDays] = useState<HealthDay[] | null>(null);
  const [granularity, setGranularity] = useState<Granularity>('month');

  useEffect(() => {
    let cancelled = false;
    repo.listHealthDays().then((d) => {
      if (!cancelled) setDays(d);
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  if (days === null) {
    return (
      <p aria-busy="true" className="chart-empty">
        Cargando…
      </p>
    );
  }

  if (days.length === 0) {
    return (
      <p className="chart-empty">
        Aún no hay datos de Salud. Impórtalos desde Ajustes (Importar datos de Salud).
      </p>
    );
  }

  const series = buildActivitySeries(days, granularity);
  const stepsMovingAvg = movingAverage(series.steps, 7);

  return (
    <div className="activity-panel">
      <SegmentedControl
        options={PERIOD_OPTIONS}
        value={granularity}
        onChange={setGranularity}
        ariaLabel="Periodo de actividad"
      />

      <p className="activity-summary">
        Total: {Math.round(series.totalSteps)} pasos · media {Math.round(series.avgSteps)}/día
      </p>
      <LineChart
        data={series.steps}
        overlay={{ points: stepsMovingAvg }}
        yLabel="pasos"
        ariaLabel="Pasos diarios"
      />

      <p className="activity-summary">
        Distancia: {series.totalDistanceKm.toFixed(1)} km · media {series.avgDistanceKm.toFixed(1)}{' '}
        km/día
      </p>
      <LineChart
        data={series.distanceKm}
        yLabel="km"
        formatValue={(n) => n.toFixed(1)}
        ariaLabel="Distancia diaria"
      />
    </div>
  );
}
