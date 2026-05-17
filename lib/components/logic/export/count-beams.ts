import { getAxisStackGroups } from '../axis/stack-group';
import type { AxisType } from '../../types/axis';
import type { BeamType } from '../../types/beam';
import type { ReferenceSurfaceBase } from '../../types/reference-surface';

/** Number of extruded beam strips along populated axis segments. */
export const countBeams = (
  axis: AxisType,
  referenceSurface: ReferenceSurfaceBase,
  beam: BeamType
): number => {
  const segments = getAxisStackGroups(axis, referenceSurface).reduce((n, g) => n + g.lines.length, 0);
  return beam.type === 'stack' ? segments * beam.count : segments;
};
