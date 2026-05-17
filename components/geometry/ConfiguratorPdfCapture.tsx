'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { Box3 } from 'three';

import type { ConfiguratorState } from '@/components/ui/state-string/densing-state';
import { useR3FStore } from '@/store/r3f-store';
import { captureOrthographicViews } from '@/lib/components/logic/export/capture-orthographic-views';
import { downloadConfiguratorPdf } from '@/lib/components/logic/export/build-configurator-pdf';
import { countBeams } from '@/lib/components/logic/export/count-beams';
import { formatConfiguratorSettingsRows } from '@/lib/components/logic/export/format-settings-table';
import { structureDimensionsFromBox } from '@/lib/components/logic/export/structure-dimensions';

const EXPORT_WIDTH = 1200;
const EXPORT_HEIGHT = 900;

export type ConfiguratorPdfCaptureProps = {
  pdfExportKey: number;
  boundaryBox: Box3;
  configuratorState: ConfiguratorState;
  onExportStart?: () => void;
  onExportComplete: () => void;
  onExportError?: (error: unknown) => void;
};

/**
 * On `pdfExportKey` change, captures orthographic views and downloads a PDF.
 * Parent should hide ground / UI overlays while exporting.
 */
export const ConfiguratorPdfCapture: React.FC<ConfiguratorPdfCaptureProps> = ({
  pdfExportKey,
  boundaryBox,
  configuratorState,
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const setEnableOrbitConrol = useR3FStore((s) => s.setEnableOrbitConrol);
  const lastKey = useRef(0);
  const orbitEnabledBeforeExport = useRef(true);

  useEffect(() => {
    if (!pdfExportKey || pdfExportKey === lastKey.current) return;
    lastKey.current = pdfExportKey;

    let cancelled = false;

    const run = async () => {
      orbitEnabledBeforeExport.current = useR3FStore.getState().enableOrbitConrol;
      setEnableOrbitConrol(false);
      onExportStart?.();
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      if (cancelled) return;

      try {
        const views = captureOrthographicViews(gl, scene, boundaryBox, {
          width: EXPORT_WIDTH,
          height: EXPORT_HEIGHT
        });
        const dimensions = structureDimensionsFromBox(boundaryBox);
        const beamCount = countBeams(
          configuratorState.axisType,
          configuratorState.referenceSurfaceBase,
          configuratorState.beam
        );
        await downloadConfiguratorPdf({
          views,
          dimensions,
          beamCount,
          settingsRows: formatConfiguratorSettingsRows(configuratorState)
        });
      } catch (e) {
        onExportError?.(e);
        console.error('PDF export failed:', e);
      } finally {
        if (!cancelled) {
          setEnableOrbitConrol(orbitEnabledBeforeExport.current);
          invalidate();
          onExportComplete();
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    pdfExportKey,
    boundaryBox,
    configuratorState,
    gl,
    scene,
    invalidate,
    setEnableOrbitConrol,
    onExportStart,
    onExportComplete,
    onExportError
  ]);

  return null;
};
