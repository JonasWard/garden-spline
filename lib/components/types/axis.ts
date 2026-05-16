import { Vector2 } from 'three';

type AxisBase = {
  globalSize: number;
};

export type TriType = AxisBase & {
  type: 'tri';
};

export type QuadType = AxisBase & {
  type: 'quad';
  relativeSize: number;
};

export type HexType = AxisBase & {
  type: 'hex';
};

export type OctagonalType = AxisBase & {
  type: 'octagonal';
  relativeSize: number;
};

export type AxisType = TriType | QuadType | HexType | OctagonalType;
export type AxisCategories = AxisType['type'];

export const DEFAULT_AXIS_BASES = {
  tri: {
    type: 'tri',
    globalSize: 1
  },
  quad: {
    type: 'quad',
    globalSize: 1,
    relativeSize: 1
  },
  hex: {
    type: 'hex',
    globalSize: 1
  },
  octagonal: {
    type: 'octagonal',
    globalSize: 1,
    relativeSize: 1
  }
} as const;

export type AxisLine = [Vector2, Vector2];
export type AxisRay = { origin: Vector2; direction: Vector2; spacingDirection: Vector2 };

/** One base axis ray with its in-stack slot and populated UV segments. */
export type AxisStackGroup = {
  /** Position along the normal within one stack layer (`STACK_BEAM_ORDER[rayIndex]`). */
  orderInStack: number;
  rayIndex: number;
  ray: AxisRay;
  lines: AxisLine[];
};
