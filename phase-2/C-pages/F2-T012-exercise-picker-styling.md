---
id: F2-T012
status: done
title: Exercise Picker styling
sub-phase: C-pages
depends-on: F2-T003, F2-T004, F2-T007
---

## Goal

Estilizar el `ExercisePicker` (selector de tipos de ejercicio): buscador con icono de lupa, encabezados de categoría al estilo iOS, botones de ejercicio como filas de lista con aspecto limpio.

> **Nota**: La lógica de filtrado ya fue implementada antes de la Fase 2 formal. Esta tarea es únicamente CSS.

## Context

### Layout objetivo

```
┌────────────────────────┐
│  [🔍 Buscar ejercicio…]│  ← input[type=search], icono de lupa CSS
│                        │
│  PECHO                 │  ← .picker-category-heading (uppercase, muted, xs)
│  ┌────────────────┐    │
│  │ Press banca    │    │  ← .picker-exercise-btn (full-width, fila)
│  │ Press pecho    │    │
│  │ Aperturas      │    │
│  └────────────────┘    │
│                        │
│  ESPALDA               │
│  ┌────────────────┐    │
│  │ Jalón al pecho │    │
│  │ …              │    │
│  └────────────────┘    │
└────────────────────────┘
```

### Reglas de estilo

**Input de búsqueda (`.exercise-picker__search`)**
- Full-width, estilos de `.field` input de F2-T004
- Ícono de lupa: añadir como `background-image` SVG inline data-URI con `background-position: 12px center; background-repeat: no-repeat; padding-left: 40px`
- `margin-bottom: var(--space-4)`

**`.picker-category-heading`** (encabezado de categoría)
- `font-size: var(--font-size-xs)`
- `font-weight: var(--font-weight-semibold)`
- `text-transform: uppercase`
- `letter-spacing: 0.08em`
- `color: var(--color-text-muted)`
- `margin: var(--space-5) 0 var(--space-2) 0`
- Primera categoría: `margin-top: 0`

**`.picker-exercise-btn`** (cada botón de ejercicio)
- `display: flex; align-items: center`
- `width: 100%`
- `padding: var(--space-3) var(--space-4)`
- `background: var(--color-surface)`
- `border: none; border-bottom: 1px solid var(--color-border)`
- `font-size: var(--font-size-base); color: var(--color-text)`
- `text-align: left; cursor: pointer`
- Último del grupo: `border-bottom: none; border-radius: 0 0 var(--radius-md) var(--radius-md)`
- Primero del grupo: `border-radius: var(--radius-md) var(--radius-md) 0 0`
- Único del grupo (si categoría tiene 1 ejercicio): `border-radius: var(--radius-md); border-bottom: none`
- Hover (pointer fino): `background: var(--color-surface-elevated)`

**`.exercise-picker__category`** (wrapper de grupo)
- `margin-bottom: var(--space-2)`
- `ul`: `list-style: none; padding: 0; margin: 0; overflow: hidden; border-radius: var(--radius-md); border: 1px solid var(--color-border)`

## Tests (write first — RED)

```
// ExercisePicker.test.tsx
it('search input has class "exercise-picker__search"')
it('category headings have class "picker-category-heading"')
it('exercise buttons have class "picker-exercise-btn"')
```

## Implementation

1. Añadir `.exercise-picker__search`, `.picker-category-heading`, `.picker-exercise-btn` y las reglas de `.exercise-picker__category ul` en `src/styles/main.css`.
2. Actualizar `ExercisePicker.tsx` para añadir las clases correspondientes a los elementos renderizados.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar la tabla en `tasks-summary.md`. **Sub-fase C completa. Fase 2 completa.**
