import { Box3 } from 'three';

import {
  computeDividedFaceEdgesBoundingBox,
  DEFAULT_REFERENCE_SURFACE_SUBDIVISION_LEVELS
} from '../reference-surface/renderer';
import type { BeamType } from '../../types/beam';
import type { ReferenceSurface } from '../../types/reference-surface';

/** Isotropic padding around divided-face-edge bounds for beam extent. */
export const expandBoundingBoxForBeam = (box: Box3, beam: BeamType): void => {
  if (beam.type === 'stack' && beam.up) {
    box.expandByScalar(beam.count * beam.height);
    return;
  }
  box.expandByScalar(beam.height * 0.5);
};

/**
 * Content boundary in local Z-up space: divided face edges plus beam padding
 * (half height for inline; `count × height` for stack, including stack-up from surface).
 */
export const computeConfiguratorBoundaryBox = (
  surface: ReferenceSurface,
  beam: BeamType,
  subdivisionLevels = DEFAULT_REFERENCE_SURFACE_SUBDIVISION_LEVELS
): Box3 => {
  const box = computeDividedFaceEdgesBoundingBox(surface, subdivisionLevels);

  if (box.isEmpty()) {
    for (const p of surface.controlPoints) box.expandByPoint(p);
  }

  expandBoundingBoxForBeam(box, beam);
  return box;
};
