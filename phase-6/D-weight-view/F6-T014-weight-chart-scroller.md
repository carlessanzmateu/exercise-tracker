---
id: F6-T014
status: todo
title: Weight chart scroller (window + lateral scroll)
sub-phase: D-weight-view
depends-on: [F6-T003, F6-T004, F6-T011, F6-T013]
---

## Goal

Renderizar la **gráfica de peso/día** con ventana móvil acorde al filtro
seleccionado y permitir **navegar al pasado** mediante scroll lateral:
- **Móvil** (< 640px): solo swipe horizontal.
- **Tablet+** (≥ 640px): swipe + botones `←` / `→`.

Esta tarea NO incluye tendencia ni proyección (eso es F6-T015). Aquí solo:
filtro, ventana, scroll y datos crudos en la `LineChart`.

## Context

Crear `src/features/weight/WeightChartScroller.tsx`.

Props:
```ts
interface WeightChartScrollerProps {
  entries: WeightEntry[];
}
```

Estado interno:
- `filter: WeightFilter` (default `'month'`).
- `offsetUnits: number` (default `0`).

Computados:
- `dailyPoints = aggregateByDay(entries)` (F6-T003) — `{ date, avgKg, count }[]`
  ordenado asc.
- `range = computeWindowRange(filter, today, offsetUnits)` (F6-T004).
- `visiblePoints = dailyPoints.filter(p => p.date >= range.from && p.date <= range.to)`.
- `linePoints: LinePoint[] = visiblePoints.map(p => ({ date: p.date, value: p.avgKg }))`.

Render:
- `<FilterPills>` con las 6 opciones; al cambiar resetea `offsetUnits` a 0.
- Cabecera con el **rango** formateado (`"1–31 may 2026"`) y, en `≥ 640px`,
  botones `←` (anterior) y `→` (siguiente) flanqueando el título.
- `<LineChart data={linePoints} yLabel="kg" formatValue={n=>n.toFixed(1)} ariaLabel="Peso por día" />`.
- Estado vacío cuando `visiblePoints.length === 0`: "Sin datos en esta ventana".

Scroll:
- **Swipe táctil**: capturar `touchstart` / `touchmove` / `touchend`; si el
  desplazamiento horizontal supera 50px sin desplazamiento vertical
  comparable, navegar:
  - Swipe → derecha → `offsetUnits--` no aplica… Aclaración: queremos que
    "swipe izquierda" muestre el pasado y "swipe derecha" el futuro:
    - **Swipe → izquierda** (`startX > endX`) → `offsetUnits--` (al pasado).
    - **Swipe → derecha** (`endX > startX`) → `offsetUnits++` (volver al
      presente), pero `offsetUnits` máximo es 0.
- **Botones (≥ 640px)**: `←` → `offsetUnits--`; `→` → `offsetUnits++` (cap 0).
- `→` está deshabilitado si `offsetUnits === 0`.
- `←` está deshabilitado si la ventana **anterior** queda completamente antes
  del primer dato disponible (es decir, `range_anterior.to < dailyPoints[0].date`).
- YTD: ignora `offsetUnits` (F6-T004 ya lo garantiza); las flechas se
  deshabilitan en ese filtro.

Responsive:
- Hook `useMediaQuery('(min-width: 640px)')` (o equivalente con `useEffect` y
  `matchMedia`).
- En móvil, no renderizar los botones; el swipe sigue funcionando.

Formato del rango de la cabecera:
- `week`: `"25 may – 31 may 2026"` (mismo mes/año comprimido).
- `month`: `"Mayo 2026"`.
- `quarter`: `"T2 2026 (abr–jun)"`.
- `semester`: `"S1 2026 (ene–jun)"`.
- `year`: `"2026"`.
- `ytd`: `"YTD: 1 ene – {hoy}"`.

## Tests (write first — RED)

Crear `src/features/weight/WeightChartScroller.test.tsx`.

```
it('renders only entries within the default month window')
it('changes the visible window when switching the filter')
it('decrements offsetUnits when the left button is clicked (tablet+)')
it('disables the right button when offsetUnits is 0')
it('disables the left button when no older data exists')
it('does not render arrow buttons on mobile (< 640px)')
it('navigates back on a leftward swipe')
it('navigates forward on a rightward swipe (capped at offsetUnits = 0)')
it('shows an empty state when the visible window has no points')
it('does not allow scrolling when the filter is YTD')
```

Para `useMediaQuery` en tests: mockear `window.matchMedia` (el test setup ya
lo hace para otros componentes; revisar `src/test/`).

Para swipes: simular eventos `touchstart`/`touchend` con `fireEvent`.

## Implementation

1. Implementar `WeightChartScroller` con estado de filtro y offset.
2. Helper `formatRangeLabel(filter, range)` para la cabecera.
3. Hook `useIsTabletOrAbove()` que usa `matchMedia('(min-width: 640px)')`.
4. Handlers de touch + botones, capping de `offsetUnits` en 0 por arriba.
5. Render condicional de los botones.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T015.
