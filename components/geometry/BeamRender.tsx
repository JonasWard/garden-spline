'use client';

import { useLayoutEffect, useMemo, type FC } from 'react';
import * as THREE from 'three';

import { buildAxisBeamBufferGeometry } from '@/lib/components/logic/beam/renderer';
import type { AxisType } from '@/lib/components/types/axis';
import type { BeamType } from '@/lib/components/types/beam';
import type { ReferenceSurface } from '@/lib/components/types/reference-surface';

export type BeamRenderProps = {
  axis: AxisType;
  referenceSurface: ReferenceSurface;
  beam: BeamType;
};

/**
 * Extruded beam solids along lifted grid axes (see {@link buildAxisBeamBufferGeometry}).
 */
export const BeamRender: FC<BeamRenderProps> = ({ axis, referenceSurface, beam }) => {
  const geometry = useMemo(
    () => buildAxisBeamBufferGeometry(axis, referenceSurface, beam),
    [axis, referenceSurface, beam]
  );

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  const color = useMemo(() => new THREE.Color('#f3d5a3'), []);

  if (!geometry.getAttribute('position') || geometry.getAttribute('position')!.count === 0) {
    return null;
  }

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        metalness={0.08}
        roughness={0.5}
        opacity={0.92}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
