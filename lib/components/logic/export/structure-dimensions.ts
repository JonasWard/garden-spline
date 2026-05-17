import { Box3, Vector3 } from 'three';

export type StructureDimensions = {
  /** Span along local X (m). */
  width: number;
  /** Span along local Y (m). */
  depth: number;
  /** Span along local Z (m). */
  height: number;
};

export const structureDimensionsFromBox = (box: Box3): StructureDimensions => {
  const size = new Vector3();
  box.getSize(size);
  return {
    width: size.x,
    depth: size.y,
    height: size.z
  };
};

export const formatMeters = (value: number, digits = 2) => `${value.toFixed(digits)} m`;
