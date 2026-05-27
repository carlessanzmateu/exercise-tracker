---
id: F3-T014
status: done
title: Frequency panel
sub-phase: D-panels
depends-on: [F3-T003, F3-T010, F3-T013, F3-T012]
---

## Goal

Panel de **frecuencia de entrenamiento** (feature 2): barras de nº de sesiones por periodo con línea de media, y selector **Mes / Trimestre / Año**.

## Context

Crear `src/features/progress/FrequencyPanel.tsx`. Recibe `sessions: Session[]` por props. Usa `aggregateFrequency` (F3-T003), `BarChart` (F3-T010) y `SegmentedControl` (F3-T013). Montarlo en la sección `data-panel="frequency"` de `Progress.tsx`.

Comportamiento:
- Estado local `granularity` (`'month' | 'quarter' | 'year'`), por defecto `'month'`.
- `aggregateFrequency(sessions, granularity)` → `bars` (`label`/`value`=`count`) y `averageValue`=`average`.
- Título del panel y, debajo, el `SegmentedControl` y el `BarChart`.
- Texto accesible con la media (p. ej. "Media: 3,2 sesiones/mes").

## Tests (write first — RED)

Crear `src/features/progress/FrequencyPanel.test.tsx` (render con sesiones de prueba).

```
it('renders monthly bars by default')
it('switches aggregation when selecting "Trimestre"')   // cambia el nº/labels de barras
it('shows the average line and a textual average')
it('renders an empty state when there are no sessions')
```

## Implementation

1. Implementar `FrequencyPanel` con estado de granularidad y render del chart + control.
2. Montarlo en `Progress.tsx`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T015.
