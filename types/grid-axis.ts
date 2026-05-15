import type { GridShellBase } from './grid-shell';

export type GridShellAxisRole = 'columns' | 'rows' | 'lift';

export type GridShellAxisDefinition = {
  role: GridShellAxisRole;
  indexParam: 'i' | 'j' | null;
  spacingKey: keyof Pick<GridShellBase, 'dx' | 'dy'> | null;
  extentKey: keyof Pick<GridShellBase, 'n' | 'm'> | null;
  localUnit: readonly [number, number, number];
};

export const GRID_SHELL_AXIS_DEFINITIONS = [
  { role: 'columns', indexParam: 'i', spacingKey: 'dx', extentKey: 'n', localUnit: [1, 0, 0] },
  { role: 'rows', indexParam: 'j', spacingKey: 'dy', extentKey: 'm', localUnit: [0, 1, 0] },
  { role: 'lift', indexParam: null, spacingKey: null, extentKey: null, localUnit: [0, 0, 1] },
] as const satisfies readonly GridShellAxisDefinition[];

const BY_ROLE = {
  columns: GRID_SHELL_AXIS_DEFINITIONS[0],
  rows: GRID_SHELL_AXIS_DEFINITIONS[1],
  lift: GRID_SHELL_AXIS_DEFINITIONS[2],
} as const satisfies Record<GridShellAxisRole, GridShellAxisDefinition>;

export function gridShellAxisDefinition(role: GridShellAxisRole): GridShellAxisDefinition {
  return BY_ROLE[role];
}

export const GRID_SHELL_COARSE_OUTLINE_AXIS_ROLES = ['columns', 'rows'] as const satisfies readonly GridShellAxisRole[];
