import { Vector3 } from 'three';

import type { AxisLine } from '../../types/axis';
import { lineLineIntersection2D } from './line2d';

/** Intersection of two finite segments in the XZ plane (`AxisLine` stores x,z as `Vector2` x,y). */
export const lineLineIntersection = (line1: AxisLine, line2: AxisLine): Vector3 | null => {
  const p = lineLineIntersection2D(
    { start: line1[0], end: line1[1] },
    { start: line2[0], end: line2[1] }
  );
  if (!p) return null;
  return new Vector3(p.x, 0, p.y);
};
