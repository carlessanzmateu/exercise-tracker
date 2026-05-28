---
id: F5-T001
status: done
title: Aggregate raw samples to daily totals
sub-phase: A-domain
depends-on: []
---

## Goal

Función pura que agrupa **muestras crudas de Salud** (cada una con fecha, metric y valor) en totales
diarios `HealthDay`. Es el núcleo del nuevo flujo de importación (el Atajo vuelca muestras, la app
agrega).

## Context

Crear `src/domain/health/aggregateSamples.ts`. Reutiliza `HealthDay` de `./healthDay`.

```ts
export type HealthMetric = 'steps' | 'distance';

export interface HealthSample {
  metric: HealthMetric;
  date: string; // ISO local ('YYYY-MM-DDTHH:mm:ss') o 'YYYY-MM-DD'
  value: number; // pasos: conteo; distance: kilómetros
}

export function aggregateSamplesToDays(samples: HealthSample[]): HealthDay[];
```

Reglas:
- Agrupar por **día local**: derivar `YYYY-MM-DD` de `new Date(sample.date)` con
  `getFullYear/getMonth/getDate` (mismo criterio local que el resto del dominio).
- `steps` del día = suma de los `value` de muestras `metric: 'steps'`, **redondeada a entero**.
- `distanceKm` del día = suma de los `value` de muestras `metric: 'distance'`.
- Un día con muestras de un solo metric → el otro queda en `0`.
- **Descartar** muestras inválidas: `value` no finito o negativo, `date` no parseable
  (`Number.isNaN(new Date(date).getTime())`), o `metric` distinto de `steps`/`distance`.
- Resultado ordenado por `date` ascendente. Sin muestras válidas → `[]`.

## Tests (write first — RED)

Crear `src/domain/health/aggregateSamples.test.ts`.

```
it('sums steps samples within the same local day')
it('sums distance samples (km) within the same day')
it('keeps separate days as separate entries, sorted ascending')
it('defaults the missing metric to 0 for a day with only one metric')
it('rounds aggregated steps to an integer')
it('drops invalid samples (bad date, negative/non-finite value, unknown metric)')
it('returns an empty array for no valid samples')
```

## Implementation

1. Implementar `aggregateSamplesToDays` con un `Map<string, { steps; distanceKm }>` por día.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F5-T002.
