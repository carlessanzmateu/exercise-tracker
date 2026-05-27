---
id: F3-T015
status: done
title: Exercise progress panel
sub-phase: D-panels
depends-on: [F3-T007, F3-T009, F3-T012]
---

## Goal

Panel de **progreso por ejercicio** (feature 3): selector de ejercicio + toggles de métrica + gráfica de línea del histórico. (La proyección se añade encima en F3-T016.)

## Context

Crear `src/features/progress/ExerciseProgressPanel.tsx`. Recibe `sessions` por props. Usa `buildExerciseProgress` (F3-T007) y `LineChart` (F3-T009). Montar en la sección `data-panel="exercise"` de `Progress.tsx`.

Comportamiento:
- Selector (`<select>` o lista) de **solo los ejercicios que tienen datos** (recorrer catálogo y filtrar los `typeId` con series registradas). Por defecto, el primero con datos.
- `buildExerciseProgress(sessions, typeId)` → `availableMetrics`, `primaryMetric`, `series`.
- **Toggles de métrica** (botones tipo `.btn-ghost`/segmented) limitados a `availableMetrics`. Métrica activa por defecto = `primaryMetric`.
- `LineChart` con la serie de la métrica activa; `formatValue`/`yLabel` según métrica (kg, reps, s, km).
- Estado vacío si no hay ningún ejercicio con datos.

## Tests (write first — RED)

Crear `src/features/progress/ExerciseProgressPanel.test.tsx`.

```
it('lists only exercises that have recorded data')
it('shows the 1RM line chart by default for a strength exercise')
it('switches the metric when a toggle is clicked')        // p.ej. de 1RM a volumen
it('changes the chart when a different exercise is selected')
it('renders an empty state when no exercise has data')
```

## Implementation

1. Implementar `ExerciseProgressPanel` (selección de ejercicio + métrica + LineChart).
2. Montarlo en `Progress.tsx`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T016.
