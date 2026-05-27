---
id: F3-T001
status: done
title: Estimated 1RM (Epley)
sub-phase: A-metrics-domain
depends-on: []
---

## Goal

Función pura que estima el 1RM (peso máximo para 1 repetición) a partir del peso y las reps de una serie, usando la fórmula de **Epley**. Es la base de la métrica principal de progreso y de las proyecciones.

## Context

Tipos en `@/domain/types` (`StrengthSet`, `BodyweightSet`: tienen `reps` y `weightKg`/`weightKg?`).

Fórmula Epley:
```
reps = 1        → 1RM = weightKg
reps en 2..12   → 1RM = weightKg · (1 + reps / 30)
reps > 12       → no fiable
```

Decisiones:
- Crear `src/domain/metrics/oneRepMax.ts`.
- `estimateOneRepMax(weightKg, reps)`: devuelve el 1RM estimado, o `null` si no es estimable (`weightKg <= 0`, `reps <= 0`, o `reps > 12`).
- No redondear aquí (el formateo es responsabilidad de la UI).

```ts
export function estimateOneRepMax(weightKg: number, reps: number): number | null;
```

## Tests (write first — RED)

Crear `src/domain/metrics/oneRepMax.test.ts`.

```
it('returns the weight unchanged for a single rep')
it('applies the Epley formula for 2..12 reps')        // e.g. 100kg x 5 → 100*(1+5/30) ≈ 116.67
it('returns null for reps above 12 (unreliable)')
it('returns null for non-positive weight or reps')
```

## Implementation

1. Implementar `estimateOneRepMax` en `src/domain/metrics/oneRepMax.ts` según la fórmula.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T002.
