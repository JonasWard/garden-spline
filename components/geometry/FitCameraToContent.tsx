'use client';

import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';
import type { OrbitControls } from 'three-stdlib';

import {
  fitPerspectiveCameraToBox,
  worldBoxFromLocalPoints
} from '@/lib/components/logic/view/fit-camera-to-box';

export type FitCameraToContentProps = {
  /** Increment to trigger a new fit (e.g. after loading densing state). */
  fitKey: number;
  /** Control-point positions in the scene group's local space. */
  points: Vector3[];
};

/**
 * Fits the default orbit camera to the world-space bounding box of `points`.
 * Must be rendered inside the R3F {@link Canvas}.
 */
export const FitCameraToContent: React.FC<FitCameraToContentProps> = ({ fitKey, points }) => {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControls | undefined;

  useLayoutEffect(() => {
    if (!fitKey || points.length === 0 || !(camera instanceof PerspectiveCamera) || !controls) return;

    const box = worldBoxFromLocalPoints(points);
    const pad = Math.max(box.getSize(new Vector3()).length() * 0.08, 0.25);
    box.expandByScalar(pad);

    fitPerspectiveCameraToBox(camera, controls, box);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fit only when `fitKey` changes (state load)
  }, [fitKey]);

  return null;
};
