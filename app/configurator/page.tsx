'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { GridShellScene } from '@/components/GridShellScene';
import type { ReferenceSurfaceBase } from '@/lib/components/types/reference-surface';
import { Vector3 } from 'three';
import {
  absoluteToControlPointDeltas,
  emptyControlPointDeltas,
  resolveControlPoints
} from '@/lib/components/logic/reference-surface/control-point-deltas';
import { ReferenceSurfaceSettings } from '@/components/ui/configurator/ReferenceSurfaceSettings';
import { AxisSettings } from '@/components/ui/configurator/AxisSettings';
import { ViewSettingsUI } from '@/components/ui/configurator/ViewSettings';
import { ConfiguratorPanel } from '@/components/ui/configurator/ConfiguratorPanel';
import { BeamSettings } from '@/components/ui/configurator/BeamSettings';
import { ControlPointSettings } from '@/components/ui/configurator/ControlPointSettings';
import {
  createDefaultConfiguratorState,
  encodeConfiguratorState,
  resolveConfiguratorStateFromEncoded,
  type ConfiguratorState
} from '@/components/ui/state-string/densing-state';

const URL_SYNC_DEBOUNCE_MS = 300;

const applyConfiguratorState = (
  loaded: ConfiguratorState,
  setters: {
    setAxisType: (v: ConfiguratorState['axisType']) => void;
    setReferenceSurfaceBase: (v: ConfiguratorState['referenceSurfaceBase']) => void;
    setControlPointDeltas: (v: ConfiguratorState['controlPointDeltas']) => void;
    setBeamType: (v: ConfiguratorState['beam']) => void;
    setViewSettings: (v: ConfiguratorState['viewSettings']) => void;
  }
) => {
  setters.setAxisType(loaded.axisType);
  setters.setReferenceSurfaceBase(loaded.referenceSurfaceBase);
  setters.setControlPointDeltas(loaded.controlPointDeltas);
  setters.setBeamType(loaded.beam);
  setters.setViewSettings(loaded.viewSettings);
};

function ConfiguratorPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialState] = useState(createDefaultConfiguratorState);
  const [axisType, setAxisType] = useState(initialState.axisType);
  const [referenceSurfaceBase, setReferenceSurfaceBase] = useState(initialState.referenceSurfaceBase);
  const [controlPointDeltas, setControlPointDeltas] = useState(initialState.controlPointDeltas);
  const [beam, setBeamType] = useState(initialState.beam);
  const [viewSettings, setViewSettings] = useState(initialState.viewSettings);
  const [urlHydrated, setUrlHydrated] = useState(false);
  const [cameraFitKey, setCameraFitKey] = useState(0);
  const [pdfExportKey, setPdfExportKey] = useState(0);
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  const controlPoints = useMemo(
    () => resolveControlPoints(referenceSurfaceBase, controlPointDeltas),
    [referenceSurfaceBase, controlPointDeltas]
  );

  const configuratorState = useMemo<ConfiguratorState>(
    () => ({ axisType, referenceSurfaceBase, controlPointDeltas, beam, viewSettings }),
    [axisType, referenceSurfaceBase, controlPointDeltas, beam, viewSettings]
  );

  const encodedState = useMemo(() => {
    try {
      return encodeConfiguratorState(configuratorState);
    } catch {
      return null;
    }
  }, [configuratorState]);

  /** Path + query only (SSR-safe); origin is added when copying on the client. */
  const shareUrl = useMemo(() => {
    if (!encodedState) return '';
    return `${pathname}?state=${encodeURIComponent(encodedState)}`;
  }, [encodedState, pathname]);

  useEffect(() => {
    const loaded = resolveConfiguratorStateFromEncoded(searchParams.get('state'));
    applyConfiguratorState(loaded, {
      setAxisType,
      setReferenceSurfaceBase,
      setControlPointDeltas,
      setBeamType,
      setViewSettings
    });
    setUrlHydrated(true);
    requestAnimationFrame(() => setCameraFitKey((k) => k + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate from URL once on mount
  }, []);

  useEffect(() => {
    if (!urlHydrated || !encodedState) return;
    const id = window.setTimeout(() => {
      if (searchParams.get('state') === encodedState) return;
      router.replace(`${pathname}?state=${encodeURIComponent(encodedState)}`, { scroll: false });
    }, URL_SYNC_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [urlHydrated, encodedState, pathname, router, searchParams]);

  useEffect(() => {
    if (!urlHydrated || !encodedState) return;
    const onPopState = () => {
      const encoded = new URLSearchParams(window.location.search).get('state');
      if (!encoded || encoded === encodedState) return;
      try {
        applyConfiguratorState(resolveConfiguratorStateFromEncoded(encoded), {
          setAxisType,
          setReferenceSurfaceBase,
          setControlPointDeltas,
          setBeamType,
          setViewSettings
        });
        requestAnimationFrame(() => setCameraFitKey((k) => k + 1));
      } catch (e) {
        console.error('Failed to load configurator state from URL:', e);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [urlHydrated, encodedState]);

  const onPdfExportComplete = useCallback(() => setIsPdfExporting(false), []);

  const onReferenceSurfaceBaseChange = useCallback(
    (referenceSurface: ReferenceSurfaceBase) => {
      setReferenceSurfaceBase(referenceSurface);
      setControlPointDeltas(emptyControlPointDeltas(referenceSurface));
    },
    [setReferenceSurfaceBase]
  );

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Shell overlay uses world XZ origin as pattern center — matches centered makeControlGrid footprint. */}
      <GridShellScene
        referenceSurface={{ ...referenceSurfaceBase, controlPoints }}
        axisType={axisType}
        beam={beam}
        viewSettings={viewSettings}
        cameraFitKey={cameraFitKey}
        configuratorState={configuratorState}
        shareUrl={shareUrl}
        pdfExportKey={pdfExportKey}
        isPdfExporting={isPdfExporting}
        onPdfExportComplete={onPdfExportComplete}
        onControlPointsChange={(positions: Vector3[]) => {
          setControlPointDeltas(absoluteToControlPointDeltas(referenceSurfaceBase, positions));
        }}
      />

      <ConfiguratorPanel
        shareUrl={shareUrl}
        pdfExporting={isPdfExporting}
        onDownloadPdf={() => {
          if (isPdfExporting) return;
          setIsPdfExporting(true);
          setPdfExportKey((k) => k + 1);
        }}
        sections={[
          { id: 'axis', content: <AxisSettings axis={axisType} setAxis={setAxisType} /> },
          {
            id: 'surface',
            content: (
              <ReferenceSurfaceSettings
                referenceSurface={referenceSurfaceBase}
                setReferenceSurface={onReferenceSurfaceBaseChange}
              />
            )
          },
          {
            id: 'view',
            content: <ViewSettingsUI viewSettings={viewSettings} setViewSettings={setViewSettings} />
          },
          { id: 'points', content: <ControlPointSettings /> },
          { id: 'beam', content: <BeamSettings beam={beam} setBeamType={setBeamType} /> }
        ]}
      />
    </div>
  );
}

export default function SimpleGridShellPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-[#1a1a1a]" />}>
      <ConfiguratorPageContent />
    </Suspense>
  );
}
