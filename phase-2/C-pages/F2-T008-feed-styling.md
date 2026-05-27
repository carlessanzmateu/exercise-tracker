---
id: F2-T008
status: done
title: Feed page styling
sub-phase: C-pages
depends-on: F2-T003, F2-T005, F2-T007
---

## Goal

Estilizar la página del feed para que se parezca a la pantalla principal de una app iOS: título grande, encabezados de mes sutiles, tarjetas de sesión con aspecto Apple, estado vacío con CTA clara.

## Context

### Layout objetivo

```
┌────────────────────────┐
│  Entrenamientos        │  ← h2, font-size: --font-size-2xl, font-weight: bold
│                        │
│  MAYO 2026             │  ← h3, muted, uppercase, font-size: --font-size-xs
│                        │
│  ┌────────────────┐    │
│  │ Lun 25 may     │    │  ← SessionCard (.card .card--interactive)
│  │ · 10:30        │    │    fecha: --font-size-base, bold
│  │ 4 ejercicios   │    │    sub: --font-size-sm, muted
│  └────────────────┘    │
│                        │
│  ┌────────────────┐    │
│  │ Vie 22 may...  │    │
│  └────────────────┘    │
│                        │
│  [+ Añadir             │  ← .btn .btn-primary, full-width en móvil
│    entrenamiento]      │
└────────────────────────┘
```

### Reglas de estilo específicas

**Feed heading (`.feed-title`)**
- `font-size: var(--font-size-2xl)`
- `font-weight: var(--font-weight-bold)`
- `margin-bottom: var(--space-6)`

**Month header (`.month-heading`)**
- `font-size: var(--font-size-xs)`
- `font-weight: var(--font-weight-semibold)`
- `text-transform: uppercase`
- `letter-spacing: 0.08em`
- `color: var(--color-text-muted)`
- `margin: var(--space-6) 0 var(--space-3) 0`

**Session list (`.session-list`)**
- `list-style: none; padding: 0; margin: 0`
- `display: flex; flex-direction: column; gap: var(--space-3)`

**SessionCard content**
- Fecha: `font-size: var(--font-size-base); font-weight: var(--font-weight-semibold)`
- "N ejercicios": `font-size: var(--font-size-sm); color: var(--color-text-muted); margin-top: var(--space-1)`

**CTA "Añadir entrenamiento"**
- Usar `.btn .btn-primary` de F2-T003
- Botón ancho completo en móvil: `width: 100%; margin-top: var(--space-6)`

**Empty state**
- Centrar el texto y el CTA verticalmente con padding generoso

## Tests (write first — RED)

### Archivos: `Feed.test.tsx`, `SessionCard.test.tsx`

```
// Feed.test.tsx
it('feed heading has class "feed-title"')
  → screen.getByRole('heading', { level: 2 }).classList.contains('feed-title')

it('month heading has class "month-heading"')
  → screen.getByRole('heading', { level: 3 }).classList.contains('month-heading')

it('session list has class "session-list"')
  → document.querySelector('.session-list') !== null

// SessionCard.test.tsx
it('SessionCard root element has classes "card" and "card--interactive"')
```

## Implementation

1. Añadir clases `.feed-title`, `.month-heading`, `.session-list` en `src/styles/main.css`.
2. Añadir `className="feed-title"` al `<h2>` en `Feed.tsx`.
3. Añadir `className="month-heading"` al `<h3>` en `Feed.tsx`.
4. Añadir `className="session-list"` al `<ol>` en `Feed.tsx`.
5. Añadir `className="card card--interactive"` al elemento raíz de `SessionCard.tsx` (si no se hizo en F2-T005).
6. Añadir las clases de botón al CTA en `Feed.tsx`.
7. Estilizar el layout de `SessionCard.tsx` con clases apropiadas.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar tabla en `tasks-summary.md` y mover puntero a F2-T009.
