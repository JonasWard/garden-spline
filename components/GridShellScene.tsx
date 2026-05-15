'use client';

import { AxisType } from '@/lib/components/types/axis';
import { ReferenceSurface } from '@/lib/components/types/reference-surface';
import { Canvas, Vector3 } from '@react-three/fiber';
import { AxisRender2d } from './geometry/AxisRender2d';
import { ReferenceGeometry } from './geometry/ReferenceGeometry';
import { AxisRender3d } from './geometry/AxisRender3d';
import { ControlPoints } from './geometry/ControlPoints';
import { OrbitControls } from '@react-three/drei';
import { Matrix4 } from 'three';
import { ViewSettings } from './ui/configurator/ViewSettings';
import { useR3FStore } from '@/store/r3f-store';

const PositiveCoordinateSystem = new Matrix4(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);

export type GridShellSceneProps = {
  referenceSurface: ReferenceSurface;
  axisType: AxisType;
  viewSettings: ViewSettings;
  onControlPointsChange: (controlPoints: Vector3[]) => void;
};

export const GridShellScene: React.FC<GridShellSceneProps> = ({
  referenceSurface,
  axisType,
  viewSettings,
  onControlPointsChange
}) => {
  const enableOrbitConrol = useR3FStore((s) => s.enableOrbitConrol);

  return (
    <Canvas camera={{ position: [2.5, 2, 2.5], fov: 45 }}>
      <color attach="background" args={['#1a1a1a']} />
      <ambientLight intensity={0.65} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} rotateSpeed={0.6} enabled={enableOrbitConrol} />
      <group matrix={PositiveCoordinateSystem} matrixAutoUpdate={false}>
        <directionalLight position={[4, 4, 4]} intensity={1.15} />
        {viewSettings.showAxis && <AxisRender2d axis={axisType} referenceSurface={referenceSurface} />}
        {viewSettings.showAxis3d && <AxisRender3d axis={axisType} referenceSurface={referenceSurface} />}
        {viewSettings.showReferenceSurfaceVisualisation && (
          <ReferenceGeometry referenceSurface={referenceSurface} showWireframe={viewSettings.showWireframe} />
        )}
        {viewSettings.showControlPoints && (
          <ControlPoints positions={referenceSurface.controlPoints} onChange={onControlPointsChange} />
        )}
      </group>
    </Canvas>
  );
};
