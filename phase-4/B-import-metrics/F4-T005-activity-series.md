---
id: F4-T005
status: done
title: Activity series + aggregates
sub-phase: B-import-metrics
depends-on: [F4-T001]
---

## Goal

A partir de `HealthDay[]`, construir las **series diarias** de pasos y distancia dentro de una
ventana temporal (Mes/Trimestre/Año) y sus **totales y media diaria**. Alimenta el panel Actividad.

## Context

Crear `src/domain/metrics/activity.ts`. Reutiliza `Granularity` de `./frequency`.

La ventana es relativa al **día más reciente con datos**; longitud por granularidad:
`month` = 30 días, `quarter` = 90 días, `year` = 365 días.

```ts
import type { Granularity } from './frequency';

export interface ActivitySeries {
  steps: { date: string; value: number }[];     // diarios, dentro de la ventana, asc
  distanceKm: { date: string; value: number }[];
  totalSteps: number;
  totalDistanceKm: number;
  avgSteps: number;        // media diaria sobre los días presentes en la ventana
  avgDistanceKm: number;
  dayCount: number;        // nº de días con dato dentro de la ventana
}

export function buildActivitySeries(days: HealthDay[], granularity: Granularity): ActivitySeries;
```

Reglas:
- Ordenar por fecha asc; tomar `lastDate` = fecha máxima; incluir días con
  `date > lastDate - windowDays` (ventana trailing inclusiva del último día).
- `steps`/`distanceKm`: un punto por día presente (no se rellenan huecos de días sin dato).
- Totales = suma en la ventana; medias = total / `dayCount` (0 si no hay días).
- `days` vacío → series vacías, totales y medias 0, `dayCount` 0.

## Tests (write first — RED)

Crear `src/domain/metrics/activity.test.ts`.

```
it('builds daily steps and distance series within the month window')
it('limits the window by granularity (quarter includes more days than month)')
it('computes totals and daily averages over the window')
it('returns empty series and zero aggregates for no data')
```

## Implementation

1. Implementar `buildActivitySeries` con el cálculo de ventana trailing y agregados.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. Sub-fase B completa; puntero a F4-T006.
