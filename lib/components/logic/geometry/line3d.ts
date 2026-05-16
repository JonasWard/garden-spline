import { Vector3 } from 'three';

import type { AxisLine } from '../../types/axis';
import { lineLineIntersection2D } from './line2d';

export type InfiniteLine3D = {
  origin: Vector3;
  direction: Vector3;
};

export type FiniteLine3D = {
  start: Vector3;
  end: Vector3;
};

/** Closest t parameter on infinite line */
export const closestParameterOnInfiniteLine = (line: InfiniteLine3D, point: Vector3): number =>
  line.direction.clone().dot(point.clone().sub(line.origin.clone()));

export const closestPointOnInfiniteLine = (line: InfiniteLine3D, point: Vector3): Vector3 =>
  evaluateParameterAt(line, closestParameterOnInfiniteLine(line, point));

export const evaluateParameterAt = (line: InfiniteLine3D, t: number): Vector3 =>
  line.origin.clone().add(line.direction.clone().multiplyScalar(t));

/** Closest t parameters of two (crossing) infinite lines */
export const infiniteLineIntersection = (line1: InfiniteLine3D, line2: InfiniteLine3D): [number, number] | null => {
  // This implements the closest-point-of-approach for skew lines in 3D.
  // See: https://en.wikipedia.org/wiki/Skew_lines#Nearest_Points
  const p1 = line1.origin;
  const d1 = line1.direction;
  const p2 = line2.origin;
  const d2 = line2.direction;

  const w0 = p1.clone().sub(p2);
  const a = d1.dot(d1);
  const b = d1.dot(d2);
  const c = d2.dot(d2);
  const d = d1.dot(w0);
  const e = d2.dot(w0);
  const denom = a * c - b * b;

  // If lines are parallel (denom ~ 0), return some default (e.g., both zero)
  if (Math.abs(denom) < 1e-12) return null;

  const t1 = (b * e - c * d) / denom;
  const t2 = (a * e - b * d) / denom;
  return [t1, t2];
};

/** Intersection of two finite segments in the XZ plane (`AxisLine` stores x,z as `Vector2` x,y). */
export const lineLineIntersection = (line1: AxisLine, line2: AxisLine): Vector3 | null => {
  const p = lineLineIntersection2D(
    { start: line1[0], end: line1[1] },
    { start: line2[0], end: line2[1] }
  );
  if (!p) return null;
  return new Vector3(p.x, 0, p.y);
};
