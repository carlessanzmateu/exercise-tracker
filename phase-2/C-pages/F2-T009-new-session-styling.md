---
id: F2-T009
status: done
title: New Session page styling
sub-phase: C-pages
depends-on: F2-T003, F2-T004, F2-T005, F2-T007
---

## Goal

Estilizar la pantalla de creación de sesión: título de página, campo de fecha/hora, lista de ejercicios como cards, formularios de series con aspecto limpio y el picker de ejercicios integrado visualmente.

## Context

### Layout objetivo

```
┌────────────────────────┐
│  Nueva sesión          │  ← h2, .page-title
│                        │
│  Fecha y hora          │  ← .field label
│  [── fecha ──────────] │  ← input datetime-local
│                        │
│  ┌────────────────┐    │
│  │ Press banca    │    │  ← .card (ejercicio)
│  │ Serie 1  ·  …  │    │    título: bold
│  │ Serie 2  ·  …  │    │    series: muted, font-size-sm
│  │ [Reps] [Peso]  │    │    form inline
│  │ [+ Serie]      │    │
│  └────────────────┘    │
│                        │
│  [+ Añadir ejercicio]  │  ← .btn .btn-secondary
│                        │
│  [Guardar sesión]      │  ← .btn .btn-primary, full-width
└────────────────────────┘
```

### Reglas de estilo

**`.page-title`** (reutilizable también en otras páginas)
- `font-size: var(--font-size-2xl)`
- `font-weight: var(--font-weight-bold)`
- `margin-bottom: var(--space-6)`

**`.exercises-list`**
- `list-style: none; padding: 0; margin: 0`
- `display: flex; flex-direction: column; gap: var(--space-3)`

**`.exercise-item`** (cada ejercicio)
- Usar `.card` de F2-T005

**Nombre del ejercicio dentro de la card**
- `font-size: var(--font-size-base); font-weight: var(--font-weight-semibold)`
- `margin-bottom: var(--space-3)`

**`.sets-list` y series**
- `list-style: none; padding: 0`
- Cada serie: `font-size: var(--font-size-sm); color: var(--color-text-muted)`
- Separadas por líneas divisoras sutiles o gap

**Formularios de serie** (StrengthSetForm etc.)
- Inputs en fila: `display: flex; gap: var(--space-3); align-items: flex-end`
- Etiquetas encima de cada input con `.field`

**Botón "Guardar sesión"**
- `.btn .btn-primary`
- Full-width: añadir clase `.btn-full` con `width: 100%`
- Sticky al fondo con `margin-top: var(--space-8)`

## Tests (write first — RED)

```
// NewSession.test.tsx (o el archivo existente)
it('page heading has class "page-title"')
it('exercises list has class "exercises-list"')
it('"Guardar sesión" button has class "btn-primary"')
it('"Añadir ejercicio" button has class "btn-secondary"')
```

## Implementation

1. Añadir `.page-title`, `.exercises-list`, `.btn-full` en `src/styles/main.css`.
2. Actualizar `NewSession.tsx` con las clases correspondientes.
3. Actualizar `ExerciseItem` (componente interno de `NewSession.tsx`) para usar `.card` en el `<li>`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar tabla en `tasks-summary.md` y mover puntero a F2-T010.
