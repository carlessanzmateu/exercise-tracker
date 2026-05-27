export interface SeriesPoint {
  date: string;
  value: number;
}

// Media móvil "trailing" de ventana `window` (por defecto 7).
// Para el punto i promedia los min(window, i+1) puntos hasta i (incluido).
// Asume puntos ordenados por fecha ascendente.
export function movingAverage(points: SeriesPoint[], window = 7): SeriesPoint[] {
  if (window <= 1) return points.map((p) => ({ ...p }));

  return points.map((point, i) => {
    const start = Math.max(0, i - window + 1);
    let sum = 0;
    for (let j = start; j <= i; j += 1) sum += points[j].value;
    return { date: point.date, value: sum / (i - start + 1) };
  });
}
