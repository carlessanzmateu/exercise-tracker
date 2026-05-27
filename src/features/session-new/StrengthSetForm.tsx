import { useState } from 'react';

import { newSetForShape } from '@/domain/factories';
import type { StrengthSet } from '@/domain/types';

export function StrengthSetForm({
  onAdd,
  initial,
  onCancel,
}: {
  onAdd: (set: StrengthSet) => void;
  initial?: StrengthSet;
  onCancel?: () => void;
}) {
  const [reps, setReps] = useState(initial ? String(initial.reps) : '');
  const [weight, setWeight] = useState(initial ? String(initial.weightKg) : '');

  function parseValid(): { reps: number; weightKg: number } | null {
    const r = Number.parseFloat(reps);
    const w = Number.parseFloat(weight);
    if (!Number.isFinite(r) || r <= 0) return null;
    if (!Number.isFinite(w) || w <= 0) return null;
    return { reps: r, weightKg: w };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = parseValid();
    if (!valid) return;
    const set: StrengthSet = initial
      ? { id: initial.id, ...valid }
      : newSetForShape('strength', valid);
    onAdd(set);
    if (!initial) {
      setReps('');
      setWeight('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="set-form set-form--strength">
      <label className="field">
        <span>Reps</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
      </label>
      <label className="field">
        <span>Peso (kg)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.5}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-secondary" disabled={parseValid() === null}>
        {initial ? 'Guardar' : 'Añadir serie'}
      </button>
      {onCancel ? (
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      ) : null}
    </form>
  );
}
