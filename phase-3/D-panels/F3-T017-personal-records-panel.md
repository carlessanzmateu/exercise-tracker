---
id: F3-T017
status: done
title: Personal records panel
sub-phase: D-panels
depends-on: [F3-T006, F3-T012]
---

## Goal

Panel de **records personales** (feature extra): lista por ejercicio con el mejor peso y el mejor 1RM estimado, con sus fechas.

## Context

Crear `src/features/progress/PersonalRecordsPanel.tsx`. Recibe `sessions` por props. Usa `personalRecords` (F3-T006) y `formatSessionDate` (`@/features/feed/formatSessionDate`) para las fechas. Montar en la sección `data-panel="prs"` de `Progress.tsx`.

Comportamiento:
- Una fila/card por `PersonalRecord`: nombre del ejercicio, "Mejor peso: {kg} kg ({fecha})", "Mejor 1RM est.: {kg} kg ({fecha})".
- Usar `.card` y la tipografía del sistema de diseño.
- Estado vacío si no hay ejercicios con peso registrados.

## Tests (write first — RED)

Crear `src/features/progress/PersonalRecordsPanel.test.tsx`.

```
it('renders a row per exercise with a personal record')
it('shows best weight and best estimated 1RM with their dates')
it('renders an empty state when there are no weighted exercises')
```

## Implementation

1. Implementar `PersonalRecordsPanel` (mapear `personalRecords(sessions)`).
2. Montarlo en `Progress.tsx`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T018.
