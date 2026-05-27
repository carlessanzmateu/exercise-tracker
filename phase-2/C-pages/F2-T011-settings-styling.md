---
id: F2-T011
status: done
title: Settings page styling
sub-phase: C-pages
depends-on: F2-T003, F2-T007
---

## Goal

Estilizar la pantalla de Ajustes con aspecto iOS: título de página, acciones de exportar/importar como filas de lista al estilo iOS Settings, y el aviso de persistencia local como bloque informativo.

## Context

### Layout objetivo

```
┌────────────────────────┐
│  Ajustes               │  ← h2, .page-title
│                        │
│  ┌────────────────┐    │
│  │ ⚠ Tus datos    │    │  ← .notice (fondo suave, borde izquierdo accent)
│  │   se guardan   │    │
│  │   solo aquí…   │    │
│  └────────────────┘    │
│                        │
│  ┌────────────────┐    │
│  │ [Exportar]     │    │  ← .btn .btn-primary .btn-full
│  └────────────────┘    │
│                        │
│  ┌────────────────┐    │
│  │ [Importar]     │    │  ← label simulando .btn .btn-secondary .btn-full
│  └────────────────┘    │
│                        │
│  (mensaje de error si  │  ← .alert-error
│   algo va mal)         │
└────────────────────────┘
```

### Reglas de estilo

**`.notice`** (aviso informativo)
- `background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface))`
  - Fallback si el navegador no soporta `color-mix`: `background: var(--color-surface)`
- `border-left: 3px solid var(--color-accent)`
- `border-radius: 0 var(--radius-md) var(--radius-md) 0`
- `padding: var(--space-4)`
- `font-size: var(--font-size-sm); color: var(--color-text-muted)`
- `margin-bottom: var(--space-6)`

**Botones de acción**
- "Exportar": `.btn .btn-primary .btn-full`
- "Importar" (es un `<label>`): `.btn .btn-secondary .btn-full`; el `<input type="file">` dentro debe ser `display: none`
- Gap entre botones: `var(--space-3)`

**`.alert-error`**
- `color: var(--color-destructive)`
- `font-size: var(--font-size-sm)`
- `margin-top: var(--space-4)`

## Tests (write first — RED)

```
// Settings.test.tsx
it('page heading has class "page-title"')
it('notice paragraph has class "notice"')
it('"Exportar" button has class "btn-primary"')
it('import label has class "btn-secondary"')
it('error message has class "alert-error" when present')
```

## Implementation

1. Añadir `.notice`, `.alert-error` en `src/styles/main.css`.
2. Actualizar `Settings.tsx` con las clases correspondientes.
3. Las clases `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-full` ya existen de tareas previas.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar tabla en `tasks-summary.md` y mover puntero a F2-T012.
