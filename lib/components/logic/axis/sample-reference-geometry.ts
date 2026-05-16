import { Vector2, Vector3 } from 'three';
import { AxisLine } from '../../types/axis';
import { ReferenceSurface } from '../../types/reference-surface';
import { sampleReferenceSurfacePosition } from '../reference-surface/catmull-clark/sample-surface';
import { evaluateFiniteLineAt } from '../geometry/line2d';

const SAMPLE_UV_STEP = 0.1;

const getSampleUVs = ([start, end]: AxisLine): Vector2[] => {
  const c = Math.ceil(end.distanceTo(start) / SAMPLE_UV_STEP);
  return [...new Array(c + 1)].map((_, i) => evaluateFiniteLineAt({ start, end }, i / c)!);
};

export const sampleAxisLine = (axisLine: AxisLine, referenceSurface: ReferenceSurface): Vector3[] =>
  getSampleUVs(axisLine).map((uv) => sampleReferenceSurfacePosition(referenceSurface, { u: uv.x, v: uv.y }));
 