import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { useSessionRepository } from '@/data/useSessionRepository';
import type { UserProfile } from '@/domain/profile/userProfile';
import { normalizeWeightEntry, type WeightEntry } from '@/domain/weight/weightEntry';

import { BmrHeader } from './BmrHeader';
import { WeightChartScroller } from './WeightChartScroller';
import { WeightEntriesList } from './WeightEntriesList';

type ProfileState = 'loading' | UserProfile | null;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatLocalDateTimeInput(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

interface WeightProps {
  now?: () => Date;
}

export function Weight({ now = () => new Date() }: WeightProps = {}) {
  const repo = useSessionRepository();
  const [profile, setProfile] = useState<ProfileState>('loading');
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [kgInput, setKgInput] = useState<string>('');
  const [whenInput, setWhenInput] = useState<string>(() => formatLocalDateTimeInput(now()));
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo.getProfile().then((stored) => {
      if (!cancelled) setProfile(stored);
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  useEffect(() => {
    if (profile === 'loading' || profile === null) return;
    let cancelled = false;
    repo.listWeightEntries().then((list) => {
      if (!cancelled) setEntries(list);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, profile]);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError(null);
    const recordedAt = whenInput.length === 16 ? `${whenInput}:00` : whenInput;
    const candidate = normalizeWeightEntry({
      recordedAt,
      weightKg: Number(kgInput),
    });
    if (!candidate) {
      setAddError('Peso o fecha inválidos. El peso debe ser > 0 y la fecha parseable.');
      return;
    }
    await repo.addWeightEntry(candidate);
    setKgInput('');
    const refreshed = await repo.listWeightEntries();
    setEntries(refreshed);
  }

  async function handleUpdate(
    id: string,
    partial: { recordedAt: string; weightKg: number },
  ): Promise<void> {
    await repo.updateWeightEntry(id, partial);
    const refreshed = await repo.listWeightEntries();
    setEntries(refreshed);
  }

  async function handleDelete(id: string): Promise<void> {
    await repo.deleteWeightEntry(id);
    const refreshed = await repo.listWeightEntries();
    setEntries(refreshed);
  }

  const entriesDesc = [...entries].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));

  if (profile === 'loading') {
    return (
      <section data-testid="route-weight" aria-busy="true">
        <h2 className="page-title">Peso</h2>
        <p>Cargando…</p>
      </section>
    );
  }

  if (profile === null) {
    return (
      <section data-testid="route-weight">
        <h2 className="page-title">Peso</h2>
        <p>Configura tu perfil para empezar a registrar tu peso y ver tu BMR.</p>
        <Link to="/settings#perfil" className="btn btn-primary feed-cta">
          Configurar perfil
        </Link>
      </section>
    );
  }

  return (
    <section data-testid="route-weight">
      <h2 className="page-title">Peso</h2>

      <BmrHeader profile={profile} entries={entries} now={now} />

      <form className="weight-form" onSubmit={handleAdd} noValidate>
        <div className="weight-form__row">
          <label htmlFor="weight-kg">Peso (kg)</label>
          <input
            id="weight-kg"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="20"
            max="400"
            value={kgInput}
            onChange={(e) => setKgInput(e.target.value)}
            required
          />
        </div>
        <div className="weight-form__row">
          <label htmlFor="weight-when">Fecha y hora</label>
          <input
            id="weight-when"
            type="datetime-local"
            value={whenInput}
            onChange={(e) => setWhenInput(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-full">
          Guardar peso
        </button>
      </form>
      {addError ? (
        <p role="alert" className="alert-error">
          {addError}
        </p>
      ) : null}

      <WeightChartScroller entries={entries} today={now()} />

      <WeightEntriesList entries={entriesDesc} onUpdate={handleUpdate} onDelete={handleDelete} />
    </section>
  );
}
