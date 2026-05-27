import { useState } from 'react';

import { newSetForShape } from '@/domain/factories';
import type { TimeSet } from '@/domain/types';

export function TimeSetForm({
  onAdd,
  initial,
  onCancel,
}: {
  onAdd: (set: TimeSet) => void;
  initial?: TimeSet;
  onCancel?: () => void;
}) {
  const [reps, setReps] = useState(initial ? String(initial.reps) : '');
  const [seconds, setSeconds] = useState(initial ? String(initial.durationSeconds) : '');

  function parseValid(): { reps: number; durationSeconds: number } | null {
    const r = Number.parseFloat(reps);
    const s = Number.parseFloat(seconds);
    if (!Number.isFinite(r) || r <= 0) return null;
    if (!Number.isFinite(s) || s <= 0) return null;
    return { reps: r, durationSeconds: s };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = parseValid();
    if (!valid) return;
    const set: TimeSet = initial ? { id: initial.id, ...valid } : newSetForShape('time', valid);
    onAdd(set);
    if (!initial) {
      setReps('');
      setSeconds('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="set-form set-form--time">
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
        <span>Tiempo (segundos)</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
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
