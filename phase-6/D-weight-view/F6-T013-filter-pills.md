---
id: F6-T013
status: todo
title: FilterPills component (generic)
sub-phase: D-weight-view
depends-on: []
---

## Goal

Crear un componente genérico **`FilterPills`** (pills horizontales con scroll
horizontal si no caben) para el selector de filtro temporal de la vista Peso.
Es la alternativa de `SegmentedControl` cuando hay muchas opciones y no
quepan todas: las pills no encogen, se hace scroll-x del propio control.

## Context

Crear `src/components/FilterPills.tsx` y `src/components/FilterPills.css` (o
añadir las clases a `main.css` siguiendo el patrón).

```ts
export interface FilterPillsOption<T extends string> {
  value: T;
  label: string;
}

export interface FilterPillsProps<T extends string> {
  options: FilterPillsOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function FilterPills<T extends string>(props: FilterPillsProps<T>): JSX.Element;
```

CSS clave:
```css
.filter-pills {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.filter-pills::-webkit-scrollbar { display: none; }
.filter-pills__pill {
  flex: 0 0 auto;          /* no encoge: la pill mantiene su tamaño natural */
  padding: 6px 14px;
  border-radius: 999px;
  /* …colores del tema… */
}
.filter-pills__pill--active { /* … */ }
```

Comportamiento:
- Cada pill es `<button type="button">` con `role="tab"`-style semantics
  (`aria-pressed={active}`).
- Click → `onChange(option.value)`.
- Contenedor `role="tablist"` con `aria-label={ariaLabel}`.

## Tests (write first — RED)

Crear `src/components/FilterPills.test.tsx`.

```
it('renders one button per option with its label')
it('marks the active pill with aria-pressed="true"')
it('calls onChange with the value when a pill is clicked')
it('does not call onChange when clicking the already-active pill (optional, decide)')
it('sets aria-label on the tablist container')
```

Y añadir test al CSS regression (`src/styles/main.css.test.ts`) si el patrón del
repo lo requiere, asegurando que `.filter-pills` existe y que `flex: 0 0 auto`
está en `.filter-pills__pill`.

## Implementation

1. Implementar el componente tipado genérico.
2. Añadir estilos al CSS principal.
3. Sin acoplarlo a `WeightFilter` — el filtro concreto vive en F6-T014.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T014.
