import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';

import { quadMeshGeometry } from '@/lib/grid-shell/three';
import type { Quad } from '@/lib/grid-shell/types';

import type { ReferenceSurface } from '../../types/reference-surface';
import { catmullClark, createReferenceSurfaceSampler, makeGridQuads } from './catmull-clark/sample-surface';

function pushSegment(positions: number[], a: Vector3, b: Vector3) {
  positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
}

function lineGeometryFromSegments(positions: number[]): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

function assertControlPointCount(surface: ReferenceSurface) {
  const expected = (surface.n + 1) * (surface.m + 1);
  if (surface.controlPoints.length !== expected) {
    throw new Error(
      `reference surface: controlPoints length ${surface.controlPoints.length} !== (n+1)×(m+1) = ${expected}`
    );
  }
}

function edgeSampleCount(subdivisionLevels: number): number {
  return Math.max(4, (1 << subdivisionLevels) * 2);
}

/**
 * Sample one coarse-grid edge in continuous `(u,v)` and append line segments.
 * `sampler` evaluates the subdivided reference surface at grid UV.
 */
function sampleCoarseGridEdge(
  sampler: (uv: { u: number; v: number }, position: Vector3, normal: Vector3) => void,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  steps: number,
  positions: number[],
  pos: Vector3,
  nor: Vector3
) {
  let prev: Vector3 | null = null;
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    sampler({ u: u0 + (u1 - u0) * t, v: v0 + (v1 - v0) * t }, pos, nor);
    if (prev) pushSegment(positions, prev, pos);
    prev = pos.clone();
  }
}

/**
 * All unique edges of the coarse `n×m` face grid, sampled on the subdivided surface.
 */
function segmentsFromCoarseFaceUvEdges(surface: ReferenceSurface, subdivisionLevels: number): number[] {
  const sampler = createReferenceSurfaceSampler(surface, { subdivisionLevels });
  const steps = edgeSampleCount(subdivisionLevels);
  const positions: number[] = [];
  const pos = new Vector3();
  const nor = new Vector3();
  const { n, m } = surface;

  for (let j = 0; j <= m; j++) {
    for (let i = 0; i < n; i++) {
      sampleCoarseGridEdge(sampler, i, j, i + 1, j, steps, positions, pos, nor);
    }
  }
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j < m; j++) {
      sampleCoarseGridEdge(sampler, i, j, i, j + 1, steps, positions, pos, nor);
    }
  }

  return positions;
}

/**
 * Triangulated quad mesh for the reference surface after Catmull–Clark (same pipeline as
 * {@link sampleReferenceSurfacePosition}). Caller must {@link BufferGeometry.dispose} when done.
 */
export const buildReferenceSurfaceMeshGeometry = (surface: ReferenceSurface, subdivisionLevels = 0): BufferGeometry => {
  assertControlPointCount(surface);
  const coarseFaces = makeGridQuads(surface.n + 1, surface.m + 1);
  const { vertices, faces } = catmullClark(surface.controlPoints, coarseFaces, subdivisionLevels);
  return quadMeshGeometry(vertices, faces as Quad[]);
};

/** Default subdivision depth for reference-surface display (mesh + divided-face edges). */
export const DEFAULT_REFERENCE_SURFACE_SUBDIVISION_LEVELS = 5;

/**
 * Line segments along each original coarse-face edge, sampled on the subdivided UV surface.
 * Caller must {@link BufferGeometry.dispose} when done.
 */
export const buildDividedFaceEdgeGeometries = (
  surface: ReferenceSurface,
  subdivisionLevels = DEFAULT_REFERENCE_SURFACE_SUBDIVISION_LEVELS
): BufferGeometry => {
  assertControlPointCount(surface);
  return lineGeometryFromSegments(segmentsFromCoarseFaceUvEdges(surface, subdivisionLevels));
};
