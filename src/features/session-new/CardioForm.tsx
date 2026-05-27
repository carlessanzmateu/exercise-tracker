import { useState } from 'react';

import { newCardioBlock } from '@/domain/factories';
import type { CardioData } from '@/domain/types';

export function CardioForm({
  initial,
  onSubmit,
}: {
  initial?: CardioData;
  onSubmit: (cardio: CardioData) => void;
}) {
  const [duration, setDuration] = useState(
    initial && initial.durationMinutes > 0 ? String(initial.durationMinutes) : '',
  );
  const [distance, setDistance] = useState(
    initial?.distanceKm !== undefined ? String(initial.distanceKm) : '',
  );

  function parseValid(): { durationMinutes: number; distanceKm?: number } | null {
    const d = Number.parseFloat(duration);
    if (!Number.isFinite(d) || d <= 0) return null;
    if (distance.trim() === '') return { durationMinutes: d };
    const km = Number.parseFloat(distance);
    if (!Number.isFinite(km) || km < 0) return null;
    return { durationMinutes: d, distanceKm: km };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = parseValid();
    if (!valid) return;
    onSubmit(newCardioBlock(valid));
  }

  return (
    <form onSubmit={handleSubmit} className="cardio-form">
      <label className="field">
        <span>Duración (minutos)</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </label>
      <label className="field">
        <span>Distancia (km, opcional)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-secondary" disabled={parseValid() === null}>
        Guardar bloque
      </button>
    </form>
  );
}
