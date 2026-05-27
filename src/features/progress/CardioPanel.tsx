import { LineChart } from '@/components/charts/LineChart';
import { cardioByPeriod, cardioTotals } from '@/domain/metrics/cardio';
import type { Session } from '@/domain/types';

export function CardioPanel({ sessions }: { sessions: Session[] }) {
  const buckets = cardioByPeriod(sessions, 'month');

  if (buckets.length === 0) {
    return <p className="chart-empty">Sin datos de cardio todavía.</p>;
  }

  const { totalDistanceKm, totalDurationMinutes } = cardioTotals(sessions);
  const distanceSeries = buckets.map((b) => ({ date: b.key, value: b.distanceKm }));

  return (
    <div className="cardio-panel">
      <p className="cardio-totals">
        Distancia total: {Math.round(totalDistanceKm)} km · Duración total:{' '}
        {Math.round(totalDurationMinutes)} min
      </p>
      <LineChart
        data={distanceSeries}
        yLabel="km"
        formatValue={(n) => `${Math.round(n)}`}
        ariaLabel="Distancia de cardio en el tiempo"
      />
    </div>
  );
}
