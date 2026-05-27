import { max } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';

import { useElementWidth } from './useElementWidth';

export interface Bar {
  label: string;
  value: number;
}

export interface BarChartProps {
  bars: Bar[];
  averageValue?: number;
  height?: number;
  formatValue?: (n: number) => string;
  ariaLabel: string;
}

const MARGIN = { top: 8, right: 12, bottom: 24, left: 44 };

export function BarChart({
  bars,
  averageValue,
  height = 220,
  formatValue = (n) => String(Math.round(n)),
  ariaLabel,
}: BarChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();

  if (bars.length === 0) {
    return (
      <div ref={ref} className="chart">
        <p className="chart-empty">Sin datos suficientes</p>
      </div>
    );
  }

  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const maxValue = Math.max(max(bars, (b) => b.value) ?? 0, averageValue ?? 0, 1);

  const xScale = scaleBand<string>()
    .domain(bars.map((b) => b.label))
    .range([0, innerWidth])
    .padding(0.2);
  const yScale = scaleLinear().domain([0, maxValue]).range([innerHeight, 0]).nice();

  const yTicks = yScale.ticks(4);

  return (
    <div ref={ref} className="chart">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        className="bar-chart"
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line
                className="chart-gridline"
                x1={0}
                x2={innerWidth}
                y1={yScale(t)}
                y2={yScale(t)}
              />
              <text className="chart-tick chart-tick--y" x={-8} y={yScale(t)}>
                {formatValue(t)}
              </text>
            </g>
          ))}

          {bars.map((bar) => {
            const x = xScale(bar.label) ?? 0;
            const y = yScale(bar.value);
            return (
              <g key={bar.label}>
                <rect
                  className="chart-bar"
                  x={x}
                  y={y}
                  width={xScale.bandwidth()}
                  height={Math.max(0, innerHeight - y)}
                />
                <text
                  className="chart-tick chart-tick--x"
                  x={x + xScale.bandwidth() / 2}
                  y={innerHeight + 16}
                >
                  {bar.label}
                </text>
              </g>
            );
          })}

          {averageValue !== undefined && (
            <line
              className="chart-average"
              x1={0}
              x2={innerWidth}
              y1={yScale(averageValue)}
              y2={yScale(averageValue)}
            />
          )}
        </g>
      </svg>
    </div>
  );
}
