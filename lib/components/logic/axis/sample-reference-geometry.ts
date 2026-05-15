import { Vector2, Vector3 } from 'three';
import { AxisLine } from '../../types/axis';
import { ReferenceSurface } from '../../types/reference-surface';
import { sampleReferenceSurfacePosition } from '../reference-surface/catmull-clark/sample-surface';

const SAMPLE_UV_STEP = 0.1;

const getSampleUVs = ([start, end]: AxisLine): Vector2[] => {
  const c = Math.ceil(end.distanceTo(start) / SAMPLE_UV_STEP) + 1;
  return [...new Array(c)].map((_, i) =>
    start.clone().add(
      end
        .clone()
        .sub(start)
        .multiplyScalar(i / (c - 1))
    )
  );
};

export const sampleAxisLine = (axisLine: AxisLine, referenceSurface: ReferenceSurface): Vector3[] =>
  getSampleUVs(axisLine).map((uv) => sampleReferenceSurfacePosition(referenceSurface, { u: uv.x, v: uv.y }));
 