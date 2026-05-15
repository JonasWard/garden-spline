'use client';

import { Line } from '@react-three/drei';
import { useMemo, type FC } from 'react';

import { get3DVisualisation } from '@/lib/components/logic/axis/renderer';
import type { AxisType } from '@/lib/components/types/axis';
import type { ReferenceSurface } from '@/lib/components/types/reference-surface';

export type AxisRender3dProps = {
  axis: AxisType;
  referenceSurface: ReferenceSurface;
};

/**
 * Axis polylines lifted onto the reference surface ({@link get3DVisualisation}).
 */
export const AxisRender3d: FC<AxisRender3dProps> = ({ axis, referenceSurface }) => {
  const polylines = useMemo(() => get3DVisualisation(axis, referenceSurface), [axis, referenceSurface]);

  return (
    <group>
      {polylines.map((pts, idx) => (
        <Line
          key={idx}
          points={pts}
          color="#f3d5a3"
          lineWidth={1}
          dashed={false}
          depthTest
          transparent
          opacity={0.9}
        />
      ))}
    </group>
  );
};
