---
id: F3-T006
status: done
title: Personal records (PRs)
sub-phase: A-metrics-domain
depends-on: [F3-T001]
---

## Goal

Función pura que detecta los **records personales** por ejercicio con peso: mejor peso levantado y mejor 1RM estimado, con la fecha en que se lograron. Alimenta el panel de PRs (feature extra).

## Context

Crear `src/domain/metrics/personalRecords.ts`. Usa `estimateOneRepMax` (F3-T001) y `getExerciseTypeById` (`@/domain/catalog`). Solo ejercicios con series con peso (`strength` y `bodyweight` con `weightKg`).

```ts
export interface PersonalRecord {
  typeId: string;
  name: string;            // nombre del catálogo
  bestWeightKg: number;
  bestWeightAt: string;    // ISO de la sesión
  bestOneRepMax: number;
  bestOneRepMaxAt: string;
}

export function personalRecords(sessions: Session[]): PersonalRecord[];
```

Reglas:
- Recorrer todas las series con peso; quedarse con el máximo `weightKg` y el máximo 1RM estimado por `typeId`, registrando la fecha (`session.startedAt`) de cada máximo.
- Ante empates, conservar la **primera** fecha en que se alcanzó.
- Omitir ejercicios sin ninguna serie con peso.
- Ordenar el resultado por `name` ascendente.

## Tests (write first — RED)

Crear `src/domain/metrics/personalRecords.test.ts`.

```
it('reports best weight and the date it was achieved')
it('reports best estimated 1RM (may differ from best weight)')   // p.ej. más reps a menos peso
it('keeps the earliest date on ties')
it('ignores exercises without weighted sets')
it('returns empty array for no sessions')
```

## Implementation

1. Implementar `personalRecords` agrupando por `typeId` y calculando ambos máximos.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T007.
