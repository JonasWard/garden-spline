import { Vector3 } from 'three';

import { getDefaultControlPoints } from './base-compute';
import type { ReferenceSurfaceBase } from '../../types/reference-surface';

export const CONTROL_POINT_DELTA_MAX = 10;
export const CONTROL_POINT_DELTA_PRECISION = 0.01;

const DELTA_EPS = CONTROL_POINT_DELTA_PRECISION * 0.5;

export type ControlPointDelta = { x: number; y: number; z: number };

/** `null` = vertex at the default grid position for the current `n×m` layout. */
export type ControlPointDeltas = (ControlPointDelta | null)[];

export const controlPointCount = ({ n, m }: ReferenceSurfaceBase) => (n + 1) * (m + 1);

export const emptyControlPointDeltas = (base: ReferenceSurfaceBase): ControlPointDeltas =>
  Array.from({ length: controlPointCount(base) }, () => null);

const roundDelta = (v: number) =>
  Math.round(v / CONTROL_POINT_DELTA_PRECISION) * CONTROL_POINT_DELTA_PRECISION;

export const clampControlPointDelta = (delta: ControlPointDelta): ControlPointDelta => ({
  x: roundDelta(Math.max(-CONTROL_POINT_DELTA_MAX, Math.min(CONTROL_POINT_DELTA_MAX, delta.x))),
  y: roundDelta(Math.max(-CONTROL_POINT_DELTA_MAX, Math.min(CONTROL_POINT_DELTA_MAX, delta.y))),
  z: roundDelta(Math.max(-CONTROL_POINT_DELTA_MAX, Math.min(CONTROL_POINT_DELTA_MAX, delta.z)))
});

export const resolveControlPoints = (base: ReferenceSurfaceBase, deltas: ControlPointDeltas): Vector3[] => {
  const defaults = getDefaultControlPoints(base);
  if (deltas.length !== defaults.length) {
    throw new Error(`controlPointDeltas length ${deltas.length} !== ${defaults.length}`);
  }
  return defaults.map((d, i) => {
    const delta = deltas[i] ?? null;
    if (delta === null) return d.clone();
    return new Vector3(d.x + delta.x, d.y + delta.y, d.z + delta.z);
  });
};

export const absoluteToControlPointDeltas = (
  base: ReferenceSurfaceBase,
  positions: Vector3[]
): ControlPointDeltas => {
  const defaults = getDefaultControlPoints(base);
  if (positions.length !== defaults.length) {
    throw new Error(`positions length ${positions.length} !== ${defaults.length}`);
  }
  return positions.map((p, i) => {
    const d = defaults[i]!;
    const delta = {
      x: roundDelta(p.x - d.x),
      y: roundDelta(p.y - d.y),
      z: roundDelta(p.z - d.z)
    };
    if (
      Math.abs(delta.x) < DELTA_EPS &&
      Math.abs(delta.y) < DELTA_EPS &&
      Math.abs(delta.z) < DELTA_EPS
    ) {
      return null;
    }
    return clampControlPointDelta(delta);
  });
};
