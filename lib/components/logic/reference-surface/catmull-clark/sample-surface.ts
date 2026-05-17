import { Vector3 } from 'three';

import type { ReferenceSurface } from '../../../types/reference-surface';

/** Quad mesh face: corner indices `a,b,c,d` with winding `(0,0)→(1,0)→(1,1)→(0,1)` in local UV. */
export type Quad = [number, number, number, number];

export type GridUv = {
  /**
   * Column-wise parameter in `[0, surface.n]` (continuous index; there are `surface.n + 1` control columns).
   */
  u: number;
  /**
   * Row-wise parameter in `[0, surface.m]` (continuous index; there are `surface.m + 1` control rows).
   */
  v: number;
};

export type SampleReferenceSurfaceOptions = {
  /** Catmull–Clark subdivision levels applied before bilinear sampling. @default 0 */
  subdivisionLevels?: number;
};

const EPS = 1e-10;

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

function gridIndex(i: number, j: number, n: number): number {
  return j * n + i;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

/** Number of vertices along first index `i` (columns); along second `j` (rows). Must be ≥ 2 to form quads. */
export function makeGridQuads(vertexCols: number, vertexRows: number): Quad[] {
  const faces: Quad[] = [];
  for (let j = 0; j < vertexRows - 1; j++) {
    for (let i = 0; i < vertexCols - 1; i++) {
      const a = gridIndex(i, j, vertexCols);
      const b = gridIndex(i + 1, j, vertexCols);
      const c = gridIndex(i + 1, j + 1, vertexCols);
      const d = gridIndex(i, j + 1, vertexCols);
      faces.push([a, b, c, d]);
    }
  }
  return faces;
}

/**
 * One Catmull–Clark subdivision step for a pure quad mesh (same connectivity rules as the grid-shell editor:
 * interior vertices use the standard CC mask on **Z** only; boundary vertices keep X/Y and apply a **Z**-only
 * boundary / crease relaxation; edge points use face-point averages or midpoints on naked edges).
 */
export function catmullClarkSubdivide(vertices: Vector3[], faces: Quad[]): { vertices: Vector3[]; faces: Quad[] } {
  const v = vertices;
  const f = faces;

  const facePointIndex = new Map<number, number>();
  const edgePointIndex = new Map<string, number>();

  const vertexFaces: number[][] = Array.from({ length: v.length }, () => []);
  const vertexEdges: Set<string>[] = Array.from({ length: v.length }, () => new Set());
  const edgeFaces = new Map<string, number[]>();

  for (let fi = 0; fi < f.length; fi++) {
    const [a, b, c, d] = f[fi]!;
    vertexFaces[a]!.push(fi);
    vertexFaces[b]!.push(fi);
    vertexFaces[c]!.push(fi);
    vertexFaces[d]!.push(fi);

    const edges: [number, number][] = [
      [a, b],
      [b, c],
      [c, d],
      [d, a]
    ];
    for (const [p, q] of edges) {
      const k = edgeKey(p, q);
      vertexEdges[p]!.add(k);
      vertexEdges[q]!.add(k);
      const arr = edgeFaces.get(k) ?? [];
      arr.push(fi);
      edgeFaces.set(k, arr);
    }
  }

  const isBoundaryVertex = new Array<boolean>(v.length).fill(false);
  const boundaryNeighbors: number[][] = Array.from({ length: v.length }, () => []);

  for (const [k, fis] of edgeFaces) {
    if (fis.length === 1) {
      const [sa, sb] = k.split('_').map(Number) as [number, number];
      isBoundaryVertex[sa] = true;
      isBoundaryVertex[sb] = true;
      boundaryNeighbors[sa]!.push(sb);
      boundaryNeighbors[sb]!.push(sa);
    }
  }

  const newVertices: Vector3[] = new Array(v.length);

  const facePoints: Vector3[] = new Array(f.length);
  for (let fi = 0; fi < f.length; fi++) {
    const [a, b, c, d] = f[fi]!;
    const A = v[a]!;
    const B = v[b]!;
    const C = v[c]!;
    const D = v[d]!;
    facePoints[fi] = new Vector3((A.x + B.x + C.x + D.x) / 4, (A.y + B.y + C.y + D.y) / 4, (A.z + B.z + C.z + D.z) / 4);
  }

  for (let vi = 0; vi < v.length; vi++) {
    const P = v[vi]!;
    if (isBoundaryVertex[vi]) {
      const neigh = boundaryNeighbors[vi]!;
      if (neigh.length >= 2) {
        const n0 = neigh[0]!;
        const n1 = neigh[1]!;
        newVertices[vi] = new Vector3(P.x, P.y, (6 * P.z + v[n0]!.z + v[n1]!.z) / 8);
      } else if (neigh.length === 1) {
        const n0 = neigh[0]!;
        newVertices[vi] = new Vector3(P.x, P.y, (3 * P.z + v[n0]!.z) / 4);
      } else {
        newVertices[vi] = new Vector3(P.x, P.y, P.z);
      }
      continue;
    }

    const facesIdx = vertexFaces[vi]!;
    const n = facesIdx.length;
    if (n === 0) {
      newVertices[vi] = new Vector3(P.x, P.y, P.z);
      continue;
    }

    let Fz = 0;
    for (const fi of facesIdx) Fz += facePoints[fi]!.z;
    Fz /= n;

    let Ez = 0;
    let eCount = 0;
    for (const ek of vertexEdges[vi]!) {
      const [sa, sb] = ek.split('_').map(Number) as [number, number];
      const other = sa === vi ? sb : sa;
      Ez += (P.z + v[other]!.z) / 2;
      eCount++;
    }
    Ez = eCount ? Ez / eCount : P.z;

    newVertices[vi] = new Vector3(P.x, P.y, (Fz + 2 * Ez + (n - 3) * P.z) / n);
  }

  for (const [k, fis] of edgeFaces) {
    const [sa, sb] = k.split('_').map(Number) as [number, number];
    const A = v[sa]!;
    const B = v[sb]!;

    let ep: Vector3;
    if (fis.length === 2) {
      const f0 = facePoints[fis[0]!]!;
      const f1 = facePoints[fis[1]!]!;
      ep = new Vector3((A.x + B.x + f0.x + f1.x) / 4, (A.y + B.y + f0.y + f1.y) / 4, (A.z + B.z + f0.z + f1.z) / 4);
    } else {
      ep = new Vector3((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
    }

    edgePointIndex.set(k, newVertices.length);
    newVertices.push(ep);
  }

  for (let fi = 0; fi < f.length; fi++) {
    facePointIndex.set(fi, newVertices.length);
    newVertices.push(facePoints[fi]!);
  }

  const newFaces: Quad[] = [];
  for (let fi = 0; fi < f.length; fi++) {
    const [a, b, c, d] = f[fi]!;
    const eAB = edgePointIndex.get(edgeKey(a, b))!;
    const eBC = edgePointIndex.get(edgeKey(b, c))!;
    const eCD = edgePointIndex.get(edgeKey(c, d))!;
    const eDA = edgePointIndex.get(edgeKey(d, a))!;
    const fp = facePointIndex.get(fi)!;

    newFaces.push([a, eAB, fp, eDA]);
    newFaces.push([eAB, b, eBC, fp]);
    newFaces.push([fp, eBC, c, eCD]);
    newFaces.push([eDA, fp, eCD, d]);
  }

  return { vertices: newVertices, faces: newFaces };
}

/** Applies {@link catmullClarkSubdivide} `levels` times. */
export function catmullClark(
  vertices: Vector3[],
  faces: Quad[],
  levels: number
): { vertices: Vector3[]; faces: Quad[] } {
  let verts = vertices;
  let quads = faces;
  for (let L = 0; L < levels; L++) {
    const next = catmullClarkSubdivide(verts, quads);
    verts = next.vertices;
    quads = next.faces;
  }
  return { vertices: verts, faces: quads };
}

export type FaceUvDomain = {
  coarseFaceIndex: number;
  u0: number;
  u1: number;
  v0: number;
  v1: number;
};

function subdivideFaceUvDomains(domains: FaceUvDomain[]): FaceUvDomain[] {
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

function buildFaceUvDomains(numCoarseFaces: number, levels: number): FaceUvDomain[] {
  let dom: FaceUvDomain[] = Array.from({ length: numCoarseFaces }, (_, i) => ({
    coarseFaceIndex: i,
    u0: 0,
    u1: 1,
    v0: 0,
    v1: 1
  }));
  for (let L = 0; L < levels; L++) dom = subdivideFaceUvDomains(dom);
  return dom;
}

function findFineFaceForUv(domains: FaceUvDomain[], coarseFaceIndex: number, u: number, v: number): number {
  for (let i = 0; i < domains.length; i++) {
    const d = domains[i]!;
    if (d.coarseFaceIndex !== coarseFaceIndex) continue;
    if (u + EPS < d.u0 || u - EPS > d.u1 || v + EPS < d.v0 || v - EPS > d.v1) continue;
    return i;
  }
  return -1;
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

function bilinearTangentU(uu: number, vv: number, a: Vector3, b: Vector3, c: Vector3, d: Vector3, out: Vector3): void {
  const omv = 1 - vv;
  const vv_ = vv;
  out.set(
    -omv * a.x + omv * b.x + vv_ * c.x - vv_ * d.x,
    -omv * a.y + omv * b.y + vv_ * c.y - vv_ * d.y,
    -omv * a.z + omv * b.z + vv_ * c.z - vv_ * d.z
  );
}

function bilinearTangentV(uu: number, vv: number, a: Vector3, b: Vector3, c: Vector3, d: Vector3, out: Vector3): void {
  const omu = 1 - uu;
  const uu_ = uu;
  out.set(
    -omu * a.x - uu_ * b.x + uu_ * c.x + omu * d.x,
    -omu * a.y - uu_ * b.y + uu_ * c.y + omu * d.y,
    -omu * a.z - uu_ * b.z + uu_ * c.z + omu * d.z
  );
}

function assertSurface(surface: ReferenceSurface): void {
  const expected = (surface.n + 1) * (surface.m + 1);
  if (surface.controlPoints.length !== expected) {
    throw new Error(
      `ReferenceSurface.controlPoints length ${surface.controlPoints.length} does not match (n+1)×(m+1) = ${expected}`
    );
  }
  if (surface.n < 1 || surface.m < 1) {
    throw new Error('ReferenceSurface requires n ≥ 1 and m ≥ 1 (at least a 2×2 control net for one quad)');
  }
}

/**
 * Maps continuous grid indices `(u,v)` in `[0, n] × [0, m]` to a coarse quad index and local `(u',v')` in `[0,1]²`,
 * where `surface` has `(n+1)×(m+1)` control vertices and `n×m` coarse quads.
 */
export function gridUvToCoarseFaceLocal(
  n: number,
  m: number,
  u: number,
  v: number
): {
  coarseFaceIndex: number;
  uLocal: number;
  vLocal: number;
} {
  const uc = clamp(u, 0, n);
  const vc = clamp(v, 0, m);
  const i0 = Math.min(Math.floor(uc), Math.max(0, n - 1));
  const j0 = Math.min(Math.floor(vc), Math.max(0, m - 1));
  const uLocal = clamp(uc - i0, 0, 1);
  const vLocal = clamp(vc - j0, 0, 1);
  const coarseFaceIndex = j0 * n + i0;
  return { coarseFaceIndex, uLocal, vLocal };
}

function prepareMesh(surface: ReferenceSurface, levels: number) {
  return subdivideReferenceSurfaceMesh(surface, levels);
}

/** Catmull–Clark refined mesh with per-face coarse UV domains (for sampling and edge viz). */
export function subdivideReferenceSurfaceMesh(
  surface: ReferenceSurface,
  levels: number
): { vertices: Vector3[]; faces: Quad[]; domains: FaceUvDomain[] } {
  assertSurface(surface);
  const coarseFaces = makeGridQuads(surface.n + 1, surface.m + 1);
  const { vertices, faces } = catmullClark(surface.controlPoints, coarseFaces, levels);
  const domains = buildFaceUvDomains(coarseFaces.length, levels);
  return { vertices, faces, domains };
}

function evaluateOnRefinedMesh(
  vertices: Vector3[],
  faces: Quad[],
  domains: FaceUvDomain[],
  coarseFaceIndex: number,
  u: number,
  v: number,
  position: Vector3,
  normal: Vector3
): void {
  if (faces.length !== domains.length) {
    throw new Error('faces/domains length mismatch');
  }
  const fi = findFineFaceForUv(domains, coarseFaceIndex, u, v);
  if (fi < 0) {
    throw new Error(`UV (${u},${v}) not found on coarse face ${coarseFaceIndex}`);
  }

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
}

export function sampleReferenceSurfacePosition(
  surface: ReferenceSurface,
  uv: GridUv,
  options?: SampleReferenceSurfaceOptions,
  target?: Vector3
): Vector3 {
  const levels = options?.subdivisionLevels ?? 0;
  const { coarseFaceIndex, uLocal, vLocal } = gridUvToCoarseFaceLocal(surface.n, surface.m, uv.u, uv.v);
  const { vertices, faces, domains } = prepareMesh(surface, levels);
  const out = target ?? new Vector3();
  const tmpN = new Vector3();
  evaluateOnRefinedMesh(vertices, faces, domains, coarseFaceIndex, uLocal, vLocal, out, tmpN);
  return out;
}

/** Reuses one subdivided mesh for many UV queries (avoids repeated {@link prepareMesh} per sample). */
export function createReferenceSurfaceSampler(
  surface: ReferenceSurface,
  options?: SampleReferenceSurfaceOptions
): (uv: GridUv, position: Vector3, normal: Vector3) => void {
  const levels = options?.subdivisionLevels ?? 0;
  const { vertices, faces, domains } = prepareMesh(surface, levels);
  return (uv: GridUv, position: Vector3, normal: Vector3) => {
    const { coarseFaceIndex, uLocal, vLocal } = gridUvToCoarseFaceLocal(surface.n, surface.m, uv.u, uv.v);
    evaluateOnRefinedMesh(vertices, faces, domains, coarseFaceIndex, uLocal, vLocal, position, normal);
  };
}

export function sampleReferenceSurfaceNormal(
  surface: ReferenceSurface,
  uv: GridUv,
  options?: SampleReferenceSurfaceOptions,
  target?: Vector3
): Vector3 {
  const levels = options?.subdivisionLevels ?? 0;
  const { coarseFaceIndex, uLocal, vLocal } = gridUvToCoarseFaceLocal(surface.n, surface.m, uv.u, uv.v);
  const { vertices, faces, domains } = prepareMesh(surface, levels);
  const pos = new Vector3();
  const out = target ?? new Vector3();
  evaluateOnRefinedMesh(vertices, faces, domains, coarseFaceIndex, uLocal, vLocal, pos, out);
  return out;
}

export type ReferenceSurfaceSample = {
  position: Vector3;
  normal: Vector3;
};

export function sampleReferenceSurface(
  surface: ReferenceSurface,
  uv: GridUv,
  options?: SampleReferenceSurfaceOptions,
  target?: Partial<ReferenceSurfaceSample>
): ReferenceSurfaceSample {
  const levels = options?.subdivisionLevels ?? 0;
  const { coarseFaceIndex, uLocal, vLocal } = gridUvToCoarseFaceLocal(surface.n, surface.m, uv.u, uv.v);
  const { vertices, faces, domains } = prepareMesh(surface, levels);
  const position = target?.position ?? new Vector3();
  const normal = target?.normal ?? new Vector3();
  evaluateOnRefinedMesh(vertices, faces, domains, coarseFaceIndex, uLocal, vLocal, position, normal);
  return { position, normal };
}
