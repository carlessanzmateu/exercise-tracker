---
id: F2-T004
status: done
title: Input / form field system
sub-phase: A-design-system
depends-on: F2-T001, F2-T002
---

## Goal

Estilizar todos los inputs y etiquetas de la app con el aspecto limpio de las apps iOS. Definir una clase `.field` para el label+input agrupados y estilos base para `input[type=...]`.

## Context

### Especificación visual

**`.field`** — wrapper de label + input
- `display: flex; flex-direction: column; gap: var(--space-1)`

**`label` dentro de `.field`**
- `font-size: var(--font-size-sm)`
- `font-weight: var(--font-weight-medium)`
- `color: var(--color-text-muted)`
- `text-transform: uppercase`
- `letter-spacing: 0.04em`

**`input` (todos los tipos de texto, number, datetime-local, search)**
- `width: 100%`
- `padding: var(--space-3) var(--space-4)`
- `font-family: inherit; font-size: var(--font-size-base)`
- `color: var(--color-text); background: var(--color-surface)`
- `border: 1px solid var(--color-border)`
- `border-radius: var(--radius-md)`
- `outline: none`
- En focus: `border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2)`
- `min-height: 44px`

**`input[type="search"]`** — usado en ExercisePicker
- Añadir ícono de lupa mediante `background-image` SVG inline o `padding-left` mayor (el ícono se añade en F2-T012).

### Componentes que usan `.field`

Ya lo usan por className (ver Fase 1):
- `NewSession.tsx` — campo datetime
- `SessionDetail.tsx` — campo datetime editable
- `StrengthSetForm.tsx`, `BodyweightSetForm.tsx`, `TimeSetForm.tsx`, `CardioForm.tsx` — inputs numéricos

## Tests (write first — RED)

### CSS tests — `src/styles/main.css.test.ts`

```
it('styles input elements with border-radius using --radius-md')
  → css.toMatch(/input[^{]*\{[^}]*border-radius\s*:\s*var\(--radius-md\)/)

it('input focus state uses --color-accent for border')
  → css.toMatch(/input[^{]*:focus[^{]*\{[^}]*border-color\s*:\s*var\(--color-accent\)/)

it('defines .field class')
  → css.toMatch(/\.field\s*\{/)
```

### Component tests

En `StrengthSetForm.test.tsx` (o el archivo de tests de cada form):
```
it('reps and weight inputs are wrapped in a .field container')
```

## Implementation

1. Añadir los estilos de `input`, `.field`, `label` en `src/styles/main.css`.
2. Verificar que los wrappers de los forms ya usan `className="field"` (la Fase 1 ya los puso en muchos sitios). Si falta alguno, añadirlo.

## Done when

- [ ] CSS tests pasan.
- [ ] Tests de componentes pasan.
- [ ] Todos los tests previos siguen en verde.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar tabla en `tasks-summary.md` y mover puntero a F2-T005.
