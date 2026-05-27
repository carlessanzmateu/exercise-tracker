---
id: F2-T005
status: done
title: Card component
sub-phase: A-design-system
depends-on: F2-T001, F2-T002
---

## Goal

Definir la clase CSS `.card` con el aspecto de tarjeta Apple (fondo blanco, esquinas redondeadas, sombra sutil) y aplicarla a las tarjetas de sesión del feed. Esta clase también será usable en las páginas de detalle y nueva sesión para agrupar ejercicios.

## Context

### Especificación visual

**`.card`**
- `background: var(--color-surface)`
- `border-radius: var(--radius-md)` → 12px
- `padding: var(--space-4)` → 16px
- Modo claro: `box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08)` (sutil)
- Modo oscuro: `border: 1px solid var(--color-border)` (sin sombra; el contraste lo da el borde)

**`.card--interactive`** (variante para cards clicables como las del feed)
- Cursor: pointer
- Hover (solo `(hover: hover) and (pointer: fine)`): `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12)`; ligero `translateY(-1px)` con transición suave
- Active: `translateY(0)`

### Uso en componentes

| Componente | Clase a añadir |
|---|---|
| `SessionCard.tsx` | `.card .card--interactive` en el elemento raíz |
| `NewSession.tsx` | `.card` en cada `<li>` de ejercicios |
| `SessionDetail.tsx` | `.card` en cada `<li>` de ejercicios |

## Tests (write first — RED)

### CSS tests — `src/styles/main.css.test.ts`

```
it('defines .card class with background using --color-surface')
  → css.toMatch(/\.card\s*\{[^}]*background[^:]*:\s*var\(--color-surface\)/)

it('defines .card class with border-radius using --radius-md')
  → css.match(/\.card\s*\{[^}]*\}/)[0].toMatch(/border-radius\s*:\s*var\(--radius-md\)/)

it('defines .card--interactive class')
  → css.toMatch(/\.card--interactive/)
```

### Component tests

En `SessionCard.test.tsx`:
```
it('root element has class "card" and "card--interactive"')
```

## Implementation

1. Añadir `.card` y `.card--interactive` en `src/styles/main.css`.
2. Añadir la dark-mode override para `.card` dentro del bloque `@media (prefers-color-scheme: dark)`.
3. Añadir `className="card card--interactive"` al elemento raíz de `SessionCard.tsx`.
4. Añadir `className="card"` a los `<li>` de ejercicios en `NewSession.tsx` y `SessionDetail.tsx`.

## Done when

- [ ] CSS tests pasan.
- [ ] Tests de componentes pasan.
- [ ] Todos los tests previos siguen en verde.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar tabla en `tasks-summary.md`. Sub-fase A completa; mover puntero a F2-T006.
