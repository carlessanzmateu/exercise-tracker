---
id: F3-T011
status: done
title: "Progreso" tab + /progress route
sub-phase: C-navigation-shell
depends-on: []
---

## Goal

Añadir la **4ª pestaña "Progreso"** al tab bar (entre Entrenamientos y Ajustes) y la **ruta `/progress`**. El tab bar pasa de 3 a 4 ítems. Es el punto de entrada a toda la Fase 3.

## Context

- `src/components/TabBar.tsx` (de F2-T006): tiene `feedActive` y `settingsActive` según `useLocation()`. Añadir un ítem `<Link to="/progress">` con un icono SVG inline de gráfica (p. ej. barras: `M4 20V10 M10 20V4 M16 20v-7 M20 20H3`), texto "Progreso", `aria-current="page"` cuando `pathname === '/progress'`.
- `src/App.tsx`: registrar `<Route path="/progress" element={<Progress />} />`.
- Crear un `src/features/progress/Progress.tsx` **mínimo** por ahora: `<section data-testid="route-progress"><h2 className="page-title">Progreso</h2></section>` (el shell completo es F3-T012).
- Orden de las pestañas: Entrenamientos · + · Progreso · Ajustes. (El "+" central se mantiene como botón destacado.)

## Tests (write first — RED)

- Actualizar `src/components/TabBar.test.tsx`:
```
it('renders a link to /progress with text "Progreso"')
it('marks the progress tab as active when at /progress')
it('does not mark progress active at /')
it('the add (+) tab still has no aria-current')   // sigue pasando
```
- Actualizar `src/App.test.tsx`:
```
it('at "/progress" renders the Progress screen')   // findByTestId('route-progress')
```

## Implementation

1. Crear `Progress.tsx` mínimo.
2. Añadir el ítem "Progreso" en `TabBar.tsx` con su icono y lógica de activado.
3. Registrar la ruta en `App.tsx`.

## Done when

- [ ] Todos los tests pasan (incl. los previos de TabBar/App, ya con 4 pestañas).
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T012.
