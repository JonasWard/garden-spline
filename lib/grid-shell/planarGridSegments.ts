/** Grid drawn on the world XZ plane at y = 0 (Three.js: Y-up, horizontal floor). */

export type GridShellType = 'triangular' | 'hex' | 'quad' | 'octagonal';

const SQRT3 = Math.sqrt(3);
const SQRT2 = Math.SQRT2;

/**
 * Append segment [x1,0,z1]-[x2,0,z2] clipped from infinite line a*x + b*z = c (world XZ)
 * inside the axis-aligned square centered at (cx,cz) with half-edge R.
 */
function clipLineToSquare(a: number, b: number, c: number, cx: number, cz: number, R: number, out: number[]): void {
  const cRel = c - a * cx - b * cz;
  const pts: [number, number][] = [];

  const addIfInside = (xr: number, zr: number) => {
    if (Math.abs(xr) <= R + 1e-8 && Math.abs(zr) <= R + 1e-8) pts.push([xr, zr]);
  };

  if (Math.abs(b) < 1e-12) {
    if (Math.abs(a) < 1e-12) return;
    const x = cRel / a;
    addIfInside(x, R);
    addIfInside(x, -R);
  } else if (Math.abs(a) < 1e-12) {
    const z = cRel / b;
    addIfInside(R, z);
    addIfInside(-R, z);
  } else {
    for (const x of [-R, R]) addIfInside(x, (cRel - a * x) / b);
    for (const z of [-R, R]) addIfInside((cRel - b * z) / a, z);
  }

  if (pts.length < 2) return;

  const uniq: [number, number][] = [];
  for (const p of pts) {
    if (!uniq.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-5)) uniq.push(p);
  }
  if (uniq.length < 2) return;

  let bestI = 0;
  let bestJ = 1;
  let bestD = -1;
  for (let i = 0; i < uniq.length; i++) {
    for (let j = i + 1; j < uniq.length; j++) {
      const d = Math.hypot(uniq[i]![0] - uniq[j]![0], uniq[i]![1] - uniq[j]![1]);
      if (d > bestD) {
        bestD = d;
        bestI = i;
        bestJ = j;
      }
    }
  }
  const p0 = uniq[bestI]!;
  const p1 = uniq[bestJ]!;
  out.push(p0[0] + cx, 0, p0[1] + cz, p1[0] + cx, 0, p1[1] + cz);
}

const TRI_NORMALS: [number, number][] = [
  [1, 0],
  [-0.5, SQRT3 / 2],
  [-0.5, -SQRT3 / 2],
];

function pushTriangularFamilies(
  G: number,
  R: number,
  cx: number,
  cz: number,
  out: number[],
  hexSkipAlternateParallels: boolean
) {
  const K = Math.ceil(R / G) + 3;
  for (let fi = 0; fi < 3; fi++) {
    const [nx, nz] = TRI_NORMALS[fi]!;
    for (let k = -K; k <= K; k++) {
      if (hexSkipAlternateParallels) {
        const skip = fi === 0 ? k % 2 !== 1 : k % 2 !== 0;
        if (skip) continue;
      }
      const c = nx * cx + nz * cz + k * G;
      clipLineToSquare(nx, nz, c, cx, cz, R, out);
    }
  }
}

/**
 * Quad spacing: three consecutive parallels A–B–C with |AC| = globalSize.
 * |AB| : |BC| = relative : 1  →  AB = relative·globalSize/(1+relative), BC = globalSize/(1+relative).
 */
function pushQuadAlternatingSpacing(
  globalSize: number,
  relative: number,
  R: number,
  cx: number,
  cz: number,
  out: number[]
) {
  const G = Math.max(1e-9, globalSize);
  const rel = Math.max(1e-6, relative);
  const ab = (rel * G) / (1 + rel);
  const bc = G / (1 + rel);
  const period = ab + bc;

  const coordsAlongAxis = (center: number): number[] => {
    const lo = center - R;
    const hi = center + R;
    const xs: number[] = [];
    const nMin = Math.floor((lo - center - ab - 1) / period) - 1;
    const nMax = Math.ceil((hi - center) / period) + 1;
    for (let n = nMin; n <= nMax; n++) {
      for (const off of [0, ab]) {
        const p = center + n * period + off;
        if (p >= lo - 1e-9 && p <= hi + 1e-9) xs.push(p);
      }
    }
    xs.sort((a, b) => a - b);
    return xs;
  };

  for (const x of coordsAlongAxis(cx)) clipLineToSquare(1, 0, x, cx, cz, R, out);
  for (const z of coordsAlongAxis(cz)) clipLineToSquare(0, 1, z, cx, cz, R, out);
}

/** Second lattice for octagonal: uniform spacing √2·globalSize on diagonal families. */
function pushOctagonalSecondGrid(globalSize: number, cx: number, cz: number, R: number, out: number[]) {
  const G = Math.max(1e-9, globalSize);
  const step = G * SQRT2;
  const K = Math.ceil((2 * R) / step) + 3;
  const baseSum = cx + cz;
  const baseDiff = cx - cz;
  for (let k = -K; k <= K; k++) {
    clipLineToSquare(1, 1, baseSum + k * step, cx, cz, R, out);
    clipLineToSquare(1, -1, baseDiff + k * step, cx, cz, R, out);
  }
}

/**
 * Build line segments for grid preview on XZ at y=0.
 * @param centerX/centerZ — pattern origin on world XZ
 */
export function buildPlanarGridSegments(
  type: GridShellType,
  globalSize: number,
  relative: number,
  halfExtent: number,
  centerX = 0,
  centerZ = 0
): Float32Array {
  const G = Math.max(1e-6, globalSize);
  const r = Math.max(0.05, relative);
  const R = Math.max(G * 3, halfExtent);
  const cx = centerX;
  const cz = centerZ;
  const out: number[] = [];

  switch (type) {
    case 'triangular':
      pushTriangularFamilies(G, R, cx, cz, out, false);
      break;
    case 'hex':
      pushTriangularFamilies(G, R, cx, cz, out, true);
      break;
    case 'quad':
      pushQuadAlternatingSpacing(G, r, R, cx, cz, out);
      break;
    case 'octagonal': {
      pushQuadAlternatingSpacing(G, r, R, cx, cz, out);
      pushOctagonalSecondGrid(G, cx, cz, R, out);
      break;
    }
    default:
      break;
  }

  return new Float32Array(out);
}
