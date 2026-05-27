import { describe, it, expect } from 'vitest';

import { linearRegression, predictionInterval, type RegressionPoint } from './regression';

describe('linearRegression', () => {
  it('fits slope and intercept on a perfect line', () => {
    const points: RegressionPoint[] = [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 3, y: 7 },
    ];
    const reg = linearRegression(points);
    expect(reg.slope).toBeCloseTo(2, 6);
    expect(reg.intercept).toBeCloseTo(1, 6);
  });

  it('predict() returns points on the fitted line', () => {
    const reg = linearRegression([
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
    ]);
    expect(reg.predict(10)).toBeCloseTo(21, 6);
  });

  it('throws when fewer than 2 points', () => {
    expect(() => linearRegression([{ x: 0, y: 1 }])).toThrow();
  });

  it('throws when all x values are identical', () => {
    expect(() =>
      linearRegression([
        { x: 2, y: 1 },
        { x: 2, y: 5 },
        { x: 2, y: 9 },
      ]),
    ).toThrow();
  });
});

describe('predictionInterval', () => {
  it('is centered on yHat', () => {
    const points: RegressionPoint[] = [
      { x: 0, y: 1 },
      { x: 1, y: 2.2 },
      { x: 2, y: 2.9 },
      { x: 3, y: 4.1 },
    ];
    const { yHat, lower, upper } = predictionInterval(points, 4);
    expect(lower).toBeLessThan(yHat);
    expect(upper).toBeGreaterThan(yHat);
    expect((lower + upper) / 2).toBeCloseTo(yHat, 6);
  });

  it('widens with more residual noise', () => {
    const x0 = 4;
    const lowNoise: RegressionPoint[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3.1 },
    ];
    const highNoise: RegressionPoint[] = [
      { x: 0, y: 0 },
      { x: 1, y: 3 },
      { x: 2, y: 0 },
      { x: 3, y: 5 },
    ];
    const low = predictionInterval(lowNoise, x0);
    const high = predictionInterval(highNoise, x0);
    expect(high.upper - high.lower).toBeGreaterThan(low.upper - low.lower);
  });

  it('throws with fewer than 3 points', () => {
    expect(() =>
      predictionInterval(
        [
          { x: 0, y: 1 },
          { x: 1, y: 2 },
        ],
        2,
      ),
    ).toThrow();
  });
});
