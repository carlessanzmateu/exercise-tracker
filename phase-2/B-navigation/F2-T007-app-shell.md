---
id: F2-T007
status: done
title: App shell layout update
sub-phase: B-navigation
depends-on: F2-T006
---

## Goal

Integrar el `TabBar` en `App.tsx` y ajustar el layout para que el contenido nunca quede oculto detrás del tab bar. El `<h1>Exercise Tracker</h1>` pasa a ser visualmente oculto (accesible solo para lectores de pantalla) ya que cada página tiene su propio título.

## Context

### Layout objetivo

```tsx
// App.tsx (estructura simplificada)
<>
  <h1 className="sr-only">Exercise Tracker</h1>
  <main className="app-shell">
    <Routes>...</Routes>
  </main>
  <TabBar />
</>
```

El `<main className="app-shell">` debe tener `padding-bottom` suficiente para que el último elemento del scroll no quede bajo el tab bar:
```css
.app-shell {
  /* ... reglas existentes ... */
  padding-bottom: calc(49px + env(safe-area-inset-bottom, 0px) + var(--space-4));
}
```

### Clase `.sr-only`

Patrón estándar para ocultar visualmente sin perder accesibilidad:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Restricciones de tests existentes que deben seguir pasando

| Test | Qué verifica | Cómo se preserva |
|---|---|---|
| `heading level 1 "Exercise Tracker"` | El `<h1>` existe en el DOM | Sigue en el DOM, solo visualmente oculto con `.sr-only` |
| `renders a <main> landmark` | `<main>` existe | Se mantiene como `<main className="app-shell">` |
| CSS: `.app-shell` sin `min-width` | — | No cambiar el bloque base |
| CSS: `.app-shell` sin `max-width` en base | — | El `padding-bottom` no añade `max-width` |

## Tests (write first — RED)

### App tests — añadir en `src/App.test.tsx`

```
it('renders the TabBar navigation')
  → screen.getByRole('navigation', { name: /navegación principal/i })

it('the h1 "Exercise Tracker" is present in the DOM (accessible) but visually hidden')
  → const h1 = screen.getByRole('heading', { level: 1 })
  → h1.className includes 'sr-only' (o h1.closest('.sr-only') existe)
```

### CSS tests — añadir en `src/styles/main.css.test.ts`

```
it('defines .sr-only class for screen-reader accessibility')
  → css.toMatch(/\.sr-only\s*\{/)

it('.app-shell base rule includes padding-bottom for tab bar clearance')
  → shellBlock.toMatch(/padding-bottom/)
```

## Implementation

1. Añadir `.sr-only` en `src/styles/main.css`.
2. Añadir `padding-bottom` en la regla base de `.app-shell` en `src/styles/main.css`.
3. Editar `src/App.tsx`:
   - Añadir `className="sr-only"` al `<h1>`.
   - Eliminar el `<header>` wrapping si existía.
   - Importar y renderizar `<TabBar />` tras el `<main>`.
4. Eliminar de `Feed.tsx` el link `<Link to="/settings">Ajustes</Link>` (ya está en el tab bar).
5. Actualizar el test de Feed que verificaba ese link (`exposes a Settings (/settings) link from the feed (T048)`): reemplazarlo por un test que verifique que el link ya **no** está en Feed (o eliminarlo y cubrirlo en `TabBar.test.tsx`).

## Done when

- [ ] Todos los tests pasan (incluyendo los 2 nuevos en App y CSS).
- [ ] El test de Feed actualizado pasa.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] Actualizar `status: done` en este archivo.
- [ ] Actualizar tabla en `tasks-summary.md`. Sub-fase B completa; mover puntero a F2-T008.
