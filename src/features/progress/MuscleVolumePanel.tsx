import { BarChart } from '@/components/charts/BarChart';
import { volumeByCategory } from '@/domain/metrics/volume';
import type { Session } from '@/domain/types';

export function MuscleVolumePanel({ sessions }: { sessions: Session[] }) {
  const data = volumeByCategory(sessions);
  const bars = data.map((d) => ({ label: d.category, value: d.volumeKg }));

  return (
    <div className="muscle-volume-panel">
      <BarChart
        bars={bars}
        formatValue={(n) => `${Math.round(n)} kg`}
        ariaLabel="Volumen por grupo muscular"
      />
      {bars.length > 0 && <p className="panel-note">Solo cuentan las series con peso (kg).</p>}
    </div>
  );
}
