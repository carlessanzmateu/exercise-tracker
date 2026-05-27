export interface RegressionPoint {
  x: number;
  y: number;
}

export interface Regression {
  slope: number;
  intercept: number;
  predict(x: number): number;
}

export interface PredictionInterval {
  yHat: number;
  lower: number;
  upper: number;
}

// Cuantil 0.90 unilateral de la t de Student (≡ intervalo bilateral al 80%) por g.l.
// Fallback 1.282 (normal) para g.l. mayores a los tabulados.
const T_QUANTILE_90: Record<number, number> = {
  1: 3.078,
  2: 1.886,
  3: 1.638,
  4: 1.533,
  5: 1.476,
  6: 1.44,
  7: 1.415,
  8: 1.397,
  9: 1.383,
  10: 1.372,
};
const T_QUANTILE_90_INFINITY = 1.282;

function tCritical80(df: number): number {
  return T_QUANTILE_90[df] ?? T_QUANTILE_90_INFINITY;
}

function meanOf(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function linearRegression(points: RegressionPoint[]): Regression {
  if (points.length < 2) {
    throw new Error('linearRegression requiere al menos 2 puntos');
  }
  const xBar = meanOf(points.map((p) => p.x));
  const yBar = meanOf(points.map((p) => p.y));

  let sxx = 0;
  let sxy = 0;
  for (const { x, y } of points) {
    sxx += (x - xBar) * (x - xBar);
    sxy += (x - xBar) * (y - yBar);
  }
  if (sxx === 0) {
    throw new Error('linearRegression requiere valores de x distintos');
  }

  const slope = sxy / sxx;
  const intercept = yBar - slope * xBar;
  return {
    slope,
    intercept,
    predict: (x: number) => intercept + slope * x,
  };
}

// Intervalo de predicción (por defecto al 80%) en x0.
export function predictionInterval(
  points: RegressionPoint[],
  x0: number,
  confidence = 0.8,
): PredictionInterval {
  if (points.length < 3) {
    throw new Error('predictionInterval requiere al menos 3 puntos');
  }
  if (confidence !== 0.8) {
    throw new Error('predictionInterval solo soporta una confianza del 80% por ahora');
  }

  const reg = linearRegression(points);
  const n = points.length;
  const xBar = meanOf(points.map((p) => p.x));

  let sse = 0;
  let sxx = 0;
  for (const { x, y } of points) {
    const residual = y - reg.predict(x);
    sse += residual * residual;
    sxx += (x - xBar) * (x - xBar);
  }

  const standardError = Math.sqrt(sse / (n - 2));
  const tValue = tCritical80(n - 2);
  const margin = tValue * standardError * Math.sqrt(1 + 1 / n + ((x0 - xBar) * (x0 - xBar)) / sxx);

  const yHat = reg.predict(x0);
  return { yHat, lower: yHat - margin, upper: yHat + margin };
}
