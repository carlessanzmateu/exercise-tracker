import { BarChart } from '@/components/charts/BarChart';
import { tonnageByPeriod } from '@/domain/metrics/volume';
import type { Session } from '@/domain/types';

export function TonnagePanel({ sessions }: { sessions: Session[] }) {
  const buckets = tonnageByPeriod(sessions, 'month');
  const bars = buckets.map((b) => ({ label: b.label, value: b.tonnageKg }));

  return (
    <div className="tonnage-panel">
      <BarChart
        bars={bars}
        formatValue={(n) => `${Math.round(n)} kg`}
        ariaLabel="Tonelaje total por mes"
      />
      {bars.length > 0 && <p className="panel-note">Solo cuentan las series con peso (kg).</p>}
    </div>
  );
}
