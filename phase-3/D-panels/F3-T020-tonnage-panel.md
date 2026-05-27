---
id: F3-T020
status: done
title: Total tonnage panel
sub-phase: D-panels
depends-on: [F3-T004, F3-T010, F3-T012]
---

## Goal

Panel de **tonelaje total** (feature extra): peso total movido por periodo, como indicador de carga global de entrenamiento. Última tarea de la Fase 3.

## Context

Crear `src/features/progress/TonnagePanel.tsx`. Recibe `sessions` por props. Usa `tonnageByPeriod` (F3-T004) y `BarChart` (F3-T010). Montar en la sección `data-panel="tonnage"` de `Progress.tsx`.

Comportamiento:
- `tonnageByPeriod(sessions, 'month')` → barras (`label`, `value`=`tonnageKg`).
- `formatValue` en kg (p. ej. "12.300 kg").
- Solo cuenta series con peso (igual que volumen). Texto sutil aclaratorio.
- Estado vacío si no hay tonelaje.

## Tests (write first — RED)

Crear `src/features/progress/TonnagePanel.test.tsx`.

```
it('renders monthly tonnage bars')
it('formats values in kg')
it('renders an empty state when there is no weighted volume')
```

## Implementation

1. Implementar `TonnagePanel`.
2. Montarlo en `Progress.tsx`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. **Sub-fase D completa. Fase 3 completa.**
