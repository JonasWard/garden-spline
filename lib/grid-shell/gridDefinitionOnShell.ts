import { Vector3 } from 'three';

import type { GridShellAxisDefinition } from '@/types/grid-axis';
import type { GridShellBase } from '@/types/grid-shell';

/** Line segment in mesh-local space (same frame as {@link makeControlGrid}). */
export type GridShellLineSegment = {
  start: Vector3;
  end: Vector3;
};

export type GridShellAxisOnShell = {
  gridShell: GridShellBase;
  axis: GridShellAxisDefinition;
  lines: GridShellLineSegment[];
};

function rectangleExtents(gridShell: GridShellBase) {
  const { n, m, dx, dy } = gridShell;
  const ox = ((n - 1) * dx) / 2;
  const oy = ((m - 1) * dy) / 2;
  const xmin = -ox;
  const xmax = (n - 1) * dx - ox;
  const ymin = -oy;
  const ymax = (m - 1) * dy - oy;
  const z = 0;
  return { xmin, xmax, ymin, ymax, z, dx, dy, n, m };
}

/**
 * Grid lines parallel to `gridAxis.localUnit` that lie in the XY footprint of the coarse grid
 * (centered rectangle matching {@link makeControlGrid}). Each segment spans the full orthogonal
 * extent of that rectangle in the grid plane. The lift axis has no extent in Z on the base grid,
 * so it yields no segments.
 */
export const getGridLinesInGridShellBase = (
  gridShell: GridShellBase,
  gridAxis: GridShellAxisDefinition,
): GridShellLineSegment[] => {
  const { xmin, xmax, ymin, ymax, z, dx, dy, n, m } = rectangleExtents(gridShell);

  const pushIfNonDegenerate = (out: GridShellLineSegment[], a: Vector3, b: Vector3) => {
    if (a.distanceToSquared(b) > 1e-24) {
      out.push({ start: a, end: b });
    }
  };

  const lines: GridShellLineSegment[] = [];

  switch (gridAxis.role) {
    case 'columns': {
      for (let j = 0; j < m; j++) {
        const y = j * dy + ymin;
        pushIfNonDegenerate(lines, new Vector3(xmin, y, z), new Vector3(xmax, y, z));
      }
      break;
    }
    case 'rows': {
      for (let i = 0; i < n; i++) {
        const x = i * dx + xmin;
        pushIfNonDegenerate(lines, new Vector3(x, ymin, z), new Vector3(x, ymax, z));
      }
      break;
    }
    case 'lift':
      break;
  }

  return lines;
};

export const gridDefinitionOnShell = (
  gridShell: GridShellBase,
  gridAxis: GridShellAxisDefinition,
): GridShellAxisOnShell => ({
  gridShell,
  axis: gridAxis,
  lines: getGridLinesInGridShellBase(gridShell, gridAxis),
});
