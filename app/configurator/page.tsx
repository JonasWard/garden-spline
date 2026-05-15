'use client';

import { useCallback, useState } from 'react';

import { GridShellScene } from '@/components/GridShellScene';
import { AxisType, DEFAULT_AXIS_BASES } from '@/lib/components/types/axis';
import { DEFAULT_SURFACE_BASE, ReferenceSurfaceBase } from '@/lib/components/types/reference-surface';
import { Vector3 } from 'three';
import { getDefaultControlPoints } from '@/lib/components/logic/reference-surface/base-compute';
import { ReferenceSurfaceSettings } from '@/components/ui/configurator/ReferenceSurfaceSettings';
import { AxisSettings } from '@/components/ui/configurator/AxisSettings';
import { ViewSettings, ViewSettingsUI } from '@/components/ui/configurator/ViewSettings';
import { ConfiguratorPanel } from '@/components/ui/configurator/ConfiguratorPanel';
import { BeamSettings } from '@/components/ui/configurator/BeamSettings';
import { BeamType } from '@/lib/components/types/beam';

export default function SimpleGridShellPage() {
  const [axisType, setAxisType] = useState<AxisType>(DEFAULT_AXIS_BASES['tri']);
  const [referenceSurfaceBase, setReferenceSurfaceBase] = useState<ReferenceSurfaceBase>(DEFAULT_SURFACE_BASE);
  const [controlPoints, setControlPoints] = useState<Vector3[]>(getDefaultControlPoints(referenceSurfaceBase));
  const [beam, setBeamType] = useState<BeamType>({ width: 0.05, height: 0.05 });

  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    showAxis: true,
    showAxis3d: true,
    showReferenceSurfaceVisualisation: true,
    showControlPoints: true,
    showWireframe: false
  });

  const onReferenceSurfaceBaseChange = useCallback(
    (referenceSurface: ReferenceSurfaceBase) => {
      setReferenceSurfaceBase(referenceSurface);
      setControlPoints(getDefaultControlPoints(referenceSurface));
    },
    [setReferenceSurfaceBase]
  );

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Shell overlay uses world XZ origin as pattern center — matches centered makeControlGrid footprint. */}
      <GridShellScene
        referenceSurface={{ ...referenceSurfaceBase, controlPoints }}
        axisType={axisType}
        viewSettings={viewSettings}
        onControlPointsChange={(vs) => {
          setControlPoints(vs as Vector3[]);
        }}
      />

      <ConfiguratorPanel>
        <AxisSettings axis={axisType} setAxis={setAxisType} />
        <ReferenceSurfaceSettings
          referenceSurface={referenceSurfaceBase}
          setReferenceSurface={onReferenceSurfaceBaseChange}
        />
        <ViewSettingsUI viewSettings={viewSettings} setViewSettings={setViewSettings} />
        <BeamSettings beam={beam} setBeamType={setBeamType} />
      </ConfiguratorPanel>
    </div>
  );
}
