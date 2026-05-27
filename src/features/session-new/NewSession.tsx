import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSessionRepository } from '@/data/useSessionRepository';
import { getExerciseTypeById } from '@/domain/catalog';
import { newSession } from '@/domain/factories';
import type {
  BodyweightExercise,
  BodyweightSet,
  CardioData,
  Exercise,
  Session,
  StrengthExercise,
  StrengthSet,
  TimeExercise,
  TimeSet,
} from '@/domain/types';

import { BodyweightSetForm } from './BodyweightSetForm';
import { CardioForm } from './CardioForm';
import { ExercisePicker } from './ExercisePicker';
import { ExerciseSetsList } from './ExerciseSetsList';
import { StrengthSetForm } from './StrengthSetForm';
import { TimeSetForm } from './TimeSetForm';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toLocalDateTimeInput(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function buildEmptyExercise(typeId: string, order: number): Exercise {
  const type = getExerciseTypeById(typeId);
  if (!type) throw new Error(`Tipo de ejercicio desconocido: "${typeId}"`);
  const base = { id: crypto.randomUUID(), typeId, order };
  switch (type.shape) {
    case 'strength':
      return { ...base, shape: 'strength', sets: [] };
    case 'bodyweight':
      return { ...base, shape: 'bodyweight', sets: [] };
    case 'time':
      return { ...base, shape: 'time', sets: [] };
    case 'cardio':
      return { ...base, shape: 'cardio', cardio: { durationMinutes: 0 } };
  }
}

function ExerciseItem({
  exercise,
  onChange,
}: {
  exercise: Exercise;
  onChange: (next: Exercise) => void;
}) {
  const type = getExerciseTypeById(exercise.typeId);

  function appendStrengthSet(set: StrengthSet) {
    const next: StrengthExercise = {
      ...(exercise as StrengthExercise),
      sets: [...(exercise as StrengthExercise).sets, set],
    };
    onChange(next);
  }

  function appendBodyweightSet(set: BodyweightSet) {
    const next: BodyweightExercise = {
      ...(exercise as BodyweightExercise),
      sets: [...(exercise as BodyweightExercise).sets, set],
    };
    onChange(next);
  }

  function appendTimeSet(set: TimeSet) {
    const next: TimeExercise = {
      ...(exercise as TimeExercise),
      sets: [...(exercise as TimeExercise).sets, set],
    };
    onChange(next);
  }

  function setCardio(cardio: CardioData) {
    onChange({ ...exercise, shape: 'cardio', cardio });
  }

  return (
    <li data-exercise-id={exercise.id} className="card exercise-item">
      <h3>{type?.name ?? exercise.typeId}</h3>
      {exercise.shape === 'strength' && (
        <>
          <ExerciseSetsList exercise={exercise} />
          <StrengthSetForm onAdd={appendStrengthSet} />
        </>
      )}
      {exercise.shape === 'bodyweight' && (
        <>
          <ExerciseSetsList exercise={exercise} />
          <BodyweightSetForm onAdd={appendBodyweightSet} />
        </>
      )}
      {exercise.shape === 'time' && (
        <>
          <ExerciseSetsList exercise={exercise} />
          <TimeSetForm onAdd={appendTimeSet} />
        </>
      )}
      {exercise.shape === 'cardio' && (
        <CardioForm
          initial={exercise.cardio.durationMinutes > 0 ? exercise.cardio : undefined}
          onSubmit={setCardio}
        />
      )}
    </li>
  );
}

export function NewSession({ now = new Date() }: { now?: Date }) {
  const repo = useSessionRepository();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session>(() => newSession({ now }));
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleStartedAtChange(value: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return;
    setSession((prev) => ({ ...prev, startedAt: parsed.toISOString() }));
  }

  function handleAddExercise(typeId: string) {
    setSession((prev) => {
      const exercise = buildEmptyExercise(typeId, prev.exercises.length);
      return { ...prev, exercises: [...prev.exercises, exercise] };
    });
    setPickerOpen(false);
  }

  function handleExerciseChange(next: Exercise) {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => (e.id === next.id ? next : e)),
    }));
  }

  async function handleSave() {
    setSaving(true);
    await repo.save(session);
    navigate('/');
  }

  return (
    <section data-testid="route-new-session">
      <h2 className="page-title">Nueva sesión</h2>
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
          <ExerciseItem key={exercise.id} exercise={exercise} onChange={handleExerciseChange} />
        ))}
      </ol>

      {pickerOpen ? (
        <ExercisePicker onSelect={handleAddExercise} />
      ) : (
        <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}>
          Añadir ejercicio
        </button>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary btn-full"
      >
        Guardar sesión
      </button>
    </section>
  );
}
