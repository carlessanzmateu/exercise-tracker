---
id: F3-T013
status: done
title: Segmented control component
sub-phase: C-navigation-shell
depends-on: []
---

## Goal

Componente reutilizable `SegmentedControl` al estilo iOS para alternar entre opciones (lo usará el panel de Frecuencia para Mes / Trimestre / Año, F3-T014, y cualquier otro selector de periodo).

## Context

Crear `src/components/SegmentedControl.tsx`. Genérico sobre el valor.

```ts
export interface SegmentedOption<T extends string> { value: T; label: string; }
export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}
```

Requisitos:
- `role="group"` con `aria-label`; cada opción es un `<button>` con `aria-pressed` según selección.
- Opción activa con clase `.segmented__option--active`.
- Áreas táctiles ≥44px; estética Apple (fondo `--color-surface`, activo `--color-surface-elevated`/acento), bordes redondeados (`--radius-md`).
- Estilos en `src/styles/main.css` (`.segmented`, `.segmented__option`, `.segmented__option--active`).

## Tests (write first — RED)

Crear `src/components/SegmentedControl.test.tsx`.

```
it('renders one button per option')
it('marks the selected option with aria-pressed="true"')
it('calls onChange with the value when an option is clicked')
it('exposes the group aria-label')
```

## Implementation

1. Implementar `SegmentedControl`.
2. Añadir estilos en `main.css`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. Sub-fase C completa; puntero a F3-T014.
