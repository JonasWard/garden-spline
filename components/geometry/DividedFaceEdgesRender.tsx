'use client';

import { useLayoutEffect, useMemo, type FC } from 'react';

import {
  buildDividedFaceEdgeGeometries,
  DEFAULT_REFERENCE_SURFACE_SUBDIVISION_LEVELS
} from '@/lib/components/logic/reference-surface/renderer';
import type { ReferenceSurface } from '@/lib/components/types/reference-surface';

export type DividedFaceEdgesRenderProps = {
  referenceSurface: ReferenceSurface;
  /** Catmull–Clark levels (matches {@link ReferenceGeometry}). @default 5 */
  subdivisionLevels?: number;
};

/**
 * Original coarse-face edges sampled on the subdivided reference surface (grid UV → 3D).
 */
export const DividedFaceEdgesRender: FC<DividedFaceEdgesRenderProps> = ({
  referenceSurface,
  subdivisionLevels = DEFAULT_REFERENCE_SURFACE_SUBDIVISION_LEVELS
}) => {
  const geometry = useMemo(
    () => buildDividedFaceEdgeGeometries(referenceSurface, subdivisionLevels),
    [referenceSurface, subdivisionLevels]
  );

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments geometry={geometry} renderOrder={2}>
      <lineBasicMaterial color="#f3d5a3" transparent opacity={0.95} depthTest depthWrite={false} />
    </lineSegments>
  );
};
