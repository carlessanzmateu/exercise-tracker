---
id: F3-T019
status: done
title: Cardio summary panel
sub-phase: D-panels
depends-on: [F3-T005, F3-T009, F3-T012]
---

## Goal

Panel de **resumen de cardio** (feature extra): distancia y duración totales y su evolución en el tiempo para Caminar/Correr.

## Context

Crear `src/features/progress/CardioPanel.tsx`. Recibe `sessions` por props. Usa `cardioTotals` y `cardioByPeriod` (F3-T005) y `LineChart` (F3-T009). Montar en la sección `data-panel="cardio"` de `Progress.tsx`.

Comportamiento:
- Cabecera con totales: "Distancia total: {km} km · Duración total: {min} min".
- `LineChart` de la distancia por periodo (`cardioByPeriod(sessions, 'month')` → puntos `{date: bucket, value: distanceKm}`). `yLabel` = "km".
- Estado vacío si no hay cardio registrado.

## Tests (write first — RED)

Crear `src/features/progress/CardioPanel.test.tsx`.

```
it('shows total distance and duration')
it('renders a distance line chart over time')
it('renders an empty state when there is no cardio')
```

## Implementation

1. Implementar `CardioPanel` (totales + LineChart de distancia).
2. Montarlo en `Progress.tsx`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T020.
