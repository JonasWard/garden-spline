import { Box3 } from 'three';

import type { BeamType } from '../../types/beam';
import type { ReferenceSurface } from '../../types/reference-surface';
import { computeConfiguratorBoundaryBox } from './configurator-boundary-bounds';

/** Place ground contact slightly below the lowest boundary sample. */
const Z_BOTTOM_OFFSET = 0;

export type GeometryGroundLayout = {
  /** Lowest boundary height in local space (Z-up), minus offset. */
  zBottom: number;
};

export const geometryGroundLayoutFromBox = (box: Box3): GeometryGroundLayout => ({
  zBottom: box.min.z - Z_BOTTOM_OFFSET
});

/**
 * Ground plane bottom elevation from configurator boundary geometry.
 */
export const computeGeometryGroundLayout = (surface: ReferenceSurface, beam: BeamType): GeometryGroundLayout =>
  geometryGroundLayoutFromBox(computeConfiguratorBoundaryBox(surface, beam));
