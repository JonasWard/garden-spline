import { Vector3 } from 'three';

import { catmullClark } from './subdivision';
import type { Quad } from './types';

const EPS = 1e-10;

/** UV rectangle on a coarse quad: corners map to (u0,v0)-(u1,v0)-(u1,v1)-(u0,v1) matching quad winding [a,b,c,d]. */
export type FaceUvDomain = {
  coarseFaceIndex: number;
  u0: number;
  u1: number;
  v0: number;
  v1: number;
};

/**
 * One Catmull–Clark split per face → four children, same order as `subdivision.ts` newFaces pushes.
 */
export function subdivideFaceUvDomains(domains: FaceUvDomain[]): FaceUvDomain[] {
  const next: FaceUvDomain[] = [];
  for (const d of domains) {
    const um = (d.u0 + d.u1) * 0.5;
    const vm = (d.v0 + d.v1) * 0.5;
    const cf = d.coarseFaceIndex;
    next.push({ coarseFaceIndex: cf, u0: d.u0, u1: um, v0: d.v0, v1: vm });
    next.push({ coarseFaceIndex: cf, u0: um, u1: d.u1, v0: d.v0, v1: vm });
    next.push({ coarseFaceIndex: cf, u0: um, u1: d.u1, v0: vm, v1: d.v1 });
    next.push({ coarseFaceIndex: cf, u0: d.u0, u1: um, v0: vm, v1: d.v1 });
  }
  return next;
}

export function buildFaceUvDomains(numCoarseFaces: number, levels: number): FaceUvDomain[] {
  let dom: FaceUvDomain[] = Array.from({ length: numCoarseFaces }, (_, i) => ({
    coarseFaceIndex: i,
    u0: 0,
    u1: 1,
    v0: 0,
    v1: 1,
  }));
  for (let L = 0; L < levels; L++) dom = subdivideFaceUvDomains(dom);
  return dom;
}

function bilinearPosition(uu: number, vv: number, a: Vector3, b: Vector3, c: Vector3, d: Vector3, out: Vector3): void {
  const omu = 1 - uu;
  const omv = 1 - vv;
  out.set(
    omu * omv * a.x + uu * omv * b.x + uu * vv * c.x + omu * vv * d.x,
    omu * omv * a.y + uu * omv * b.y + uu * vv * c.y + omu * vv * d.y,
    omu * omv * a.z + uu * omv * b.z + uu * vv * c.z + omu * vv * d.z
  );
}

/** ∂S/∂uu for bilinear quad with corners a,b,c,d ~ (0,0),(1,0),(1,1),(0,1). */
function bilinearTangentU(uu: number, vv: number, a: Vector3, b: Vector3, c: Vector3, d: Vector3, out: Vector3): void {
  const omv = 1 - vv;
  const vv_ = vv;
  out.set(
    -omv * a.x + omv * b.x + vv_ * c.x - vv_ * d.x,
    -omv * a.y + omv * b.y + vv_ * c.y - vv_ * d.y,
    -omv * a.z + omv * b.z + vv_ * c.z - vv_ * d.z
  );
}

/** ∂S/∂vv */
function bilinearTangentV(uu: number, vv: number, a: Vector3, b: Vector3, c: Vector3, d: Vector3, out: Vector3): void {
  const omu = 1 - uu;
  const uu_ = uu;
  out.set(
    -omu * a.x - uu_ * b.x + uu_ * c.x + omu * d.x,
    -omu * a.y - uu_ * b.y + uu_ * c.y + omu * d.y,
    -omu * a.z - uu_ * b.z + uu_ * c.z + omu * d.z
  );
}

function findFineFaceForUv(
  domains: FaceUvDomain[],
  coarseFaceIndex: number,
  u: number,
  v: number
): number {
  for (let i = 0; i < domains.length; i++) {
    const d = domains[i]!;
    if (d.coarseFaceIndex !== coarseFaceIndex) continue;
    if (u + EPS < d.u0 || u - EPS > d.u1 || v + EPS < d.v0 || v - EPS > d.v1) continue;
    return i;
  }
  return -1;
}

export type CatmullClarkUvEvalResult = {
  position: Vector3;
  normal: Vector3;
};

/**
 * Bilinear evaluation on an already refined quad mesh (e.g. after {@link catmullClark} + relaxation).
 * `domains` must come from {@link buildFaceUvDomains} with the same coarse face count and subdivision levels.
 */
export function evaluateRefinedMeshUv(
  vertices: Vector3[],
  faces: Quad[],
  domains: FaceUvDomain[],
  coarseFaceIndex: number,
  u: number,
  v: number,
  target?: CatmullClarkUvEvalResult
): CatmullClarkUvEvalResult | null {
  if (faces.length !== domains.length) return null;
  if (u < -EPS || u > 1 + EPS || v < -EPS || v > 1 + EPS) return null;

  const fi = findFineFaceForUv(domains, coarseFaceIndex, u, v);
  if (fi < 0) return null;

  const d = domains[fi]!;
  const du = d.u1 - d.u0;
  const dv = d.v1 - d.v0;
  const uu = du > EPS ? Math.min(1, Math.max(0, (u - d.u0) / du)) : 0.5;
  const vv = dv > EPS ? Math.min(1, Math.max(0, (v - d.v0) / dv)) : 0.5;

  const [ia, ib, ic, id] = faces[fi]!;
  const va = vertices[ia]!;
  const vb = vertices[ib]!;
  const vc = vertices[ic]!;
  const vd = vertices[id]!;

  const position = target?.position ?? new Vector3();
  const normal = target?.normal ?? new Vector3();
  const tu = new Vector3();
  const tv = new Vector3();

  bilinearPosition(uu, vv, va, vb, vc, vd, position);
  bilinearTangentU(uu, vv, va, vb, vc, vd, tu);
  bilinearTangentV(uu, vv, va, vb, vc, vd, tv);
  tu.multiplyScalar(1 / Math.max(du, EPS));
  tv.multiplyScalar(1 / Math.max(dv, EPS));
  normal.crossVectors(tu, tv);
  if (normal.lengthSq() < EPS * EPS) {
    normal.set(0, 0, 1);
  } else {
    normal.normalize();
  }

  return { position, normal };
}

/**
 * Evaluates the **same polyhedral surface** as {@link catmullClark}: after `levels` refinements,
 * each fine quad is treated as a bilinear patch in local [0,1]² with winding matching `makeGridQuads`
 * ([a,b,c,d] → bottom edge a–b, v toward d).
 *
 * This matches finite-subdivision geometry (as triangulated for display), not the analytic Catmull–Clark limit.
 */
export function evaluateCatmullClarkUv(
  controlVertices: Vector3[],
  coarseFaces: Quad[],
  levels: number,
  coarseFaceIndex: number,
  u: number,
  v: number,
  target?: CatmullClarkUvEvalResult
): CatmullClarkUvEvalResult {
  if (coarseFaceIndex < 0 || coarseFaceIndex >= coarseFaces.length) {
    throw new RangeError(`coarseFaceIndex ${coarseFaceIndex} out of range (0..${coarseFaces.length - 1})`);
  }
  if (u < -EPS || u > 1 + EPS || v < -EPS || v > 1 + EPS) {
    throw new RangeError(`UV (${u},${v}) must lie in [0,1]²`);
  }

  const { vertices, faces } = catmullClark(controlVertices, coarseFaces, levels);
  const domains = buildFaceUvDomains(coarseFaces.length, levels);

  const result = evaluateRefinedMeshUv(vertices, faces, domains, coarseFaceIndex, u, v, target);
  if (!result) {
    throw new Error(`UV (${u},${v}) not found on coarse face ${coarseFaceIndex}`);
  }
  return result;
}
