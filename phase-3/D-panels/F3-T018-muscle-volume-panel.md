---
id: F3-T018
status: done
title: Muscle-group volume panel
sub-phase: D-panels
depends-on: [F3-T004, F3-T010, F3-T012]
---

## Goal

Panel de **volumen por grupo muscular** (feature extra): reparto del volumen (Σ reps·peso) entre categorías del catálogo (Pecho, Espalda, Piernas…), para detectar desequilibrios.

## Context

Crear `src/features/progress/MuscleVolumePanel.tsx`. Recibe `sessions` por props. Usa `volumeByCategory` (F3-T004) y `BarChart` (F3-T010). Montar en la sección `data-panel="muscle-volume"` de `Progress.tsx`.

Comportamiento:
- `volumeByCategory(sessions)` → barras (`label`=categoría, `value`=`volumeKg`), ya ordenadas desc.
- `formatValue` en kg (p. ej. "1.250 kg").
- Nota: solo cuentan series con peso (la autocarga sin peso no aparece). Indicarlo con un texto sutil.
- Estado vacío si no hay volumen con peso.

## Tests (write first — RED)

Crear `src/features/progress/MuscleVolumePanel.test.tsx`.

```
it('renders one bar per category with volume')
it('orders categories by volume descending')
it('renders an empty state when there is no weighted volume')
```

## Implementation

1. Implementar `MuscleVolumePanel`.
2. Montarlo en `Progress.tsx`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T019.
