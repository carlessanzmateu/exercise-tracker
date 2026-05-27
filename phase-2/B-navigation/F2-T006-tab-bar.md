---
id: F2-T006
status: done
title: Tab bar component
sub-phase: B-navigation
depends-on: F2-T001, F2-T002
---

## Goal

Crear el componente `TabBar` con tres pestañas: **Entrenamientos** (`/`), **+** (`/new`), **Ajustes** (`/settings`). Comportamiento idéntico al tab bar de iOS: fijo en la parte inferior, efecto cristal (backdrop-filter), pestaña activa según la ruta actual.

## Context

### Especificación visual

```
┌──────────────────────────────┐
│                              │
│  (contenido de la página)    │
│                              │
├──────────────────────────────┤
│  [☰ Feed]  [ ＋ ]  [⚙ Ajt]  │  ← tab bar fijo
└──────────────────────────────┘
```

**`.tab-bar`**
- `position: fixed; bottom: 0; left: 0; right: 0`
- `height: calc(49px + env(safe-area-inset-bottom, 0px))`
- `padding-bottom: env(safe-area-inset-bottom, 0px)`
- `display: flex; align-items: center; justify-content: space-around`
- Modo claro: `background: rgba(255,255,255,0.85); backdrop-filter: saturate(180%) blur(20px)`
- Modo oscuro: `background: rgba(28,28,30,0.85)`
- `border-top: 0.5px solid var(--color-border)`
- `z-index: 100`

**`.tab-bar__item`** (cada pestaña, es un `<Link>`)
- `display: flex; flex-direction: column; align-items: center; gap: var(--space-1)`
- `color: var(--color-text-muted)`
- `text-decoration: none`
- `font-size: var(--font-size-xs); font-weight: var(--font-weight-medium)`
- `min-width: 44px; min-height: 44px; justify-content: center`

**`.tab-bar__item--active`**
- `color: var(--color-accent)`

**`.tab-bar__item--add`** (botón central "+")
- Fondo circular: `background: var(--color-accent); border-radius: 50%`
- Tamaño del círculo: `40px × 40px`
- Color del icono: blanco

### Lógica de activación

| Ruta | Tab activa |
|---|---|
| `/` | Entrenamientos |
| `/session/:id` | Entrenamientos (se está dentro del feed) |
| `/new` | ninguna (flujo modal) |
| `/settings` | Ajustes |

Usar `aria-current="page"` en el link activo.

### Iconos SVG inline

Usar SVG sencillos (estilo Feather / SF Symbols simplificados):

- **Lista** (Entrenamientos): tres líneas horizontales (`M3 6h18 M3 12h18 M3 18h18`)
- **Más** (+): cruz (`M12 5v14 M5 12h14`)
- **Ajustes**: círculo + engranaje (ver implementación sugerida abajo)

Los iconos van en funciones internas del componente, no en archivos separados (no hay librería de iconos).

## Tests (write first — RED)

Crear `src/components/TabBar.test.tsx`.

```
it('renders a link to the feed (/) with text "Entrenamientos"')
it('renders a link to /new for adding a session')
it('renders a link to /settings with text "Ajustes"')
it('marks the feed tab as active (aria-current="page") when at /')
it('does not mark the settings tab as active when at /')
it('marks the settings tab as active when at /settings')
it('marks the feed tab as active when drilling into a session (/session/:id)')
it('the add (+) tab has no aria-current at any route')
```

Renderizar con `<MemoryRouter initialEntries={[path]}>` para cada caso de ruta.

## Implementation

1. Crear `src/components/TabBar.tsx` con el componente.
2. Usar `useLocation()` de `react-router-dom` para determinar la pestaña activa.
3. Añadir `.tab-bar`, `.tab-bar__item`, `.tab-bar__item--active`, `.tab-bar__item--add` en `src/styles/main.css`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar tabla en `tasks-summary.md` y mover puntero a F2-T007.
