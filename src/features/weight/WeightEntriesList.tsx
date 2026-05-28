import { useState, type FormEvent } from 'react';

import { normalizeWeightEntry, type WeightEntry } from '@/domain/weight/weightEntry';

interface WeightEntriesListProps {
  entries: WeightEntry[];
  onUpdate: (id: string, partial: { recordedAt: string; weightKg: number }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toDatetimeInputValue(recordedAt: string): string {
  // recordedAt is 'YYYY-MM-DDTHH:mm:ss' or similar parseable string.
  const d = new Date(recordedAt);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatHumanDate(recordedAt: string): string {
  const d = new Date(recordedAt);
  if (Number.isNaN(d.getTime())) return recordedAt;
  return d.toLocaleString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WeightEntriesList({ entries, onUpdate, onDelete }: WeightEntriesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKg, setEditKg] = useState<string>('');
  const [editWhen, setEditWhen] = useState<string>('');

  function startEdit(entry: WeightEntry) {
    setEditingId(entry.id);
    setEditKg(String(entry.weightKg));
    setEditWhen(toDatetimeInputValue(entry.recordedAt));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditKg('');
    setEditWhen('');
  }

  async function handleSubmitEdit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const recordedAt = editWhen.length === 16 ? `${editWhen}:00` : editWhen;
    const candidate = normalizeWeightEntry({
      id,
      recordedAt,
      weightKg: Number(editKg),
    });
    if (!candidate) return;
    await onUpdate(id, { recordedAt: candidate.recordedAt, weightKg: candidate.weightKg });
    cancelEdit();
  }

  function handleDelete(id: string) {
    if (window.confirm('¿Eliminar esta entrada de peso?')) {
      void onDelete(id);
    }
  }

  if (entries.length === 0) {
    return (
      <section className="weight-entries">
        <h3 className="weight-entries__title">Entradas</h3>
        <p className="weight-entries__empty">Aún no has registrado pesos.</p>
      </section>
    );
  }

  return (
    <section className="weight-entries">
      <h3 className="weight-entries__title">Entradas</h3>
      <ul className="weight-entries__list">
        {entries.map((entry) => (
          <li key={entry.id} className="weight-entries__item" data-testid="weight-entry">
            {editingId === entry.id ? (
              <form
                className="weight-entries__edit"
                onSubmit={(e) => handleSubmitEdit(e, entry.id)}
              >
                <label htmlFor={`edit-kg-${entry.id}`}>Peso (kg)</label>
                <input
                  id={`edit-kg-${entry.id}`}
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="20"
                  max="400"
                  value={editKg}
                  onChange={(e) => setEditKg(e.target.value)}
                  required
                />
                <label htmlFor={`edit-when-${entry.id}`}>Fecha y hora</label>
                <input
                  id={`edit-when-${entry.id}`}
                  type="datetime-local"
                  value={editWhen}
                  onChange={(e) => setEditWhen(e.target.value)}
                  required
                />
                <div className="weight-entries__edit-actions">
                  <button type="submit" className="btn btn-primary">
                    Guardar
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="weight-entries__data">
                  <span className="weight-entries__weight">{entry.weightKg.toFixed(1)} kg</span>
                  <span className="weight-entries__date">{formatHumanDate(entry.recordedAt)}</span>
                </div>
                <div className="weight-entries__actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => startEdit(entry)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Borrar
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
