---
id: F2-T010
status: done
title: Session Detail page styling
sub-phase: C-pages
depends-on: F2-T003, F2-T004, F2-T005, F2-T007
---

## Goal

Estilizar la pantalla de detalle de sesión: título, fecha editable en contexto, lista de ejercicios como cards con series editables y acciones destructivas claramente diferenciadas.

## Context

### Layout objetivo

```
┌────────────────────────┐
│  Detalle de sesión     │  ← h2, .page-title
│                        │
│  Lun 25 may · 10:30   │  ← <time>, .session-date
│  [── fecha ──────────] │  ← input datetime-local (inline, secundario)
│                        │
│  ┌────────────────┐    │
│  │ Press banca    │    │  ← .card .exercise-detail
│  │ Serie 1  ·  …  [✎] [✕] │  ← editar/eliminar inline
│  │ Serie 2  ·  …  [✎] [✕] │
│  │                    │    │
│  │ [Eliminar ejercicio] │  ← .btn .btn-danger al pie
│  └────────────────┘    │
│                        │
│                        │
│  [Eliminar             │  ← .btn .btn-danger .btn-full
│   entrenamiento]       │    con margen top grande
└────────────────────────┘
```

### Reglas de estilo

**`.session-date`** (fecha visible no editable)
- `font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold)`
- `margin-bottom: var(--space-2)`

**Input de fecha (campo editable)**
- Aparece como campo secundario: fuente más pequeña, muted
- Usar `.field` de F2-T004

**`.exercise-detail`** (cada card de ejercicio)
- Usar `.card` de F2-T005
- `padding: var(--space-4)`

**Fila de serie (`.set-row`)**
- `display: flex; align-items: center; gap: var(--space-3)`
- Texto: `flex: 1; font-size: var(--font-size-sm); color: var(--color-text-muted)`
- Botones editar/eliminar: `.btn .btn-ghost` compactos (`padding: var(--space-1) var(--space-2)`)

**Botón "Eliminar ejercicio"**
- `.btn .btn-danger` al pie del card, tamaño más pequeño

**Botón "Eliminar entrenamiento"**
- `.btn .btn-danger .btn-full`
- Separado del resto por `margin-top: var(--space-10)` (zona de peligro)

## Tests (write first — RED)

```
// SessionDetail.test.tsx (o el archivo existente)
it('page heading has class "page-title"')
it('"Eliminar entrenamiento" button has class "btn-danger"')
it('"Eliminar ejercicio" button has class "btn-danger"')
it('"Editar" set button has class "btn-ghost"')
```

## Implementation

1. Añadir `.session-date`, `.exercise-detail`, `.set-row` en `src/styles/main.css`.
2. Actualizar `SessionDetail.tsx` con las clases correspondientes.
3. Las clases `.card`, `.btn-danger`, `.btn-ghost` ya existen de tareas previas.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar tabla en `tasks-summary.md` y mover puntero a F2-T011.
