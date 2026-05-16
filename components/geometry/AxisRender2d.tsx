'use client';

import { Line } from '@react-three/drei';
import { useMemo, type FC } from 'react';

import { get2DVisualisation } from '@/lib/components/logic/axis/renderer';
import type { AxisType } from '@/lib/components/types/axis';
import type { ReferenceSurfaceBase } from '@/lib/components/types/reference-surface';
import { Limits } from '@/lib/components/logic/reference-surface/Limits';
import { randomColor } from '@/lib/components/color/random-color';

export type AxisRender2dProps = {
  axis: AxisType;
  referenceSurface: ReferenceSurfaceBase;
};

/**
 * Axis overlay in the reference UV plane (XY, z = 0) from {@link get2DVisualisation}.
 */
export const AxisRender2d: FC<AxisRender2dProps> = ({ axis, referenceSurface }) => {
  const segments = useMemo(() => get2DVisualisation(axis, referenceSurface), [axis, referenceSurface]);

  return (
    <>
      <group>
        {segments.map(([a, b], i) => (
          <Line
            key={i}
            points={[a, b]}
            color={randomColor(i)}
            lineWidth={10}
            dashed={false}
            depthTest
            transparent
            opacity={0.9}
          />
        ))}
      </group>
      <Limits rS={referenceSurface} />
    </>
  );
};
