---
id: F3-T008
status: done
title: useElementWidth hook (responsive)
sub-phase: B-chart-primitives
depends-on: []
---

## Goal

Hook que mide el ancho del contenedor de una gráfica para que el SVG sea responsive (densidad de ticks y escalas correctas en iPhone, tablet y desktop). Primera tarea de la Sub-fase B.

> **Al empezar esta sub-fase**, instalar las dependencias D3: `npm i d3-scale d3-shape d3-array d3-time d3-time-format` y `npm i -D @types/d3-scale @types/d3-shape @types/d3-array @types/d3-time @types/d3-time-format`. Verificar que `npm run build` sigue OK.

## Context

Crear `src/components/charts/useElementWidth.ts`. Usa `ResizeObserver` cuando exista; si no (entorno de test jsdom), devolver un ancho por defecto sin romper.

```ts
export function useElementWidth<T extends HTMLElement = HTMLDivElement>(
  fallbackWidth?: number,   // por defecto 320
): [React.RefObject<T>, number];
```

Comportamiento:
- Devuelve `[ref, width]`. Al montar y en cada resize del elemento referenciado, actualiza `width`.
- Si `ResizeObserver` no está disponible o el elemento aún no mide, devuelve `fallbackWidth`.
- Limpiar el observer en el desmontaje.

## Tests (write first — RED)

Crear `src/components/charts/useElementWidth.test.tsx` (render de un componente de prueba que use el hook).

```
it('returns the fallback width before measuring')
it('exposes a ref that can be attached to an element')
it('does not crash when ResizeObserver is unavailable')
```

## Implementation

1. Implementar el hook con `useState` + `useEffect` y guarda de `typeof ResizeObserver !== 'undefined'`.

## Done when

- [ ] Dependencias D3 instaladas; `npm run build` OK.
- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T009.
