---
id: F2-T001
status: done
title: Apple color palette
sub-phase: A-design-system
depends-on: —
---

## Goal

Reemplazar la paleta de grises básica de la Fase 1 por los colores exactos que usa Apple en sus páginas de producto (apple.com/iphone). Esta tarea solo toca `src/styles/main.css`; ningún componente cambia aún.

## Context

La paleta Apple sigue estas reglas:

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `#f5f5f7` | `#000000` |
| `--color-surface` | `#ffffff` | `#1c1c1e` |
| `--color-surface-elevated` | `#ffffff` | `#2c2c2e` |
| `--color-text` | `#1d1d1f` | `#f5f5f7` |
| `--color-text-muted` | `#6e6e73` | `#86868b` |
| `--color-border` | `#d2d2d7` | `#38383a` |
| `--color-accent` | `#0071e3` | `#2997ff` |
| `--color-accent-text` | `#ffffff` | `#ffffff` |
| `--color-destructive` | `#ff3b30` | `#ff453a` |

Restricciones de los tests existentes que **deben seguir pasando**:
- `--color-bg`, `--color-text`, `--color-accent` deben existir en `:root`.
- Los mismos tokens deben existir en el bloque `@media (prefers-color-scheme: dark)`.
- El valor de `--color-bg` debe ser distinto entre light y dark.
- `body` debe usar `background: var(--color-bg)` y `color: var(--color-text)`.
- `.app-shell` sin `min-width` ni `max-width` en el bloque base.

## Tests (write first — RED)

Archivo: `src/styles/main.css.test.ts` — añadir al `describe` existente.

```
it('--color-bg light value matches Apple light background (#f5f5f7)')
  → rootBlock.match(/--color-bg\s*:\s*([^;]+);/)[1].trim() === '#f5f5f7'

it('--color-accent light value is Apple blue (#0071e3)')
  → rootBlock.match(/--color-accent\s*:\s*([^;]+);/)[1].trim() === '#0071e3'

it('--color-destructive is defined in :root')
  → rootBlock.toMatch(/--color-destructive\s*:/)

it('--color-surface is defined in :root')
  → rootBlock.toMatch(/--color-surface\s*:/)

it('--color-accent dark value is Apple dark blue (#2997ff)')
  → darkBody.match(/--color-accent\s*:\s*([^;]+);/)[1].trim() === '#2997ff'
```

## Implementation

Editar únicamente la sección de variables en `src/styles/main.css`:

1. Reemplazar los valores de `:root` con la columna **Light** de la tabla de arriba.
2. Reemplazar los valores del bloque `@media (prefers-color-scheme: dark) { :root { ... } }` con la columna **Dark**.
3. Añadir los tokens nuevos: `--color-surface-elevated`, `--color-accent-text`, `--color-destructive`.

No añadir nuevas reglas CSS más allá de las variables.

## Done when

- [ ] Los 5 tests nuevos pasan.
- [ ] Los tests previos de `main.css.test.ts` siguen en verde (no romper nada).
- [ ] `npm run lint` → 0 errores, 0 warnings.
- [ ] `npm run format:check` → OK.
- [ ] `npm test` → todos en verde.
- [ ] `npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar tabla en `tasks-summary.md` y mover puntero a F2-T002.
