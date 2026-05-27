import { max, min } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { area, line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';

import { useElementWidth } from './useElementWidth';

export interface LinePoint {
  date: string;
  value: number;
}

export interface ProjectionBand {
  center: LinePoint[];
  lower: LinePoint[];
  upper: LinePoint[];
}

export interface LineChartProps {
  data: LinePoint[];
  projection?: ProjectionBand;
  overlay?: { points: LinePoint[] };
  height?: number;
  yLabel?: string;
  formatValue?: (n: number) => string;
  ariaLabel: string;
}

const MARGIN = { top: 8, right: 12, bottom: 24, left: 44 };
const formatDateTick = timeFormat('%-m/%y');

function toDate(point: LinePoint): Date {
  return new Date(point.date);
}

export function LineChart({
  data,
  projection,
  overlay,
  height = 220,
  yLabel,
  formatValue = (n) => String(Math.round(n)),
  ariaLabel,
}: LineChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();

  if (data.length === 0) {
    return (
      <div ref={ref} className="chart">
        <p className="chart-empty">Sin datos suficientes</p>
      </div>
    );
  }

  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const allPoints: LinePoint[] = [
    ...data,
    ...(projection ? [...projection.center, ...projection.lower, ...projection.upper] : []),
    ...(overlay ? overlay.points : []),
  ];
  const dates = allPoints.map(toDate);
  const values = allPoints.map((p) => p.value);

  const xMin = min(dates) ?? new Date();
  const xMax = max(dates) ?? new Date();
  const vMin = min(values) ?? 0;
  const vMax = max(values) ?? 1;
  const pad = (vMax - vMin || vMax || 1) * 0.1;

  const xScale = scaleTime().domain([xMin, xMax]).range([0, innerWidth]);
  const yScale = scaleLinear()
    .domain([vMin - pad, vMax + pad])
    .range([innerHeight, 0]);

  const lineGen = line<LinePoint>()
    .x((d) => xScale(toDate(d)))
    .y((d) => yScale(d.value));

  const linePath = lineGen(data) ?? '';

  let bandPath = '';
  let projectedPath = '';
  if (projection) {
    const bandData = projection.lower.map((lo, i) => ({
      date: lo.date,
      lower: lo.value,
      upper: projection.upper[i]?.value ?? lo.value,
    }));
    const areaGen = area<(typeof bandData)[number]>()
      .x((d) => xScale(new Date(d.date)))
      .y0((d) => yScale(d.lower))
      .y1((d) => yScale(d.upper));
    bandPath = areaGen(bandData) ?? '';
    projectedPath = lineGen(projection.center) ?? '';
  }

  const yTicks = yScale.ticks(4);
  const xTicks = xScale.ticks(4);

  return (
    <div ref={ref} className="chart">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        className="line-chart"
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
          {xTicks.map((t) => (
            <text
              key={t.getTime()}
              className="chart-tick chart-tick--x"
              x={xScale(t)}
              y={innerHeight + 16}
            >
              {formatDateTick(t)}
            </text>
          ))}
          {bandPath && <path className="chart-band" d={bandPath} />}
          {projectedPath && <path className="chart-line--projected" d={projectedPath} />}
          {overlay && overlay.points.length > 0 && (
            <path className="chart-line--overlay" d={lineGen(overlay.points) ?? ''} />
          )}
          <path className="chart-line" d={linePath} />
        </g>
        {yLabel && (
          <text className="chart-axis-label" x={4} y={12}>
            {yLabel}
          </text>
        )}
      </svg>
    </div>
  );
}
