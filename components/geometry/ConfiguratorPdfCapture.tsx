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
  const orbitEnabledBeforeExport = useRef(true);
  const boundaryBoxRef = useRef(boundaryBox);
  const configuratorStateRef = useRef(configuratorState);
  const onExportStartRef = useRef(onExportStart);
  const onExportCompleteRef = useRef(onExportComplete);
  const onExportErrorRef = useRef(onExportError);

  boundaryBoxRef.current = boundaryBox;
  configuratorStateRef.current = configuratorState;
  onExportStartRef.current = onExportStart;
  onExportCompleteRef.current = onExportComplete;
  onExportErrorRef.current = onExportError;

  useEffect(() => {
    if (!pdfExportKey) return;

    let cancelled = false;
    const state = configuratorStateRef.current;
    const box = boundaryBoxRef.current;

    const run = async () => {
      orbitEnabledBeforeExport.current = useR3FStore.getState().enableOrbitConrol;
      setEnableOrbitConrol(false);
      onExportStartRef.current?.();

      try {
        await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
        if (cancelled) return;

        const views = captureOrthographicViews(gl, scene, box, {
          width: EXPORT_WIDTH,
          height: EXPORT_HEIGHT
        });
        const dimensions = structureDimensionsFromBox(box);
        const beamCount = countBeams(state.axisType, state.referenceSurfaceBase, state.beam);
        await downloadConfiguratorPdf({
          views,
          dimensions,
          beamCount,
          settingsRows: formatConfiguratorSettingsRows(state)
        });
      } catch (e) {
        onExportErrorRef.current?.(e);
        console.error('PDF export failed:', e);
      } finally {
        setEnableOrbitConrol(orbitEnabledBeforeExport.current);
        invalidate();
        onExportCompleteRef.current();
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [pdfExportKey, gl, scene, invalidate, setEnableOrbitConrol]);

  return null;
};
