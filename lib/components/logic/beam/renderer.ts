import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';

import { getAxisStackGroups, getStackBeamNormalOffset } from '../axis/stack-group';
import { patternUvToSurfaceGridUv } from '../axis/renderer';
import { createReferenceSurfaceSampler } from '../reference-surface/catmull-clark/sample-surface';
import type { AxisLine, AxisType } from '../../types/axis';
import type { BeamType } from '../../types/beam';
import type { ReferenceSurface } from '../../types/reference-surface';
import {
  appendBeamQuadStripGeometry,
  DEFAULT_AXIS_3D_SURFACE_SUBDIVISION_LEVELS,
  sampleLiftedAxisSegmentOnSurface
} from './generate-axis-beam-geometry';

function appendLinesAsBeams(
  lines: AxisLine[],
  referenceSurface: ReferenceSurface,
  sampler: ReturnType<typeof createReferenceSurfaceSampler>,
  posScratch: Vector3,
  nScratch: Vector3,
  halfW: number,
  halfH: number,
  normalOffset: number,
  positions: number[],
  indices: number[],
  vertexBase: number
): number {
  for (const [a, b] of lines.map(
    ([p0, p1]) =>
      [patternUvToSurfaceGridUv(p0, referenceSurface), patternUvToSurfaceGridUv(p1, referenceSurface)] as AxisLine
  )) {
    const samples = sampleLiftedAxisSegmentOnSurface(a, b, sampler, posScratch, nScratch);
    vertexBase = appendBeamQuadStripGeometry(samples, halfW, halfH, positions, indices, vertexBase, normalOffset);
  }
  return vertexBase;
}

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

  const halfW = beam.width * 0.5;
  const halfH = beam.height * 0.5;
  const groups = getAxisStackGroups(axis, referenceSurface);

  const positions: number[] = [];
  const indices: number[] = [];
  let vertexBase = 0;

  if (beam.type === 'inline') {
    for (const { lines } of groups) {
      vertexBase = appendLinesAsBeams(
        lines,
        referenceSurface,
        sampler,
        posScratch,
        nScratch,
        halfW,
        halfH,
        0,
        positions,
        indices,
        vertexBase
      );
    }
  } else {
    for (let stackType = 0; stackType < beam.count; stackType++) {
      for (const { lines, orderInStack } of groups) {
        const normalOffset = getStackBeamNormalOffset(axis, stackType, orderInStack, beam.height, beam.up);
        vertexBase = appendLinesAsBeams(
          lines,
          referenceSurface,
          sampler,
          posScratch,
          nScratch,
          halfW,
          halfH,
          normalOffset,
          positions,
          indices,
          vertexBase
        );
      }
    }
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
