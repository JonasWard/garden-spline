import type { Quad } from './types';
import { edgeKey } from './utils';
import { Vector3 } from 'three';

export function catmullClark(vertices: Vector3[], faces: Quad[], levels: number) {
  let v = vertices;
  let f = faces;

  for (let level = 0; level < levels; level++) {
    const facePointIndex = new Map<number, number>();
    const edgePointIndex = new Map<string, number>();

    // Build adjacency
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

    // New vertex array starts with repositioned old vertices
    const newVertices: Vector3[] = new Array(v.length);

    const facePoints: Vector3[] = new Array(f.length);
    for (let fi = 0; fi < f.length; fi++) {
      const [a, b, c, d] = f[fi]!;
      const A = v[a]!;
      const B = v[b]!;
      const C = v[c]!;
      const D = v[d]!;
      const fp: Vector3 = new Vector3(
        (A.x + B.x + C.x + D.x) / 4,
        (A.y + B.y + C.y + D.y) / 4,
        (A.z + B.z + C.z + D.z) / 4
      );
      facePoints[fi] = fp;
    }

    // Reposition original vertices
    for (let vi = 0; vi < v.length; vi++) {
      const P = v[vi]!;
      if (isBoundaryVertex[vi]) {
        // Boundary rule: keep X/Y, smooth Z using the two boundary neighbors (if present)
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

      // F = average of adjacent face points
      let Fz = 0;
      for (const fi of facesIdx) Fz += facePoints[fi]!.z;
      Fz /= n;

      // E = average of midpoints of incident edges
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

    // Edge points
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
        // Naked edge: midpoint
        ep = new Vector3((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
      }

      edgePointIndex.set(k, newVertices.length);
      newVertices.push(ep);
    }

    // Face points appended
    for (let fi = 0; fi < f.length; fi++) {
      facePointIndex.set(fi, newVertices.length);
      newVertices.push(facePoints[fi]!);
    }

    // New faces (each quad -> 4 quads)
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

    v = newVertices;
    f = newFaces;
  }

  return { vertices: v, faces: f };
}
