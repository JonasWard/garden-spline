'use client';

import { ContactShadows } from '@react-three/drei';
import type { FC } from 'react';
import * as THREE from 'three';

import type { GeometryGroundLayout } from '@/lib/components/logic/view/geometry-ground';

/** Fixed ground plane extent in local XY (meters). */
const GROUND_PLANE_SIZE = 500;

const GROUND_COLOR = '#b8aea3';

export type SceneEnvironmentProps = {
  layout: GeometryGroundLayout;
  showGround?: boolean;
  showHuman?: boolean;
};

const SKIN = { color: '#c9b8a8', roughness: 0.85, metalness: 0.02 };
const SKIN_HEAD = { color: '#d4c4b5', roughness: 0.8, metalness: 0.02 };

/** Capsule limb aligned along local +Z (Three.js capsules default to +Y). */
const Limb: FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  radius: number;
  length: number;
  material?: typeof SKIN;
}> = ({ position, rotation = [Math.PI / 2, 0, 0], radius, length, material = SKIN }) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <capsuleGeometry args={[radius, length, 6, 10]} />
    <meshStandardMaterial {...material} />
  </mesh>
);

const SimpleHuman: FC<{ zBottom: number }> = ({ zBottom }) => (
  <group position={[0, 0, zBottom]}>
    <Limb position={[-0.11, 0, 0.43]} radius={0.09} length={0.72} />
    <Limb position={[0.11, 0, 0.43]} radius={0.09} length={0.72} />
    <Limb position={[0, 0, 1.1]} radius={0.2} length={0.5} />
    <Limb position={[-0.3, 0, 1.08]} radius={0.07} length={0.5} rotation={[Math.PI / 2, 0, 0.22]} />
    <Limb position={[0.3, 0, 1.08]} radius={0.07} length={0.5} rotation={[Math.PI / 2, 0, -0.22]} />
    <mesh position={[0, 0, 1.54]} castShadow receiveShadow>
      <sphereGeometry args={[0.21, 16, 12]} />
      <meshStandardMaterial {...SKIN_HEAD} />
    </mesh>
  </group>
);

/**
 * Ground plane and a simple human figure in local Z-up space (same as control points).
 */
export const SceneEnvironment: FC<SceneEnvironmentProps> = ({
  layout,
  showGround = true,
  showHuman = true
}) => {
  const { zBottom } = layout;

  return (
    <>
      {showGround && (
        <>
          <ContactShadows
            position={[0, 0, zBottom + 0.02]}
            opacity={0.45}
            scale={40}
            blur={2.5}
            far={14}
            resolution={2048}
            color="#6e6660"
          />
          <mesh position={[0, 0, zBottom]} receiveShadow>
            <planeGeometry args={[GROUND_PLANE_SIZE, GROUND_PLANE_SIZE]} />
            <meshStandardMaterial color={GROUND_COLOR} roughness={0.94} metalness={0} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      {showHuman && <SimpleHuman zBottom={zBottom} />}
    </>
  );
};
