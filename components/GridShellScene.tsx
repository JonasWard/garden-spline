'use client';

import { useMemo, useRef } from 'react';
import { AxisType } from '@/lib/components/types/axis';
import type { BeamType } from '@/lib/components/types/beam';
import { ReferenceSurface } from '@/lib/components/types/reference-surface';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { AxisRender2d } from './geometry/AxisRender2d';
import { DividedFaceEdgesRender } from './geometry/DividedFaceEdgesRender';
import { ReferenceGeometry } from './geometry/ReferenceGeometry';
import { AxisRender3d } from './geometry/AxisRender3d';
import { BeamRender } from './geometry/BeamRender';
import { ControlPoints } from './geometry/ControlPoints';
import { FitCameraToContent } from './geometry/FitCameraToContent';
import { ConfiguratorPdfCapture } from './geometry/ConfiguratorPdfCapture';
import { SceneEnvironment } from './geometry/SceneEnvironment';
import { SceneSky } from './geometry/SceneSky';
import { OrbitControls } from '@react-three/drei';
import { computeConfiguratorBoundaryBox } from '@/lib/components/logic/view/configurator-boundary-bounds';
import { geometryGroundLayoutFromBox } from '@/lib/components/logic/view/geometry-ground';
import { CONFIGURATOR_WORLD_MATRIX } from '@/lib/components/logic/view/fit-camera-to-box';
import { ViewSettings } from './ui/configurator/ViewSettings';
import type { ConfiguratorState } from '@/components/ui/state-string/densing-state';
import { useR3FStore } from '@/store/r3f-store';

export type GridShellSceneProps = {
  referenceSurface: ReferenceSurface;
  axisType: AxisType;
  beam: BeamType;
  viewSettings: ViewSettings;
  onControlPointsChange: (positions: Vector3[]) => void;
  /** Increment after loading configurator state to frame the scene. */
  cameraFitKey?: number;
  configuratorState: ConfiguratorState;
  shareUrl: string;
  pdfExportKey?: number;
  isPdfExporting?: boolean;
  onPdfExportComplete?: () => void;
};

export const GridShellScene: React.FC<GridShellSceneProps> = ({
  referenceSurface,
  axisType,
  beam,
  viewSettings,
  onControlPointsChange,
  cameraFitKey = 0,
  configuratorState,
  shareUrl,
  pdfExportKey = 0,
  isPdfExporting = false,
  onPdfExportComplete
}) => {
  const enableOrbitConrol = useR3FStore((s) => s.enableOrbitConrol);
  const showControlPoints = useR3FStore((s) => s.showControlPoints);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

  const boundaryBox = useMemo(
    () => computeConfiguratorBoundaryBox(referenceSurface, beam),
    [referenceSurface, beam]
  );
  const groundLayout = useMemo(() => geometryGroundLayoutFromBox(boundaryBox), [boundaryBox]);

  return (
    <Canvas camera={{ position: [2.5, 2, 2.5], fov: 45 }} shadows>
      {isPdfExporting ? <color attach="background" args={['#ffffff']} /> : null}
      {!isPdfExporting && <fog attach="fog" args={['#c8dce8', 100, 200]} />}
      {!isPdfExporting && <SceneSky />}
      <ambientLight intensity={0.55} />
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        enabled={enableOrbitConrol}
      />
      <FitCameraToContent
        fitKey={cameraFitKey}
        boundaryBox={boundaryBox}
        orbitControlsRef={orbitControlsRef}
      />
      <ConfiguratorPdfCapture
        pdfExportKey={pdfExportKey}
        boundaryBox={boundaryBox}
        configuratorState={configuratorState}
        shareUrl={shareUrl}
        onExportComplete={() => onPdfExportComplete?.()}
      />
      <group matrix={CONFIGURATOR_WORLD_MATRIX} matrixAutoUpdate={false}>
        <directionalLight
          position={[6, 10, 4]}
          intensity={1.35}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-camera-near={0.5}
          shadow-camera-far={100}
          shadow-bias={-0.0003}
          shadow-normalBias={0.02}
        />
        <SceneEnvironment
          layout={groundLayout}
          showGround={!isPdfExporting}
          showHuman={!isPdfExporting}
        />
        {!isPdfExporting && viewSettings.showAxis && (
          <AxisRender2d axis={axisType} referenceSurface={referenceSurface} />
        )}
        {!isPdfExporting && viewSettings.showAxis3d && (
          <AxisRender3d axis={axisType} referenceSurface={referenceSurface} />
        )}
        {(isPdfExporting || viewSettings.showBeam) && (
          <BeamRender axis={axisType} referenceSurface={referenceSurface} beam={beam} />
        )}
        {!isPdfExporting && viewSettings.showReferenceSurfaceVisualisation && (
          <ReferenceGeometry referenceSurface={referenceSurface} showWireframe={viewSettings.showWireframe} />
        )}
        {(isPdfExporting || viewSettings.showDividedFaceEdges) && (
          <DividedFaceEdgesRender referenceSurface={referenceSurface} />
        )}
        {!isPdfExporting && showControlPoints && (
          <ControlPoints positions={referenceSurface.controlPoints} onChange={onControlPointsChange} />
        )}
      </group>
    </Canvas>
  );
};
