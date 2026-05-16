import { Vector2, Vector3 } from 'three';

import type { GridUv } from '../reference-surface/catmull-clark/sample-surface';

/** Catmull–Clark levels when sampling the reference surface for beam frames (matches lifted axis preview). */
export const DEFAULT_AXIS_3D_SURFACE_SUBDIVISION_LEVELS = 3;

/** UV distance between consecutive samples along one lifted axis segment. */
export const AXIS_BEAM_UV_SAMPLE_STEP = 0.05;

export type LiftedBeamSample = {
  position: Vector3;
  normal: Vector3;
};

export type SurfaceUvSampler = (uv: GridUv, position: Vector3, normal: Vector3) => void;

/**
 * Lifts one axis segment in surface `(u,v)` space onto the subdivided reference mesh.
 */
export function sampleLiftedAxisSegmentOnSurface(
  a: Vector2,
  b: Vector2,
  sampler: SurfaceUvSampler,
  positionScratch: Vector3,
  normalScratch: Vector3,
  sampleStep: number = AXIS_BEAM_UV_SAMPLE_STEP
): LiftedBeamSample[] {
  const dist = a.distanceTo(b);
  const count = Math.max(2, Math.ceil(dist / sampleStep) + 1);
  const samples: LiftedBeamSample[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const uv = a.clone().lerp(b, t);
    sampler({ u: uv.x, v: uv.y }, positionScratch, normalScratch);
    samples.push({ position: positionScratch.clone(), normal: normalScratch.clone() });
  }
  return samples;
}

function axisTangent3d(samples: LiftedBeamSample[], i: number, out: Vector3): void {
  const n = samples.length;
  const P = samples[i]!.position;
  if (i === 0) out.subVectors(samples[1]!.position, P);
  else if (i === n - 1) out.subVectors(P, samples[n - 2]!.position);
  else out.subVectors(samples[i + 1]!.position, samples[i - 1]!.position);
  out.normalize();
}

/**
 * At sample `i`, sets `Tproj` and `B` so that `N` is the surface normal, `Tproj` is the axis tangent projected onto
 * the tangent plane, and `B = N × Tproj` (width in the tangent plane).
 */
export function beamCrossSectionFrame(
  samples: LiftedBeamSample[],
  i: number,
  T: Vector3,
  Tproj: Vector3,
  B: Vector3,
  fallback: Vector3
): void {
  const N = samples[i]!.normal;
  axisTangent3d(samples, i, T);

  const nt = T.dot(N);
  Tproj.copy(T).addScaledVector(N, -nt);
  if (Tproj.lengthSq() < 1e-14) {
    if (Math.abs(N.x) < 0.9) fallback.set(1, 0, 0);
    else fallback.set(0, 1, 0);
    Tproj.copy(fallback).addScaledVector(N, -fallback.dot(N));
    if (Tproj.lengthSq() < 1e-14) Tproj.set(0, 0, 1).addScaledVector(N, -N.z).normalize();
    else Tproj.normalize();
  } else {
    Tproj.normalize();
  }

  B.crossVectors(N, Tproj);
  if (B.lengthSq() < 1e-14) {
    if (Math.abs(N.z) < 0.9) B.set(0, 0, 1).cross(N).normalize();
    else B.set(1, 0, 0).cross(N).normalize();
  } else {
    B.normalize();
  }
}

const RING_OFFSETS: [number, number][] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1]
];

/**
 * Appends vertices and indices for one open quad-strip beam along `samples`.
 * @returns next global vertex index after this strip.
 */
export function appendBeamQuadStripGeometry(
  samples: LiftedBeamSample[],
  halfWidth: number,
  halfHeight: number,
  positions: number[],
  indices: number[],
  vertexBase: number,
  /** Displaces the strip along surface normal (stack layers). */
  normalOffset = 0
): number {
  const count = samples.length;
  if (count < 2) return vertexBase;

  const T = new Vector3();
  const Tproj = new Vector3();
  const B = new Vector3();
  const corner = new Vector3();
  const fallback = new Vector3();

  for (let i = 0; i < count; i++) {
    const { position: P, normal: N } = samples[i]!;
    beamCrossSectionFrame(samples, i, T, Tproj, B, fallback);

    for (const [sx, sy] of RING_OFFSETS) {
      const wb = sx * halfWidth;
      const hn = sy * halfHeight;
      corner.copy(P).addScaledVector(B, wb).addScaledVector(N, hn + normalOffset);
      positions.push(corner.x, corner.y, corner.z);
    }
  }

  for (let i = 0; i < count - 1; i++) {
    for (let k = 0; k < 4; k++) {
      const k1 = (k + 1) % 4;
      const v0 = vertexBase + i * 4 + k;
      const v1 = vertexBase + i * 4 + k1;
      const v2 = vertexBase + (i + 1) * 4 + k1;
      const v3 = vertexBase + (i + 1) * 4 + k;
      indices.push(v0, v3, v2, v0, v2, v1);
    }
  }

  return vertexBase + count * 4;
}
