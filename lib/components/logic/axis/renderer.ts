import { Vector2, Vector3 } from 'three';

import { AxisLine, AxisType } from '../../types/axis';
import { ReferenceSurface, ReferenceSurfaceBase } from '../../types/reference-surface';
import {
  AXIS_BEAM_UV_SAMPLE_STEP,
  DEFAULT_AXIS_3D_SURFACE_SUBDIVISION_LEVELS
} from '../beam/generate-axis-beam-geometry';
import { createReferenceSurfaceSampler } from '../reference-surface/catmull-clark/sample-surface';
import { populateUVBox } from './populate-uv-box';
import { getBaseAxisRays } from './base-compute';

export const get2DVisualisation = (axis: AxisType, referenceSurface: ReferenceSurfaceBase): AxisLine[] => {
  const baseRays = getBaseAxisRays(axis);
  const allRays = baseRays.flatMap((ray) => populateUVBox(ray, referenceSurface));
  return allRays;
};

/** Maps pattern-plane UV from {@link get2DVisualisation} into continuous surface indices `(u,v)` in `[0,n]×[0,m]`. */
export const patternUvToSurfaceGridUv = (uv: Vector2, { dX, dY, n, m }: ReferenceSurface): Vector2 =>
  new Vector2(uv.x / dX + n * 0.5, uv.y / dY + m * 0.5);

export const get3DVisualisation = (axis: AxisType, referenceSurface: ReferenceSurface): Vector3[][] => {
  const sampler = createReferenceSurfaceSampler(referenceSurface, {
    subdivisionLevels: DEFAULT_AXIS_3D_SURFACE_SUBDIVISION_LEVELS
  });
  const pos = new Vector3();
  const nor = new Vector3();
  const lines2d = get2DVisualisation(axis, referenceSurface).map(
    ([a, b]) => [patternUvToSurfaceGridUv(a, referenceSurface), patternUvToSurfaceGridUv(b, referenceSurface)] as AxisLine
  );
  return lines2d.map(([a, b]) => {
    const dist = a.distanceTo(b);
    const count = Math.max(2, Math.ceil(dist / AXIS_BEAM_UV_SAMPLE_STEP) + 1);
    const pts: Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      const uv = a.clone().lerp(b, t);
      sampler({ u: uv.x, v: uv.y }, pos, nor);
      pts.push(pos.clone());
    }
    return pts;
  });
};
