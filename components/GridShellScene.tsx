'use client';

import { AxisType } from '@/lib/components/types/axis';
import type { BeamType } from '@/lib/components/types/beam';
import { ReferenceSurface } from '@/lib/components/types/reference-surface';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import { AxisRender2d } from './geometry/AxisRender2d';
import { DividedFaceEdgesRender } from './geometry/DividedFaceEdgesRender';
import { ReferenceGeometry } from './geometry/ReferenceGeometry';
import { AxisRender3d } from './geometry/AxisRender3d';
import { BeamRender } from './geometry/BeamRender';
import { ControlPoints } from './geometry/ControlPoints';
import { FitCameraToContent } from './geometry/FitCameraToContent';
import { OrbitControls } from '@react-three/drei';
import { CONFIGURATOR_WORLD_MATRIX } from '@/lib/components/logic/view/fit-camera-to-box';
import { Matrix4 } from 'three';
import { ViewSettings } from './ui/configurator/ViewSettings';
import { useR3FStore } from '@/store/r3f-store';

export type GridShellSceneProps = {
  referenceSurface: ReferenceSurface;
  axisType: AxisType;
  beam: BeamType;
  viewSettings: ViewSettings;
  onControlPointsChange: (positions: Vector3[]) => void;
  /** Increment after loading configurator state to frame the scene. */
  cameraFitKey?: number;
};

export const GridShellScene: React.FC<GridShellSceneProps> = ({
  referenceSurface,
  axisType,
  beam,
  viewSettings,
  onControlPointsChange,
  cameraFitKey = 0
}) => {
  const enableOrbitConrol = useR3FStore((s) => s.enableOrbitConrol);
  const showControlPoints = useR3FStore((s) => s.showControlPoints);

  return (
    <Canvas camera={{ position: [2.5, 2, 2.5], fov: 45 }}>
      <color attach="background" args={['#1a1a1a']} />
      <ambientLight intensity={0.65} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} rotateSpeed={0.6} enabled={enableOrbitConrol} />
      <FitCameraToContent fitKey={cameraFitKey} points={referenceSurface.controlPoints} />
      <group matrix={CONFIGURATOR_WORLD_MATRIX} matrixAutoUpdate={false}>
        <directionalLight position={[4, 4, 4]} intensity={1.15} />
        {viewSettings.showAxis && <AxisRender2d axis={axisType} referenceSurface={referenceSurface} />}
        {viewSettings.showAxis3d && <AxisRender3d axis={axisType} referenceSurface={referenceSurface} />}
        {viewSettings.showBeam && <BeamRender axis={axisType} referenceSurface={referenceSurface} beam={beam} />}
        {viewSettings.showReferenceSurfaceVisualisation && (
          <ReferenceGeometry referenceSurface={referenceSurface} showWireframe={viewSettings.showWireframe} />
        )}
        {viewSettings.showDividedFaceEdges && <DividedFaceEdgesRender referenceSurface={referenceSurface} />}
        {showControlPoints && (
          <ControlPoints positions={referenceSurface.controlPoints} onChange={onControlPointsChange} />
        )}
      </group>
    </Canvas>
  );
};
