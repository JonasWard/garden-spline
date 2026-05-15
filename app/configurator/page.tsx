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

export default function SimpleGridShellPage() {
  const [axisType, setAxisType] = useState<AxisType>(DEFAULT_AXIS_BASES['tri']);
  const [referenceSurfaceBase, setReferenceSurfaceBase] = useState<ReferenceSurfaceBase>(DEFAULT_SURFACE_BASE);
  const [controlPoints, setControlPoints] = useState<Vector3[]>(getDefaultControlPoints(referenceSurfaceBase));

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

      <div className="absolute left-4 top-4 md:left-6 md:top-6 w-[360px] max-h-[90svh] overflow-y-auto max-w-[92vw] bg-[#1a1a1a]/90 backdrop-blur border-2 border-[#fbf0df] rounded-2xl p-5 text-left">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-tight">Simple grid shell</h1>
            <p className="text-sm text-white/70 mt-1">
              Define an n × m control grid, drag vertices in Z, then Catmull‑Clark subdivide + Z‑only relaxation (naked
              edges fixed).
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <AxisSettings axis={axisType} setAxis={setAxisType} />
          <ReferenceSurfaceSettings
            referenceSurface={referenceSurfaceBase}
            setReferenceSurface={onReferenceSurfaceBaseChange}
          />
          <ViewSettingsUI viewSettings={viewSettings} setViewSettings={setViewSettings} />
        </div>
      </div>
    </div>
  );
}
