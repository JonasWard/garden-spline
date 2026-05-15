import { Vector2 } from 'three';
import { ReferenceSurfaceBase } from '../../types/reference-surface';
import { AxisLine, AxisRay } from '../../types/axis';
import {
  areParallelOrAntiParallel,
  closestParameterOnInfiniteLine,
  evaluateFiniteLineAt,
  evaluateParameterAt,
  getPointsOnInfiniteLineInRange,
  InfiniteLine2D,
  infiniteLineIntersection,
  lineInfineLineIntersection2D
} from '../geometry/line2d';
import { getUVBottomLeft, getUVCorners, getUVTopRight } from '../reference-surface/base-compute';
import { isPointInside } from '../geometry/polygon2d';

export const makeInfiniteLine2d = (origin: Vector2, direction: Vector2): InfiniteLine2D => ({ origin, direction });

export const getUVBoxAxisLimits = (rS: ReferenceSurfaceBase) => ({
  xMin: makeInfiniteLine2d(getUVBottomLeft(rS), new Vector2(1, 0)),
  xMax: makeInfiniteLine2d(getUVTopRight(rS), new Vector2(1, 0)),
  yMin: makeInfiniteLine2d(getUVBottomLeft(rS), new Vector2(0, 1)),
  yMax: makeInfiniteLine2d(getUVTopRight(rS), new Vector2(0, 1))
});

export const getOriginsForAxisRayInUVBox = (axisRay: AxisRay, rS: ReferenceSurfaceBase): Vector2[] => {
  const spacingDirectionLine = makeInfiniteLine2d(axisRay.origin, axisRay.spacingDirection);
  const unitDirectionLine = makeInfiniteLine2d(axisRay.origin, axisRay.direction.clone().normalize());
  const scale = axisRay.direction.length() / axisRay.spacingDirection.length();
  const evaluationResults = getUVCorners(rS).map((v) => closestParameterOnInfiniteLine(unitDirectionLine, v) * scale);
  const startT = Math.min(...evaluationResults) - 1;
  const endT = Math.max(...evaluationResults) + 1;

  return getPointsOnInfiniteLineInRange(spacingDirectionLine, [startT, endT]);
};

/** Method to find all the infinite lines that are described by the axis ray */
export const findInfiniteLine2dForAxisRayInUVBox = (axisRay: AxisRay, rS: ReferenceSurfaceBase): InfiniteLine2D[] =>
  getOriginsForAxisRayInUVBox(axisRay, rS).map((point) => makeInfiniteLine2d(point, axisRay.direction));

const getTrimmedInfiniteLineBetweenLines = (
  line: InfiniteLine2D,
  limits: [InfiniteLine2D, InfiniteLine2D]
): AxisLine | null => {
  const iR0 = infiniteLineIntersection(line, limits[0]);
  const iR1 = infiniteLineIntersection(line, limits[1]);
  if (iR0 === null || iR1 === null) return null;
  // sort intersection t[0]
  return [iR0[0], iR1[0]].sort((a, b) => a - b).map((t) => evaluateParameterAt(line, t)) as AxisLine;
};

const getTrimmedAxisLineBetweenLines = (
  [start, end]: AxisLine,
  limits: [InfiniteLine2D, InfiniteLine2D]
): AxisLine[] => {
  const i0 = lineInfineLineIntersection2D({ start, end }, limits[0]);
  const i1 = lineInfineLineIntersection2D({ start, end }, limits[1]);
  if (i0 && i1) return [[i0, i1]];
  const i = i0 ?? i1;
  if (i)
    return [
      [start, i],
      [i, end]
    ];
  return [[start, end]];
};

const lineIsInUVBox = (corners: Vector2[], [start, end]: AxisLine): boolean =>
  isPointInside(corners, evaluateFiniteLineAt({ start, end }, 0.5)!);

export const populateUVBox = (axis: AxisRay, rS: ReferenceSurfaceBase): AxisLine[] => {
  const infiniteLines = findInfiniteLine2dForAxisRayInUVBox(axis, rS);
  const uvBoxLimits = getUVBoxAxisLimits(rS);

  const xLimits = [uvBoxLimits.xMin, uvBoxLimits.xMax] as [InfiniteLine2D, InfiniteLine2D];
  const yLimits = [uvBoxLimits.yMin, uvBoxLimits.yMax] as [InfiniteLine2D, InfiniteLine2D];

  // either trim with x and y or x or y
  const axisLines: AxisLine[] = [];
  for (const iLine of infiniteLines) {
    const xParallel = areParallelOrAntiParallel(iLine, uvBoxLimits.xMin);
    const yParallel = areParallelOrAntiParallel(iLine, uvBoxLimits.yMin);
    if (!xParallel && !yParallel) {
      // return getTrimmedInfiniteLineBetweenLines(line, xLimits);
      const initialIntersection = getTrimmedInfiniteLineBetweenLines(iLine, xLimits);
      if (initialIntersection) axisLines.push(...getTrimmedAxisLineBetweenLines(initialIntersection, yLimits));
    } else if (xParallel) {
      const r = getTrimmedInfiniteLineBetweenLines(iLine, yLimits);
      if (r) axisLines.push(r);
    } else if (yParallel) {
      const r = getTrimmedInfiniteLineBetweenLines(iLine, xLimits);
      if (r) axisLines.push(r);
    }
  }

  const corners = getUVCorners(rS);
  // filter the lines that are not within the uv box
  return axisLines.filter((line) => lineIsInUVBox(corners, line)) as AxisLine[];
};
