---
id: F3-T016
status: done
title: Projection overlay
sub-phase: D-panels
depends-on: [F3-T002, F3-T015]
---

## Goal

Añadir al panel de progreso por ejercicio la **proyección** (feature 3.1): banda sombreada al futuro sobre la gráfica + texto resumen "el próximo mes ≈ entre K y Z" y ritmo de mejora. Solo cuando hay datos suficientes.

## Context

Ampliar `src/features/progress/ExerciseProgressPanel.tsx`. Usa `linearRegression` + `predictionInterval` (F3-T002) y la `ProjectionBand` de `LineChart` (F3-T009).

Cálculo:
- Convertir la serie de la métrica activa a puntos `(x, y)` con `x` = **días desde el primer punto** (`(date - date₀)/86400000`), `y` = valor.
- Requiere **≥ 3 puntos**; si no, no se proyecta.
- `x₀ = x_último + 28` (≈ 4 semanas). `predictionInterval(points, x₀, 0.8)` → `{ yHat, lower, upper }`.
- Construir la `ProjectionBand` (center/lower/upper) desde el último punto real hasta `x₀` (volver a fechas para el eje) y pasarla a `LineChart`.
- Texto: "Próximo mes ≈ entre **{lower}** y **{upper}** {unidad}" + "({signo}{slope·28} {unidad}/mes)". Clamp a ≥ 0.
- Si `< 3` puntos: nota discreta "Necesitas al menos 3 sesiones para proyectar".
- La proyección aplica a la métrica activa (1RM, reps, segundos o distancia según el ejercicio).

## Tests (write first — RED)

Ampliar `ExerciseProgressPanel.test.tsx`.

```
it('shows a projection band and a "próximo mes" range with 3+ data points')
it('shows the monthly improvement rate text')
it('hides the projection and shows a hint with fewer than 3 points')
it('recomputes the projection when the metric toggle changes')
```

## Implementation

1. Calcular la proyección de la métrica activa y construir la `ProjectionBand`.
2. Renderizar la banda en el `LineChart` y el texto resumen / la nota.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T017.
