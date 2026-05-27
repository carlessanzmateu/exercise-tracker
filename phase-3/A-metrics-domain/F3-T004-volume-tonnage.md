---
id: F3-T004
status: done
title: Volume by muscle group + total tonnage
sub-phase: A-metrics-domain
depends-on: []
---

## Goal

Funciones puras para el **volumen por grupo muscular** (categoría del catálogo) y el **tonelaje** (peso total movido) por periodo. Alimentan los paneles de volumen muscular (feature extra) y de tonelaje total.

## Context

Crear `src/domain/metrics/volume.ts`. Volumen de una serie con peso = `reps · weightKg`. **Solo cuentan series con peso** (`weightKg` definido y > 0): la autocarga sin peso no aporta kg. La categoría se obtiene de `getExerciseTypeById(typeId).category` (`@/domain/catalog`). `Granularity` se reutiliza de `./frequency`.

```ts
export interface CategoryVolume { category: string; volumeKg: number; }
export interface TonnageBucket { key: string; label: string; tonnageKg: number; }

export function volumeByCategory(sessions: Session[]): CategoryVolume[];
export function tonnageByPeriod(sessions: Session[], granularity: Granularity): TonnageBucket[];
```

Reglas:
- `volumeByCategory`: suma el volumen de todas las series con peso, agrupado por categoría; ordenar descendente por `volumeKg`; omitir categorías con 0.
- `tonnageByPeriod`: mismo esquema de `key`/`label`/relleno de huecos que F3-T003, con `tonnageKg` = suma del volumen del periodo.

## Tests (write first — RED)

Crear `src/domain/metrics/volume.test.ts`.

```
it('sums reps*weight per category for weighted sets')
it('ignores bodyweight sets without weight')
it('sorts categories by volume descending')
it('aggregates tonnage per month with gap filling')
it('returns empty arrays for no sessions')
```

## Implementation

1. Implementar `volumeByCategory` y `tonnageByPeriod` reutilizando el helper de `key`/`label` de la agregación temporal (extraer a un módulo compartido si conviene, p. ej. `periodKeys.ts`).

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T005.
