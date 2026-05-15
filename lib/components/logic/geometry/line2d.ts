import { Vector2 } from 'three';

const EPSILON = 1e-10;

export type InfiniteLine2D = {
  origin: Vector2;
  direction: Vector2;
};

export type FiniteLine2D = {
  start: Vector2;
  end: Vector2;
};

type TParameters2D = [number, number];

export const closestParameterOnInfiniteLine = (line: InfiniteLine2D, point: Vector2): number =>
  line.direction.clone().dot(point.clone().sub(line.origin.clone()));

export const closestPointOnInfiniteLine = (line: InfiniteLine2D, point: Vector2): Vector2 =>
  evaluateParameterAt(line, closestParameterOnInfiniteLine(line, point));

export const evaluateParameterAt = (line: InfiniteLine2D, t: number): Vector2 =>
  line.origin.clone().add(line.direction.clone().multiplyScalar(t));

export const getPointsOnInfiniteLineInRange = (line: InfiniteLine2D, range: [number, number]): Vector2[] => {
  const startT = Math.floor(range[0]);
  const endT = Math.ceil(range[1]);
  return [...new Array(endT - startT + 1)].map((_, t) => evaluateParameterAt(line, startT + t));
};

/** T can only be between 0 and 1 */
export const evaluateFiniteLineAt = (line: FiniteLine2D, t: number): Vector2 | null =>
  t > 1 || t < 0 ? null : line.start.clone().add(line.end.clone().sub(line.start).multiplyScalar(t));

/** Par */
export const areParallel = (line1: InfiniteLine2D, line2: InfiniteLine2D): boolean =>
  line1.direction.clone().dot(line2.direction.clone()) > 1 - EPSILON;
export const areAntiParallel = (line1: InfiniteLine2D, line2: InfiniteLine2D): boolean =>
  line1.direction.clone().dot(line2.direction.clone()) < -1 + EPSILON;
export const areParallelOrAntiParallel = (line1: InfiniteLine2D, line2: InfiniteLine2D): boolean =>
  areParallel(line1, line2) || areAntiParallel(line1, line2);
export const areColinear = (line1: InfiniteLine2D, line2: InfiniteLine2D): boolean =>
  areParallelOrAntiParallel(line1, line2) &&
  closestPointOnInfiniteLine(line1, line2.origin).distanceTo(line2.origin) < EPSILON;
export const areNotParallel = (line1: InfiniteLine2D, line2: InfiniteLine2D): boolean =>
  !areParallelOrAntiParallel(line1, line2);

export const infiniteLineIntersection = (line1: InfiniteLine2D, line2: InfiniteLine2D): TParameters2D | null => {
  // The lines are:
  // line1: p1 = line1.origin + t1 * line1.direction
  // line2: p2 = line2.origin + t2 * line2.direction
  // Find t1, t2 such that p1 == p2
  // So, line1.origin + t1 * line1.direction = line2.origin + t2 * line2.direction
  // => t1 * d1 - t2 * d2 = (o2 - o1)
  // Solve as a 2x2 system: [d1, -d2] * [t1, t2]^T = (o2 - o1)

  const d1 = line1.direction;
  const d2 = line2.direction;
  const o1 = line1.origin;
  const o2 = line2.origin;

  // We'll solve:
  // [d1.x, -d2.x][t1] = o2.x - o1.x
  // [d1.y, -d2.y][t2] = o2.y - o1.y

  // That is:
  // | d1.x  -d2.x | [t1] = [ o2.x - o1.x ]
  // | d1.y  -d2.y | [t2]   [ o2.y - o1.y ]

  // Cramer's rule:
  const det = d1.x * -d2.y - d1.y * -d2.x;
  // Should be unreachable due to areParallel, but for robustness
  if (Math.abs(det) < 1e-10) return null;

  const dx = o2.x - o1.x;
  const dy = o2.y - o1.y;

  // For t1:
  // | dx    -d2.x |
  // | dy    -d2.y |
  const detT1 = dx * -d2.y - dy * -d2.x;

  // For t2:
  // | d1.x  dx    |
  // | d1.y  dy    |
  const detT2 = d1.x * dy - d1.y * dx;

  const t1 = detT1 / det;
  const t2 = detT2 / det;

  return [t1, t2];
};

const finiteLineToInfiniteLine = (line: FiniteLine2D): InfiniteLine2D => ({
  origin: line.start,
  direction: line.end.clone().sub(line.start)
});

const clampToLine = (t: number) => Math.max(0, Math.min(1, t));

export const lineInfineLineIntersection2D = (line1: FiniteLine2D, line2: InfiniteLine2D): Vector2 | null => {
  const infiniteLine = finiteLineToInfiniteLine(line1);
  const infiniteResult = infiniteLineIntersection(infiniteLine, line2);
  if (infiniteResult === null) return null;
  if (clampToLine(infiniteResult[0]) !== infiniteResult[0]) return null;
  return line1.start.clone().add(infiniteLine.direction.clone().multiplyScalar(infiniteResult[0]));
};

export const lineLineIntersection2D = (line1: FiniteLine2D, line2: FiniteLine2D): Vector2 | null => {
  const infiniteLine1 = finiteLineToInfiniteLine(line1);
  const infiniteLine2 = finiteLineToInfiniteLine(line2);
  const infiniteResult = infiniteLineIntersection(infiniteLine1, infiniteLine2);
  if (infiniteResult === null) return null;
  if (clampToLine(infiniteResult[0]) !== infiniteResult[0]) return null;
  if (clampToLine(infiniteResult[1]) !== infiniteResult[1]) return null;
  return line1.start.clone().add(infiniteLine1.direction.clone().multiplyScalar(infiniteResult[0]));
};
