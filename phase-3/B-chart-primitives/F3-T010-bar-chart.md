---
id: F3-T010
status: done
title: BarChart primitive
sub-phase: B-chart-primitives
depends-on: [F3-T008]
---

## Goal

Componente `BarChart` reutilizable que dibuja **barras categóricas** con eje y etiquetas, y opcionalmente una **línea de media** horizontal. Usado por los paneles de frecuencia (F3-T014), volumen muscular (F3-T018) y tonelaje (F3-T020).

## Context

Crear `src/components/charts/BarChart.tsx`. Usar `d3-scale` (`scaleBand`, `scaleLinear`), `d3-array` (`max`). Responsive con `useElementWidth`.

```ts
export interface Bar { label: string; value: number; }
export interface BarChartProps {
  bars: Bar[];
  averageValue?: number;           // dibuja línea de media si se pasa
  height?: number;                 // por defecto 220
  formatValue?: (n: number) => string;
  ariaLabel: string;
}
```

Requisitos:
- Una `<rect class="chart-bar">` por barra; etiquetas del eje X bajo cada barra (rotar/recortar si no caben en móvil).
- Eje Y con ticks etiquetados.
- Si `averageValue`: `<line class="chart-average">` punteada horizontal + etiqueta.
- Colores vía variables CSS (modo claro/oscuro).
- Estado vacío accesible si `bars` está vacío.
- Estilos en `main.css` (`.chart-bar`, `.chart-average`).

## Tests (write first — RED)

Crear `src/components/charts/BarChart.test.tsx`.

```
it('renders an svg with the given aria-label')
it('renders one rect per bar')
it('renders the X axis label for each bar')
it('renders an average line when averageValue is provided')
it('does not render an average line when averageValue is omitted')
it('shows an empty state when there are no bars')
```

## Implementation

1. Implementar `BarChart` con `scaleBand`/`scaleLinear`; barras y ejes desde React.
2. Añadir clases de estilo en `main.css`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. Sub-fase B completa; puntero a F3-T011.
