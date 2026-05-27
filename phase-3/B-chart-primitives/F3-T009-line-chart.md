---
id: F3-T009
status: done
title: LineChart primitive
sub-phase: B-chart-primitives
depends-on: [F3-T008]
---

## Goal

Componente `LineChart` reutilizable que dibuja una **serie temporal** como línea SVG con ejes, y opcionalmente una **banda de proyección** (área sombreada + segmento futuro punteado). D3 calcula escalas/paths; React renderiza el SVG. Usado por los paneles de ejercicio (F3-T015/T016), cardio (F3-T019) y donde haga falta una línea.

## Context

Crear `src/components/charts/LineChart.tsx`. Usar `d3-scale` (`scaleTime`, `scaleLinear`), `d3-shape` (`line`, `area`), `d3-array` (`extent`, `max`).

```ts
export interface LinePoint { date: string; value: number; }   // date ISO
export interface ProjectionBand {
  // puntos futuros (línea central) y límites del intervalo
  center: LinePoint[];
  lower: LinePoint[];
  upper: LinePoint[];
}
export interface LineChartProps {
  data: LinePoint[];
  projection?: ProjectionBand;
  height?: number;                 // por defecto 220
  yLabel?: string;
  formatValue?: (n: number) => string;
  ariaLabel: string;
}
```

Requisitos:
- SVG con `viewBox` y `width: 100%` (responsive; usar `useElementWidth` para el ancho real y la densidad de ticks).
- Path de la serie con `class="chart-line"`; ejes X (fechas) e Y con ticks etiquetados.
- Si `projection`: `<path class="chart-line--projected">` (segmento punteado) y `<path class="chart-band">` (área entre `lower` y `upper`).
- Colores vía variables CSS (`--color-accent`, `--color-text-muted`, `--color-border`) para respetar modo claro/oscuro.
- Estado vacío accesible si `data.length === 0` (texto "Sin datos suficientes").
- Estilos en `src/styles/main.css` (`.chart-line`, `.chart-line--projected`, `.chart-band`, ejes).

## Tests (write first — RED)

Crear `src/components/charts/LineChart.test.tsx`.

```
it('renders an svg with the given aria-label')
it('draws a path with class "chart-line" for the data')
it('renders Y axis tick labels')
it('renders a projection band and projected line when projection is provided')
it('shows an empty state when data is empty')
```

## Implementation

1. Implementar `LineChart` con escalas D3 y paths; renderizar ejes desde `scale.ticks()`.
2. Añadir clases de estilo en `main.css`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T010.
