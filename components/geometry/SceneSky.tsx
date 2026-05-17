'use client';

import type { FC } from 'react';
import { Sky } from '@react-three/drei';

/** Distant sky dome (world space, outside the shell transform). */
export const SceneSky: FC = () => (
  <Sky
    distance={450000}
    sunPosition={[120, 45, 80]}
    mieCoefficient={0.005}
    mieDirectionalG={0.85}
    rayleigh={0.4}
    turbidity={8}
    inclination={0.49}
    azimuth={0.25}
  />
);
