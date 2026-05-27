---
id: F2-T002
status: done
title: Typography & spacing tokens
sub-phase: A-design-system
depends-on: F2-T001
---

## Goal

Añadir a `main.css` un sistema de tokens CSS para tipografía, espaciado y border-radius, alineado con la escala que Apple usa en sus apps. Esto proporciona la base para que las tareas de styling de componentes (F2-T003 en adelante) usen valores consistentes.

## Context

### Escala tipográfica Apple (SF Pro / system-ui)

| Token | Valor | Uso |
|---|---|---|
| `--font-size-xs` | `11px` | Labels, captions |
| `--font-size-sm` | `13px` | Texto secundario |
| `--font-size-md` | `15px` | Cuerpo principal |
| `--font-size-base` | `17px` | Texto base iOS (SF Pro Text) |
| `--font-size-lg` | `20px` | Subtítulos |
| `--font-size-xl` | `24px` | Títulos de sección |
| `--font-size-2xl` | `28px` | Títulos grandes |
| `--font-weight-regular` | `400` | — |
| `--font-weight-medium` | `500` | — |
| `--font-weight-semibold` | `600` | Encabezados |
| `--font-weight-bold` | `700` | Énfasis |
| `--line-height-tight` | `1.2` | Encabezados |
| `--line-height-normal` | `1.5` | Cuerpo |
| `--line-height-relaxed` | `1.7` | Texto explicativo |

### Espaciado (base 4px)

| Token | Valor |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |

### Border radius

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | `8px` | Chips, tags |
| `--radius-md` | `12px` | Cards |
| `--radius-lg` | `16px` | Modals, sheets |
| `--radius-xl` | `20px` | Cards grandes |
| `--radius-pill` | `9999px` | Botones pill |

## Tests (write first — RED)

Archivo: `src/styles/main.css.test.ts` — nuevo `describe('main.css — design tokens (F2-T002)')`.

```
it('defines font-size tokens in :root')
  → rootBlock.toMatch(/--font-size-base\s*:/)
  → rootBlock.toMatch(/--font-size-xl\s*:/)

it('defines spacing tokens in :root')
  → rootBlock.toMatch(/--space-4\s*:/)
  → rootBlock.toMatch(/--space-6\s*:/)

it('defines border-radius tokens in :root')
  → rootBlock.toMatch(/--radius-md\s*:/)
  → rootBlock.toMatch(/--radius-pill\s*:/)
```

## Implementation

Añadir los tokens al bloque `:root` en `src/styles/main.css`, justo después de los tokens de color de F2-T001. No crear bloques adicionales; todo en `:root`.

## Done when

- [ ] Los 3 tests nuevos pasan.
- [ ] Todos los tests previos siguen en verde.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar tabla en `tasks-summary.md` y mover puntero a F2-T003.
