---
id: F4-T004
status: done
title: Moving average helper
sub-phase: B-import-metrics
depends-on: []
---

## Goal

Función pura de **media móvil** para suavizar series temporales (la usará la gráfica de pasos del
panel Actividad para la media móvil de 7 días).

## Context

Crear `src/domain/metrics/movingAverage.ts`. Genérica sobre puntos `{ date, value }` (mismo shape
que `LinePoint`/`ProgressPoint`).

```ts
export interface SeriesPoint {
  date: string;
  value: number;
}

// Media móvil "trailing" de ventana `window` (por defecto 7).
// Para el punto i promedia los min(window, i+1) puntos hasta i (incluido).
export function movingAverage(points: SeriesPoint[], window?: number): SeriesPoint[];
```

Reglas:
- Devuelve un array de la misma longitud y mismas `date`, con `value` = media de la ventana
  trailing (incluye el punto actual y hasta `window-1` anteriores).
- Asume `points` ordenados por fecha ascendente (no reordena).
- `window <= 1` o array vacío → devuelve copia con los mismos valores / `[]`.

## Tests (write first — RED)

Crear `src/domain/metrics/movingAverage.test.ts`.

```
it('returns the same length and dates as the input')
it('averages the trailing window once enough points exist')   // window 3 sobre [1,2,3,4] → [1,1.5,2,3]
it('uses a partial window at the start')
it('returns an empty array for empty input')
```

## Implementation

1. Implementar `movingAverage` con suma de ventana trailing.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F4-T005.
