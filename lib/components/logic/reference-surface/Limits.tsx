import React from 'react';
import { ReferenceSurfaceBase } from '../../types/reference-surface';
import { getUVBoxAxisLimits } from '../axis/populate-uv-box';
import { InfiniteLine2dRenderer } from '../geometry/InfiniteLine2dRenderer';

export const Limits: React.FC<{ rS: ReferenceSurfaceBase }> = ({ rS }) => {
  const { xMin, yMin, xMax, yMax } = getUVBoxAxisLimits(rS);

  return (
    <group>
      {[xMin, yMin, xMax, yMax].map((limit) => (
        <InfiniteLine2dRenderer line={limit} />
      ))}
    </group>
  );
};
