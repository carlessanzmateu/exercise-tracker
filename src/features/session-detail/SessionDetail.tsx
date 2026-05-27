import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useSessionRepository } from '@/data/useSessionRepository';
import { getExerciseTypeById } from '@/domain/catalog';
import type {
  BodyweightExercise,
  BodyweightSet,
  CardioExercise,
  Exercise,
  Session,
  StrengthExercise,
  StrengthSet,
  TimeExercise,
  TimeSet,
} from '@/domain/types';
import { formatSessionDate } from '@/features/feed/formatSessionDate';
import { BodyweightSetForm } from '@/features/session-new/BodyweightSetForm';
import { StrengthSetForm } from '@/features/session-new/StrengthSetForm';
import { TimeSetForm } from '@/features/session-new/TimeSetForm';

type SetBasedExercise = StrengthExercise | BodyweightExercise | TimeExercise;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toLocalDateTimeInput(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function describeSet(exercise: SetBasedExercise, set: SetBasedExercise['sets'][number]): string {
  if (exercise.shape === 'strength') {
    const s = set as StrengthSet;
    return `${s.reps} reps · ${s.weightKg} kg`;
  }
  if (exercise.shape === 'bodyweight') {
    const s = set as BodyweightSet;
    return s.weightKg !== undefined ? `${s.reps} reps · ${s.weightKg} kg` : `${s.reps} reps`;
  }
  const s = set as TimeSet;
  return `${s.reps} reps · ${s.durationSeconds} s`;
}

function CardioBlockSummary({ exercise }: { exercise: CardioExercise }) {
  const { durationMinutes, distanceKm } = exercise.cardio;
  return (
    <p className="cardio-block-summary">
      {durationMinutes} min
      {distanceKm !== undefined ? ` · ${distanceKm} km` : ''}
    </p>
  );
}

function EditableSet({
  exercise,
  set,
  index,
  onChange,
  onDelete,
}: {
  exercise: SetBasedExercise;
  set: SetBasedExercise['sets'][number];
  index: number;
  onChange: (next: SetBasedExercise['sets'][number]) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);

  function handleDelete() {
    if (window.confirm('¿Eliminar serie?')) {
      onDelete();
    }
  }

  if (editing) {
    if (exercise.shape === 'strength') {
      return (
        <li>
          <StrengthSetForm
            initial={set as StrengthSet}
            onAdd={(edited) => {
              onChange(edited);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </li>
      );
    }
    if (exercise.shape === 'bodyweight') {
      return (
        <li>
          <BodyweightSetForm
            initial={set as BodyweightSet}
            onAdd={(edited) => {
              onChange(edited);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </li>
      );
    }
    return (
      <li>
        <TimeSetForm
          initial={set as TimeSet}
          onAdd={(edited) => {
            onChange(edited);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li data-set-id={set.id} className="set-row">
      <span>Serie {index + 1}</span>
      <span className="set-row__desc">{describeSet(exercise, set)}</span>
      <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
        Editar
      </button>
      <button type="button" className="btn btn-danger" onClick={handleDelete}>
        Eliminar serie
      </button>
    </li>
  );
}

function ExerciseDetail({
  exercise,
  onChange,
  onDelete,
}: {
  exercise: Exercise;
  onChange: (next: Exercise) => void;
  onDelete: () => void;
}) {
  const type = getExerciseTypeById(exercise.typeId);

  function handleDelete() {
    if (window.confirm('¿Eliminar ejercicio?')) {
      onDelete();
    }
  }

  function updateSet(setId: string, next: SetBasedExercise['sets'][number]) {
    if (exercise.shape === 'cardio') return;
    const ex = exercise;
    const sets = ex.sets.map((s) => (s.id === setId ? next : s));
    onChange({ ...ex, sets } as Exercise);
  }

  function deleteSet(setId: string) {
    if (exercise.shape === 'cardio') return;
    const ex = exercise;
    const sets = ex.sets.filter((s) => s.id !== setId);
    onChange({ ...ex, sets } as Exercise);
  }

  return (
    <li data-exercise-id={exercise.id} className="card exercise-detail">
      <h3>{type?.name ?? exercise.typeId}</h3>
      {exercise.shape === 'cardio' ? (
        <CardioBlockSummary exercise={exercise} />
      ) : (
        <ol className="sets-list">
          {exercise.sets.map((set, idx) => (
            <EditableSet
              key={set.id}
              exercise={exercise}
              set={set}
              index={idx}
              onChange={(next) => updateSet(set.id, next)}
              onDelete={() => deleteSet(set.id)}
            />
          ))}
        </ol>
      )}
      <button type="button" className="btn btn-danger" onClick={handleDelete}>
        Eliminar ejercicio
      </button>
    </li>
  );
}

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const repo = useSessionRepository();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    repo.getById(id).then((s) => {
      if (!cancelled) setSession(s ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, id]);

  function persist(next: Session) {
    setSession(next);
    void repo.update(next, new Date());
  }

  function handleStartedAtChange(value: string) {
    if (!session) return;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return;
    persist({ ...session, startedAt: parsed.toISOString() });
  }

  function handleExerciseChange(next: Exercise) {
    if (!session) return;
    persist({
      ...session,
      exercises: session.exercises.map((e) => (e.id === next.id ? next : e)),
    });
  }

  function handleExerciseDelete(exerciseId: string) {
    if (!session) return;
    persist({ ...session, exercises: session.exercises.filter((e) => e.id !== exerciseId) });
  }

  async function handleDeleteSession() {
    if (!session) return;
    if (!window.confirm('¿Eliminar este entrenamiento? Esta acción no se puede deshacer.')) return;
    await repo.delete(session.id);
    navigate('/');
  }

  if (session === undefined) {
    return (
      <section data-testid="route-session-detail" aria-busy="true">
        <p>Cargando…</p>
      </section>
    );
  }

  if (session === null) {
    return (
      <section data-testid="route-session-detail">
        <p>Sesión no encontrada.</p>
      </section>
    );
  }

  return (
    <section data-testid="route-session-detail">
      <h2 className="page-title">Detalle de sesión</h2>
      <p className="session-date">
        <time dateTime={session.startedAt}>{formatSessionDate(session.startedAt)}</time>
      </p>
      <label className="field">
        <span>Fecha y hora</span>
        <input
          type="datetime-local"
          value={toLocalDateTimeInput(new Date(session.startedAt))}
          onChange={(e) => handleStartedAtChange(e.target.value)}
        />
      </label>
      <ol className="exercises-list">
        {session.exercises.map((exercise) => (
          <ExerciseDetail
            key={exercise.id}
            exercise={exercise}
            onChange={handleExerciseChange}
            onDelete={() => handleExerciseDelete(exercise.id)}
          />
        ))}
      </ol>
      <button
        type="button"
        onClick={handleDeleteSession}
        className="btn btn-danger btn-full danger-zone"
      >
        Eliminar entrenamiento
      </button>
    </section>
  );
}
