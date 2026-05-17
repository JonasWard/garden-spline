import { Vector2, Vector3 } from 'three';

export type ReferenceSurfaceBase = {
  m: number;
  n: number;
  dX: number;
  dY: number;
};

export type ControlPointDefinition = {
  /** Resolved world positions (default grid + optional deltas). */
  controlPoints: Vector3[];
};

export type ReferenceSurface = ReferenceSurfaceBase & ControlPointDefinition;

export const DEFAULT_SURFACE_BASE: ReferenceSurfaceBase = {
  m: 2,
  n: 2,
  dX: 1,
  dY: 1
};

export type UVBox = [Vector2, Vector2];
