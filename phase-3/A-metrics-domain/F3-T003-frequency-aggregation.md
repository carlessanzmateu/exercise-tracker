---
id: F3-T003
status: done
title: Training frequency aggregation
sub-phase: A-metrics-domain
depends-on: []
---

## Goal

Función pura que agrupa las sesiones por periodo (**mes / trimestre / año**) y cuenta cuántas hubo en cada uno, más la **media** del periodo. Alimenta el panel de Frecuencia (feature 2). Cada sesión cuenta como 1 día de entrenamiento.

## Context

Tipos en `@/domain/types` (`Session.startedAt` es ISO 8601). Crear `src/domain/metrics/frequency.ts`.

```ts
export type Granularity = 'month' | 'quarter' | 'year';
export interface FrequencyBucket { key: string; label: string; count: number; }
export interface FrequencyResult { buckets: FrequencyBucket[]; average: number; }

export function aggregateFrequency(sessions: Session[], granularity: Granularity): FrequencyResult;
```

Reglas:
- Agrupar por `startedAt` en **hora local**.
- `key` ordenable: mes `"2026-05"`, trimestre `"2026-Q2"`, año `"2026"`.
- `label` en español: mes `"May 2026"`, trimestre `"T2 2026"`, año `"2026"`.
- **Rellenar huecos**: incluir los buckets intermedios sin sesiones con `count: 0`, entre el primero y el último con datos, para que la gráfica sea continua.
- `buckets` ordenados cronológicamente ascendente.
- `average` = media aritmética de los `count` de los buckets devueltos (incluye los ceros). `0` si no hay sesiones.

## Tests (write first — RED)

Crear `src/domain/metrics/frequency.test.ts`.

```
it('counts sessions per month')
it('fills gap months with zero between first and last')
it('groups by quarter with "T{n} {year}" labels')
it('groups by year')
it('computes the average across buckets')
it('returns empty buckets and average 0 for no sessions')
```

## Implementation

1. Implementar `aggregateFrequency` con un helper interno para derivar `key`/`label` por granularidad y otro para rellenar huecos.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T004.
