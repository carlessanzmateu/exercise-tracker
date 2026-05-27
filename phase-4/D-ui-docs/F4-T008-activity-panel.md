---
id: F4-T008
status: done
title: Activity panel (Progreso)
sub-phase: D-ui-docs
depends-on: [F4-T002, F4-T004, F4-T005]
---

## Goal

Nuevo panel **"Actividad"** en la vista Progreso: gráficas diarias de pasos y distancia con selector
Mes/Trimestre/Año, media móvil de 7 días sobre los pasos, y totales + media por periodo.

## Context

Crear `src/features/progress/ActivityPanel.tsx`. La vista Progreso (`Progress.tsx`) carga las
sesiones; aquí necesitamos los **días de Salud**, así que el panel los carga con
`useSessionRepository().listHealthDays()` (estado de carga simple) **o** `Progress.tsx` los carga y
los pasa por props. Elegir una vía y mantenerla coherente con el resto de paneles.

Usa: `buildActivitySeries` (F4-T005), `movingAverage` (F4-T004), `LineChart` (Fase 3),
`SegmentedControl` (Fase 3).

Comportamiento:
- Estado `granularity` (`month`/`quarter`/`year`), por defecto `month`, vía `SegmentedControl`.
- `buildActivitySeries(days, granularity)` → series de pasos y distancia + totales/medias.
- Gráfica de **pasos** (LineChart) con **media móvil de 7 días** superpuesta. Para la superposición,
  añadir a `LineChart` un prop opcional `overlay?: { points: LinePoint[] }` (línea secundaria
  discreta/punteada con clase `.chart-line--overlay`) y añadir su test en `LineChart.test.tsx`.
- Gráfica de **distancia** (LineChart) diaria.
- Texto de resumen: "Total: N pasos · media M/día" y "Distancia: X km · media Y km/día".
- Estado vacío cuando no hay días de Salud: mensaje + referencia a importar desde Ajustes.
- Montar en `Progress.tsx` como nueva sección `data-panel="activity"` (añadirla a `PANELS` con
  título "Actividad"). Actualizar el test de `Progress.test.tsx` que comprueba los `data-panel`.

## Tests (write first — RED)

Crear `src/features/progress/ActivityPanel.test.tsx` (mock repo con `listHealthDays`).

```
it('renders steps and distance charts when health data exists')
it('shows totals and daily averages')
it('overlays a 7-day moving average on the steps chart')
it('switches the window when selecting "Trimestre"')
it('renders an empty state with a hint to import from Settings when there is no data')
```
Más, en `LineChart.test.tsx`: `it('renders a secondary overlay line when overlay is provided')`.

## Implementation

1. Extender `LineChart` con el prop opcional `overlay` (+ estilo `.chart-line--overlay`).
2. Implementar `ActivityPanel` (carga de healthDays, selector, charts, resumen, vacío).
3. Montar el panel en `Progress.tsx` y actualizar `PANELS` + `Progress.test.tsx`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F4-T009.
