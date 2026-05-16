import { Vector2, Vector3 } from 'three';
import { DEFAULT_SURFACE_BASE, ReferenceSurfaceBase, UVBox } from '../../types/reference-surface';
import { FiniteLine2D } from '../geometry/line2d';

const getUVRange = ({ m, n, dX, dY }: ReferenceSurfaceBase = DEFAULT_SURFACE_BASE): Vector2 =>
  new Vector2(dX * n, dY * m);

const getUVDiagonal = (referenceSurface: ReferenceSurfaceBase): Vector2 => getUVRange(referenceSurface);

export const getUVBottomLeft = (referenceSurface: ReferenceSurfaceBase): Vector2 =>
  getUVRange(referenceSurface).multiplyScalar(-0.5);

export const getUVTopRight = (referenceSurface: ReferenceSurfaceBase): Vector2 =>
  getUVBottomLeft(referenceSurface).add(getUVDiagonal(referenceSurface));

const getLocalUVDelta = (referenceSurface: ReferenceSurfaceBase): Vector2 =>
  new Vector2(referenceSurface.dX, referenceSurface.dY);

export const getUVCorners = (referenceSurface: ReferenceSurfaceBase): Vector2[] => {
  const r = getUVRange(referenceSurface);
  return [new Vector2(0, 0), new Vector2(r.x, 0), new Vector2(r.x, r.y), new Vector2(0, r.y)].map((v) =>
    v.add(getUVBottomLeft(referenceSurface))
  );
};

/** `(n+1)×(m+1)` grid; flat index `j*(n+1)+i` matches `makeGridQuads(n+1, m+1)` in sample-surface. */
export const getDefaultControlPoints = ({ m, n, dX, dY }: ReferenceSurfaceBase): Vector3[] => {
  const pts: Vector3[] = [];
  for (let j = 0; j <= m; j++) {
    for (let i = 0; i <= n; i++) {
      pts.push(new Vector3((i - n * 0.5) * dX, (j - m * 0.5) * dY, 0));
    }
  }
  return pts;
};

export const getUVBox = (rS: ReferenceSurfaceBase): UVBox => [getUVBottomLeft(rS), getUVTopRight(rS)];

export const getUVBoxLines = (rS: ReferenceSurfaceBase): FiniteLine2D[] =>
  getUVCorners(rS).map((c, i, arr) => ({ start: c, end: arr[(i + 1) % arr.length]! }));
