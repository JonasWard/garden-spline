'use client';

import { useLayoutEffect, useMemo, type FC } from 'react';
import * as THREE from 'three';

import {
  buildReferenceSurfaceMeshGeometry,
  DEFAULT_REFERENCE_SURFACE_SUBDIVISION_LEVELS
} from '@/lib/components/logic/reference-surface/renderer';
import type { ReferenceSurface } from '@/lib/components/types/reference-surface';

export type ReferenceGeometryProps = {
  referenceSurface: ReferenceSurface;
  /** Catmull–Clark levels before triangulation (see `sample-surface`). @default 0 */
  subdivisionLevels?: number;
  showWireframe?: boolean;
};

/**
 * Shaded quad mesh of the reference surface from {@link buildReferenceSurfaceMeshGeometry}.
 */
export const ReferenceGeometry: FC<ReferenceGeometryProps> = ({
  referenceSurface,
  subdivisionLevels = DEFAULT_REFERENCE_SURFACE_SUBDIVISION_LEVELS,
  showWireframe = false
}) => {
  const geometry = useMemo(
    () => buildReferenceSurfaceMeshGeometry(referenceSurface, subdivisionLevels),
    [referenceSurface, subdivisionLevels]
  );

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  const meshColor = useMemo(() => new THREE.Color('#646cff'), []);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={meshColor}
        metalness={0.12}
        roughness={0.55}
        opacity={0.45}
        transparent
        side={THREE.DoubleSide}
        wireframe={showWireframe}
      />
    </mesh>
  );
};
