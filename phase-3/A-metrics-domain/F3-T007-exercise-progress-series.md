---
id: F3-T007
status: done
title: Per-exercise progress series builder
sub-phase: A-metrics-domain
depends-on: [F3-T001]
---

## Goal

Función pura que, dado un `typeId`, construye las **series temporales de progreso** de ese ejercicio (un punto por sesión que lo incluye), con la métrica adecuada según la forma del ejercicio. Alimenta el panel de progreso por ejercicio (feature 3) y la proyección (F3-T016).

## Context

Crear `src/domain/metrics/exerciseProgress.ts`. Usa `estimateOneRepMax` (F3-T001) y `getExerciseTypeById` (`@/domain/catalog`).

```ts
export type ProgressMetric =
  | 'oneRepMax' | 'maxWeight' | 'volume' | 'reps' | 'duration' | 'distance';
export interface ProgressPoint { date: string; value: number; }   // date = session.startedAt
export interface ExerciseProgress {
  shape: ExerciseShape;
  availableMetrics: ProgressMetric[];          // métricas con datos para este ejercicio
  primaryMetric: ProgressMetric;               // la que se muestra por defecto
  series: Partial<Record<ProgressMetric, ProgressPoint[]>>;
}

export function buildExerciseProgress(sessions: Session[], typeId: string): ExerciseProgress;
```

Métricas por forma (valor por sesión = **mejor serie** salvo que se indique suma):
- `strength`: `oneRepMax` (primary, mejor serie estimable), `maxWeight`, `volume` (suma reps·peso del ejercicio en la sesión), `reps` (máx).
- `bodyweight`: si hay series con peso → como `strength`; si no → `reps` (primary, máx reps) y `volume` (suma reps).
- `time`: `duration` (primary, máx `durationSeconds`), `reps`.
- `cardio`: `distance` (primary, `distanceKm`), `duration` (`durationMinutes`).

Reglas:
- Un punto por sesión que contenga el ejercicio (si aparece varias veces en una sesión, combinar: máx para métricas "mejor", suma para `volume`).
- `series` ordenadas por fecha ascendente.
- Una métrica entra en `availableMetrics` solo si tiene ≥1 punto con valor definido.

## Tests (write first — RED)

Crear `src/domain/metrics/exerciseProgress.test.ts`.

```
it('builds a 1RM series for a strength exercise across sessions')
it('exposes maxWeight, volume and reps as available metrics for strength')
it('uses reps as primary for bodyweight without weight')
it('uses duration for a time exercise (plank)')
it('uses distance for a cardio exercise')
it('combines multiple occurrences of the same exercise within one session')
it('returns empty series when the exercise was never performed')
```

## Implementation

1. Implementar `buildExerciseProgress` con un dispatcher por `shape` que produzca cada serie disponible.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. Sub-fase A completa; puntero a F3-T008.
