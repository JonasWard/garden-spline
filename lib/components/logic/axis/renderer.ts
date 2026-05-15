import { Vector3 } from 'three';

import { AxisLine, AxisType } from '../../types/axis';
import { ReferenceSurface, ReferenceSurfaceBase } from '../../types/reference-surface';
import { sampleReferenceSurfacePosition } from '../reference-surface/catmull-clark/sample-surface';
import { populateUVBox } from './populate-uv-box';
import { getBaseAxisRays } from './base-compute';

const SAMPLE_STEP = 0.08;

export const get2DVisualisation = (axis: AxisType, referenceSurface: ReferenceSurfaceBase): AxisLine[] => {
  const baseRays = getBaseAxisRays(axis);
  const allRays = baseRays.flatMap((ray) => populateUVBox(ray, referenceSurface));
  return allRays;
};

export const get3DVisualisation = (axis: AxisType, referenceSurface: ReferenceSurface): Vector3[][] => {
  const lines2d = get2DVisualisation(axis, referenceSurface);
  return lines2d.map(([a, b]) => {
    const dist = a.distanceTo(b);
    const count = Math.max(2, Math.ceil(dist / SAMPLE_STEP) + 1);
    const pts: Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      const uv = a.clone().lerp(b, t);
      pts.push(sampleReferenceSurfacePosition(referenceSurface, { u: uv.x, v: uv.y }));
    }
    return pts;
  });
};
