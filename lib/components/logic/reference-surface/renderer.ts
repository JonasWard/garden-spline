import { BufferGeometry } from 'three';

import { quadMeshGeometry } from '@/lib/grid-shell/three';
import type { Quad } from '@/lib/grid-shell/types';

import type { ReferenceSurface, ReferenceSurfaceBase } from '../../types/reference-surface';
import { catmullClark, makeGridQuads } from './catmull-clark/sample-surface';
import { getUVBox } from './base-compute';

/**
 * Triangulated quad mesh for the reference surface after Catmull–Clark (same pipeline as
 * {@link sampleReferenceSurfacePosition}). Caller must {@link BufferGeometry.dispose} when done.
 */
export const buildReferenceSurfaceMeshGeometry = (surface: ReferenceSurface, subdivisionLevels = 0): BufferGeometry => {
  const expected = (surface.n + 1) * (surface.m + 1);
  if (surface.controlPoints.length !== expected) {
    throw new Error(
      `buildReferenceSurfaceMeshGeometry: controlPoints length ${surface.controlPoints.length} !== (n+1)×(m+1) = ${expected}`
    );
  }
  const coarseFaces = makeGridQuads(surface.n + 1, surface.m + 1);
  const { vertices, faces } = catmullClark(surface.controlPoints, coarseFaces, subdivisionLevels);
  return quadMeshGeometry(vertices, faces as Quad[]);
};
