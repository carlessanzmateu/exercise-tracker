---
id: F6-T015
status: todo
title: Trend + projection on weight chart
sub-phase: D-weight-view
depends-on: [F6-T004, F6-T014]
---

## Goal

Añadir a la gráfica de peso una **línea de tendencia** (regresión lineal de los
datos visibles) y una **proyección** de **1 unidad del filtro hacia delante**
con **banda de confianza**, **solo cuando la ventana actual contiene a `today`**
(`isLatestWindow`). En ventanas históricas se muestra únicamente la tendencia,
sin banda ni proyección.

## Context

Editar `src/features/weight/WeightChartScroller.tsx` (F6-T014). Reutilizar:

- `linearRegression(points)` + `predictionInterval(points, x0, confidence)`
  de `src/domain/metrics/regression.ts`.
- Patrón de mapeo a `ProjectionBand` de
  `src/features/progress/ExerciseProgressPanel.tsx:51-52`.
- `isLatestWindow(range, today)` de `src/domain/weight/window.ts` (F6-T004).

Algoritmo:

1. Si `visiblePoints.length < 2` → ni tendencia ni proyección.
2. Construir `regressionPoints` con `x` = días desde el primer punto visible,
   `y` = `avgKg`.
3. `regression = linearRegression(regressionPoints)`.
4. **Línea de tendencia (overlay)**: dos puntos (primer y último día de la
   ventana visible) evaluando `regression.predict(x)` → array de 2 puntos
   `LinePoint`. Pasarlo a `LineChart` como `overlay={{ points: trendLine }}`.
5. **Proyección (solo en ventana actual)**:
   - Si `!isLatestWindow(range, today)` → no proyectar (solo tendencia).
   - Calcular la **siguiente unidad del filtro** hacia delante:
     `nextRange = computeWindowRange(filter, today, +1)`.
   - Generar N puntos diarios dentro de `[range.to+1, nextRange.to]` y para
     cada uno calcular `predictionInterval(regressionPoints, x_i, 0.8)` →
     `{ yHat, lower, upper }`.
   - Construir `ProjectionBand`:
     ```ts
     { center: [{date,value:yHat}, ...], lower: [...], upper: [...] }
     ```
   - Para enlazar visualmente la proyección con el último dato real, **prepend**
     el último punto real a los tres arrays (mismo truco que ExerciseProgress).
   - Pasarlo a `LineChart` como `projection={...}`.

Notas:
- Como permitimos múltiples entradas por día y la gráfica usa la media (un
  punto por día), la regresión se hace sobre los puntos diarios.
- El `confidence = 0.8` es coherente con la fase 3.

## Tests (write first — RED)

Ampliar `src/features/weight/WeightChartScroller.test.tsx`.

```
describe('trend and projection')
  it('does not draw a trend line when fewer than 2 visible points exist')
  it('draws a trend overlay (regression of visible points) when 2+ points exist')
  it('draws a projection band 1 unit of the filter ahead in the latest window')
  it('does not draw a projection when scrolled to a historical window')
  it('still draws the trend in historical windows (no band, only line)')
```

Para verificar la presencia de la banda: comprobar
`container.querySelector('.chart-band')` y `.chart-line--projected`.
Para overlay: `container.querySelector('.chart-line--overlay')`.

## Implementation

1. Construir `regressionPoints` y derivar tendencia.
2. Implementar `projectAhead(regressionPoints, filter, range, today)` que
   devuelve un `ProjectionBand` o `null`.
3. Cablear el `overlay` y la `projection` opcionales en el `<LineChart>`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T016.
