'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Box3, PerspectiveCamera, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { fitPerspectiveCameraToBox, worldBoxFromLocalBox } from '@/lib/components/logic/view/fit-camera-to-box';

const MAX_FIT_ATTEMPTS = 24;

export type FitCameraToContentProps = {
  /** Increment to trigger a new fit (e.g. after loading densing state). */
  fitKey: number;
  /** Boundary AABB in the scene group's local space (divided face edges + beam padding). */
  boundaryBox: Box3;
  /** Fallback when R3F store `controls` is not registered yet. */
  orbitControlsRef?: React.RefObject<OrbitControlsImpl | null>;
};

/**
 * Fits the default orbit camera to the world-space bounding box of `points`.
 * Must be rendered inside the R3F {@link Canvas}, after {@link OrbitControls}.
 */
export const FitCameraToContent: React.FC<FitCameraToContentProps> = ({
  fitKey,
  boundaryBox,
  orbitControlsRef
}) => {
  const camera = useThree((s) => s.camera);
  const storeControls = useThree((s) => s.controls);
  const invalidate = useThree((s) => s.invalidate);
  const boundaryBoxRef = useRef(boundaryBox);
  boundaryBoxRef.current = boundaryBox;

  useEffect(() => {
    if (!fitKey || boundaryBox.isEmpty()) return;

    let cancelled = false;
    let attempts = 0;

    const tryFit = () => {
      if (cancelled) return;
      attempts += 1;

      const controls = (storeControls ?? orbitControlsRef?.current) as OrbitControlsImpl | null | undefined;
      if (!(camera instanceof PerspectiveCamera) || !controls) {
        if (attempts < MAX_FIT_ATTEMPTS) requestAnimationFrame(tryFit);
        return;
      }

      const box = worldBoxFromLocalBox(boundaryBoxRef.current);
      const pad = Math.max(box.getSize(new Vector3()).length() * 0.12, 0.5);
      box.expandByScalar(pad);

      fitPerspectiveCameraToBox(camera, controls, box);
      controls.update();
      invalidate();
    };

    requestAnimationFrame(tryFit);
    return () => {
      cancelled = true;
    };
  }, [fitKey, boundaryBox, camera, storeControls, orbitControlsRef, invalidate]);

  return null;
};
