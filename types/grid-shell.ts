/**
 * Coarse control grid parameters (layout before subdivision / relaxation).
 */
export type GridShellBase = {
  /** Number of columns (control points along local X). */
  n: number;
  /** Number of rows (control points along local Y). */
  m: number;
  /** Spacing between columns (local X). */
  dx: number;
  /** Spacing between rows (local Y). */
  dy: number;
};
