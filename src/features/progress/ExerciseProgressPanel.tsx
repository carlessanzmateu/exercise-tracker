import { useMemo, useState } from 'react';

import { LineChart, type ProjectionBand } from '@/components/charts/LineChart';
import { getExerciseTypeById } from '@/domain/catalog';
import { buildExerciseProgress, type ProgressMetric } from '@/domain/metrics/exerciseProgress';
import { linearRegression, predictionInterval } from '@/domain/metrics/regression';
import type { ProgressPoint } from '@/domain/metrics/exerciseProgress';
import type { Session } from '@/domain/types';

const METRIC_LABEL: Record<ProgressMetric, string> = {
  oneRepMax: '1RM',
  maxWeight: 'Peso máx',
  volume: 'Volumen',
  reps: 'Reps',
  duration: 'Duración',
  distance: 'Distancia',
};

const METRIC_UNIT: Record<ProgressMetric, string> = {
  oneRepMax: 'kg',
  maxWeight: 'kg',
  volume: 'kg',
  reps: 'reps',
  duration: 's',
  distance: 'km',
};

const DAY_MS = 86_400_000;
const PROJECTION_DAYS = 28;
const MIN_POINTS = 3;

interface Projection {
  band: ProjectionBand;
  lower: number;
  upper: number;
  perMonth: number;
}

function buildProjection(series: ProgressPoint[]): Projection | null {
  if (series.length < MIN_POINTS) return null;

  const firstMs = new Date(series[0].date).getTime();
  const points = series.map((p) => ({
    x: (new Date(p.date).getTime() - firstMs) / DAY_MS,
    y: p.value,
  }));
  const last = series[series.length - 1];
  const lastX = points[points.length - 1].x;
  const x0 = lastX + PROJECTION_DAYS;

  const { slope } = linearRegression(points);
  const { yHat, lower, upper } = predictionInterval(points, x0, 0.8);

  const projDate = new Date(new Date(last.date).getTime() + PROJECTION_DAYS * DAY_MS).toISOString();
  const clampedCenter = Math.max(0, yHat);
  const clampedLower = Math.max(0, lower);
  const clampedUpper = Math.max(0, upper);

  return {
    band: {
      center: [
        { date: last.date, value: last.value },
        { date: projDate, value: clampedCenter },
      ],
      lower: [
        { date: last.date, value: last.value },
        { date: projDate, value: clampedLower },
      ],
      upper: [
        { date: last.date, value: last.value },
        { date: projDate, value: clampedUpper },
      ],
    },
    lower: clampedLower,
    upper: clampedUpper,
    perMonth: slope * PROJECTION_DAYS,
  };
}

function exercisesWithData(sessions: Session[]): { typeId: string; name: string }[] {
  const seen = new Set<string>();
  for (const session of sessions) {
    for (const exercise of session.exercises) seen.add(exercise.typeId);
  }
  return [...seen]
    .map((typeId) => ({ typeId, name: getExerciseTypeById(typeId)?.name ?? typeId }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function ExerciseProgressPanel({ sessions }: { sessions: Session[] }) {
  const exercises = useMemo(() => exercisesWithData(sessions), [sessions]);
  const [selectedTypeId, setSelectedTypeId] = useState(exercises[0]?.typeId ?? '');
  const [activeMetric, setActiveMetric] = useState<ProgressMetric | null>(null);

  const progress = useMemo(
    () => buildExerciseProgress(sessions, selectedTypeId),
    [sessions, selectedTypeId],
  );

  if (exercises.length === 0) {
    return <p className="chart-empty">Sin ejercicios con datos todavía.</p>;
  }

  const metric =
    activeMetric && progress.availableMetrics.includes(activeMetric)
      ? activeMetric
      : progress.primaryMetric;

  const name = getExerciseTypeById(selectedTypeId)?.name ?? selectedTypeId;
  const series = progress.series[metric] ?? [];
  const unit = METRIC_UNIT[metric];
  const projection = buildProjection(series);
  const round = (n: number) => Math.round(n);

  function handleSelectExercise(typeId: string) {
    setSelectedTypeId(typeId);
    setActiveMetric(null);
  }

  return (
    <div className="exercise-progress-panel">
      <label className="field">
        <span>Ejercicio</span>
        <select value={selectedTypeId} onChange={(e) => handleSelectExercise(e.target.value)}>
          {exercises.map((ex) => (
            <option key={ex.typeId} value={ex.typeId}>
              {ex.name}
            </option>
          ))}
        </select>
      </label>

      <div className="metric-toggles" role="group" aria-label="Métrica">
        {progress.availableMetrics.map((m) => {
          const active = m === metric;
          return (
            <button
              key={m}
              type="button"
              className={`metric-toggle${active ? ' metric-toggle--active' : ''}`}
              aria-pressed={active}
              onClick={() => setActiveMetric(m)}
            >
              {METRIC_LABEL[m]}
            </button>
          );
        })}
      </div>

      <LineChart
        data={series}
        projection={projection?.band}
        yLabel={METRIC_LABEL[metric]}
        ariaLabel={`Progreso de ${name} (${METRIC_LABEL[metric]})`}
      />

      {projection ? (
        <p className="projection-summary">
          Próximo mes ≈ entre {round(projection.lower)} y {round(projection.upper)} {unit} (
          {projection.perMonth >= 0 ? '+' : ''}
          {round(projection.perMonth)} {unit}/mes)
        </p>
      ) : (
        <p className="projection-hint">Necesitas al menos 3 sesiones para proyectar.</p>
      )}
    </div>
  );
}
