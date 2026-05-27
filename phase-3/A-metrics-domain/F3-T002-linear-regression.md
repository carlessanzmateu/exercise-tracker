---
id: F3-T002
status: done
title: Linear regression + prediction interval
sub-phase: A-metrics-domain
depends-on: []
---

## Goal

Funciones puras para ajustar una **regresión lineal por mínimos cuadrados** sobre puntos `(x, y)` y calcular un **intervalo de predicción al 80 %** en un punto futuro. Es el motor matemático de las proyecciones de progreso (feature 3.1).

## Context

Crear `src/domain/metrics/regression.ts`. Implementación a mano (no usar `d3-regression`) para testabilidad.

```ts
export interface RegressionPoint { x: number; y: number; }
export interface Regression {
  slope: number;
  intercept: number;
  predict(x: number): number;
}
export interface PredictionInterval { yHat: number; lower: number; upper: number; }

export function linearRegression(points: RegressionPoint[]): Regression;
// confidence por defecto 0.8 (intervalo de predicción dos colas)
export function predictionInterval(
  points: RegressionPoint[],
  x0: number,
  confidence?: number,
): PredictionInterval;
```

Fórmulas (ver `tasks-summary.md`):
```
b = Σ(xᵢ−x̄)(yᵢ−ȳ) / Σ(xᵢ−x̄)²        a = ȳ − b·x̄
s = √( Σ(yᵢ − ŷᵢ)² / (n−2) )
margen(x₀) = t* · s · √( 1 + 1/n + (x₀−x̄)² / Σ(xᵢ−x̄)² )
```

`t*` = cuantil de la t de Student. Embeber una pequeña tabla del cuantil **0.90 unilateral** (≡ 80 % bilateral) por grados de libertad `df = n−2`, p. ej. `{1:3.078, 2:1.886, 3:1.638, 4:1.533, 5:1.476, 6:1.440, 7:1.415, 8:1.397, 9:1.383, 10:1.372}` y fallback `1.282` (∞) para `df` mayores. Documentar que solo se soporta 80 % por ahora; si se pide otra confianza no tabulada, usar el fallback normal.

Requisitos:
- `linearRegression` exige `n ≥ 2`; lanzar error claro si no.
- `predictionInterval` exige `n ≥ 3` (necesita `n−2 ≥ 1` g.l.); lanzar error claro si no.
- Si todos los `xᵢ` son iguales (denominador 0), lanzar error.

## Tests (write first — RED)

Crear `src/domain/metrics/regression.test.ts`.

```
it('fits slope and intercept on a perfect line')           // y = 2x + 1 → slope 2, intercept 1
it('predict() returns points on the fitted line')
it('throws when fewer than 2 points')
it('prediction interval is centered on yHat')              // lower < yHat < upper
it('prediction interval widens with more residual noise')  // comparar dataset limpio vs ruidoso
it('throws on prediction interval with fewer than 3 points')
```

## Implementation

1. Implementar `linearRegression`, `predictionInterval` y la tabla `t*` en `regression.ts`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T003.
