import type { Quad } from './types';
import { edgeKey } from './utils';
import { Vector3 } from 'three';

function buildNeighbors(vertexCount: number, faces: Quad[]) {
  const neighbors: Set<number>[] = Array.from({ length: vertexCount }, () => new Set<number>());
  const edgeUse = new Map<string, number>();

  for (const [a, b, c, d] of faces) {
    const edges: [number, number][] = [
      [a, b],
      [b, c],
      [c, d],
      [d, a]
    ];
    for (const [p, q] of edges) {
      neighbors[p]!.add(q);
      neighbors[q]!.add(p);
      const k = edgeKey(p, q);
      edgeUse.set(k, (edgeUse.get(k) ?? 0) + 1);
    }
  }

  const boundary = new Array<boolean>(vertexCount).fill(false);
  for (const [k, count] of edgeUse) {
    if (count === 1) {
      const [sa, sb] = k.split('_').map(Number) as [number, number];
      boundary[sa] = true;
      boundary[sb] = true;
    }
  }

  return { neighbors, boundary };
}

export function relaxZOnly(vertices: Vector3[], faces: Quad[], iterations: number, strength: number): Vector3[] {
  if (iterations <= 0) return vertices;
  const { neighbors, boundary } = buildNeighbors(vertices.length, faces);

  let current = vertices.map((v) => ({ ...v }));
  for (let it = 0; it < iterations; it++) {
    const next = current.map((v) => ({ ...v }));
    for (let i = 0; i < current.length; i++) {
      if (boundary[i]) continue; // keep naked edges fixed
      const neigh = neighbors[i]!;
      if (!neigh.size) continue;
      let avg = 0;
      for (const j of neigh) avg += current[j]!.z;
      avg /= neigh.size;
      next[i]!.z = current[i]!.z + strength * (avg - current[i]!.z);
    }
    current = next;
  }
  return current.map((v) => new Vector3(v.x, v.y, v.z));
}
