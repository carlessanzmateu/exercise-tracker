---
id: F6-T003
status: done
title: Aggregate weight entries by day
sub-phase: A-domain
depends-on: [F6-T002]
---

## Goal

Función pura que agrupa `WeightEntry[]` por **día local** y devuelve la **media
del peso** de cada día. Es la fuente de datos de la gráfica de peso (F6-T014):
varias entradas el mismo día se colapsan a un único punto.

## Context

Crear `src/domain/weight/aggregateByDay.ts`. Reutiliza `WeightEntry` de
`./weightEntry`.

```ts
export interface DailyWeightPoint {
  date: string;     // 'YYYY-MM-DD' (día local)
  avgKg: number;    // media aritmética del peso del día (redondeada a 1 decimal)
  count: number;    // número de entradas agregadas ese día
}

export function aggregateByDay(entries: WeightEntry[]): DailyWeightPoint[];
```

Reglas:
- Agrupar por **día local**: derivar `YYYY-MM-DD` de
  `new Date(entry.recordedAt)` usando `getFullYear/getMonth/getDate` (mismo
  criterio local que el resto del dominio: ver `aggregateSamples.ts`).
- `avgKg` del día = media aritmética de los `weightKg`, **redondeada a 1 decimal**.
- `count` = número de entradas que han contribuido.
- Resultado ordenado por `date` **ascendente**. Sin entradas → `[]`.
- Si una entrada tiene `recordedAt` no parseable (defensivo, no debería pasar
  tras `normalizeWeightEntry`), se descarta.

## Tests (write first — RED)

Crear `src/domain/weight/aggregateByDay.test.ts`.

```
it('returns one point per day with the mean weight of that day')
it('rounds avgKg to 1 decimal')
it('keeps separate days as separate points, sorted ascending')
it('groups by local day (not UTC)')
it('counts how many entries contributed to each day')
it('returns an empty array for no entries')
it('drops entries with unparseable recordedAt defensively')
```

## Implementation

1. Implementar `aggregateByDay` con un `Map<string, { sum; count }>` y
   redondeo final.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T004.
