import { Vector3 } from 'three';
import type { Quad } from './types';
import { gridIndex } from './utils';

export function makeControlGrid(n: number, m: number, dx: number, dy: number): Vector3[] {
  const pts: Vector3[] = [];
  const ox = ((n - 1) * dx) / 2;
  const oy = ((m - 1) * dy) / 2;
  for (let j = 0; j < m; j++) {
    for (let i = 0; i < n; i++) {
      pts.push(new Vector3(i * dx - ox, j * dy - oy, 0));
    }
  }
  return pts;
}

export function makeGridQuads(n: number, m: number): Quad[] {
  const faces: Quad[] = [];
  for (let j = 0; j < m - 1; j++) {
    for (let i = 0; i < n - 1; i++) {
      const a = gridIndex(i, j, n);
      const b = gridIndex(i + 1, j, n);
      const c = gridIndex(i + 1, j + 1, n);
      const d = gridIndex(i, j + 1, n);
      faces.push([a, b, c, d]);
    }
  }
  return faces;
}
