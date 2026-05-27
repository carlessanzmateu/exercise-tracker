---
id: F3-T005
status: done
title: Cardio totals
sub-phase: A-metrics-domain
depends-on: []
---

## Goal

Funciones puras para el **resumen de cardio**: distancia y duración totales, y su evolución por periodo. Alimenta el panel de cardio (feature extra). Solo aplica a ejercicios `cardio` (Caminar, Correr).

## Context

Crear `src/domain/metrics/cardio.ts`. `CardioExercise.cardio` = `{ durationMinutes, distanceKm? }`. `Granularity` se reutiliza de `./frequency`.

```ts
export interface CardioTotals { totalDistanceKm: number; totalDurationMinutes: number; }
export interface CardioBucket {
  key: string; label: string; distanceKm: number; durationMinutes: number;
}

export function cardioTotals(sessions: Session[]): CardioTotals;
export function cardioByPeriod(sessions: Session[], granularity: Granularity): CardioBucket[];
```

Reglas:
- Sumar solo ejercicios con `shape === 'cardio'`.
- `distanceKm` ausente cuenta como 0 en distancia (la duración siempre está).
- `cardioByPeriod`: mismo esquema de `key`/`label`/relleno de huecos que F3-T003.

## Tests (write first — RED)

Crear `src/domain/metrics/cardio.test.ts`.

```
it('sums total distance and duration across cardio blocks')
it('treats missing distance as zero')
it('ignores non-cardio exercises')
it('aggregates cardio per month with gap filling')
it('returns zeros for no cardio')
```

## Implementation

1. Implementar `cardioTotals` y `cardioByPeriod` reutilizando el helper de `key`/`label` temporal.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T006.
