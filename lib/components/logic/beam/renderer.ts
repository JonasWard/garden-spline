import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';

import { get2DVisualisation, patternUvToSurfaceGridUv } from '../axis/renderer';
import { createReferenceSurfaceSampler } from '../reference-surface/catmull-clark/sample-surface';
import type { AxisLine, AxisType } from '../../types/axis';
import type { BeamType } from '../../types/beam';
import type { ReferenceSurface } from '../../types/reference-surface';
import {
  appendBeamQuadStripGeometry,
  DEFAULT_AXIS_3D_SURFACE_SUBDIVISION_LEVELS,
  sampleLiftedAxisSegmentOnSurface
} from './generate-axis-beam-geometry';

/**
 * Extruded rectangular beam along lifted grid axes: cross-section spanned by **surface normal** `N` (height) and
 * `B = N × T` where `T` is the axis tangent in 3D projected onto the tangent plane (orthogonal to `N`).
 */
export function buildAxisBeamBufferGeometry(
  axis: AxisType,
  referenceSurface: ReferenceSurface,
  beam: BeamType
): BufferGeometry {
  const sampler = createReferenceSurfaceSampler(referenceSurface, {
    subdivisionLevels: DEFAULT_AXIS_3D_SURFACE_SUBDIVISION_LEVELS
  });
  const posScratch = new Vector3();
  const nScratch = new Vector3();

  const lines2d = get2DVisualisation(axis, referenceSurface).map(
    ([a, b]) =>
      [patternUvToSurfaceGridUv(a, referenceSurface), patternUvToSurfaceGridUv(b, referenceSurface)] as AxisLine
  );

  const halfW = beam.width * 0.5;
  const halfH = beam.height * 0.5;

  const positions: number[] = [];
  const indices: number[] = [];
  let vertexBase = 0;

  for (const [a, b] of lines2d) {
    const samples = sampleLiftedAxisSegmentOnSurface(a, b, sampler, posScratch, nScratch);
    vertexBase = appendBeamQuadStripGeometry(samples, halfW, halfH, positions, indices, vertexBase);
  }

  const geom = new BufferGeometry();
  if (positions.length === 0) {
    return geom;
  }
  geom.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}
