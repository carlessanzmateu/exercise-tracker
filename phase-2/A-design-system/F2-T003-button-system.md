---
id: F2-T003
status: done
title: Button system
sub-phase: A-design-system
depends-on: F2-T001, F2-T002
---

## Goal

Definir un sistema de clases CSS para botones (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost`) al estilo Apple y aplicarlas a todos los botones de la aplicación.

## Context

### Especificación visual

**`.btn` (base)**
- `display: inline-flex; align-items: center; justify-content: center`
- `font-family: inherit; font-size: var(--font-size-md); font-weight: var(--font-weight-medium)`
- `padding: var(--space-2) var(--space-6)`
- `border-radius: var(--radius-pill)`
- `border: none; cursor: pointer`
- `min-height: 44px` (Apple HIG mínimo táctil)
- `transition: opacity 0.15s ease`

**`.btn-primary`** — CTA principal
- Fondo: `var(--color-accent)` → azul Apple
- Texto: `var(--color-accent-text)` → blanco
- Hover (pointer fino): `opacity: 0.85`

**`.btn-secondary`** — Acción secundaria
- Fondo: `var(--color-surface)`
- Texto: `var(--color-accent)`
- Border: `1px solid var(--color-border)`

**`.btn-danger`** — Acción destructiva
- Fondo: transparente
- Texto: `var(--color-destructive)`
- Border: `1px solid var(--color-destructive)`

**`.btn-ghost`** — Acción menor / inline
- Fondo: transparente
- Texto: `var(--color-accent)`
- Sin borde

**Estado disabled**
- `opacity: 0.4; cursor: not-allowed; pointer-events: none`

### Componentes que deben actualizarse

| Componente | Botones a cambiar |
|---|---|
| `Feed.tsx` | "Añadir entrenamiento" → `.btn .btn-primary` |
| `NewSession.tsx` | "Guardar sesión" → `.btn .btn-primary`; "Añadir ejercicio" → `.btn .btn-secondary` |
| `SessionDetail.tsx` | "Eliminar entrenamiento" → `.btn .btn-danger`; "Eliminar ejercicio" → `.btn .btn-danger`; "Eliminar serie" → `.btn .btn-danger`; "Editar" → `.btn .btn-ghost`; "Cancelar" → `.btn .btn-ghost` |
| `Settings.tsx` | "Exportar" → `.btn .btn-primary`; "Importar" label → `.btn .btn-secondary` |
| `StrengthSetForm`, `BodyweightSetForm`, `TimeSetForm`, `CardioForm` | "Añadir" → `.btn .btn-secondary`; "Cancelar" → `.btn .btn-ghost` |
| `ExercisePicker` | Cada tipo de ejercicio → `.btn .btn-ghost` |

## Tests (write first — RED)

### CSS tests — `src/styles/main.css.test.ts`

```
it('defines .btn-primary class with background using --color-accent')
  → css.toMatch(/\.btn-primary\s*\{[^}]*background[^:]*:\s*var\(--color-accent\)/)

it('defines .btn-danger class')
  → css.toMatch(/\.btn-danger/)

it('.btn has min-height of 44px (Apple HIG touch target)')
  → css.match(/\.btn\s*\{[^}]*\}/)[0].toMatch(/min-height\s*:\s*44px/)
```

### Component tests — añadir en cada componente afectado

Ejemplo para `Feed.test.tsx`:
```
it('"Añadir entrenamiento" CTA has class btn-primary')
```

Ejemplo para `SessionDetail.test.tsx`:
```
it('"Eliminar entrenamiento" button has class btn-danger')
```

Escribir al menos un test por componente que verifique que el botón principal tiene la clase correcta.

## Implementation

1. Añadir las clases `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost` a `src/styles/main.css`.
2. Añadir las clases en los JSX de cada componente listado arriba.

## Done when

- [ ] CSS tests pasan.
- [ ] Tests de componentes pasan.
- [ ] Todos los tests previos siguen en verde.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar tabla en `tasks-summary.md` y mover puntero a F2-T004.
