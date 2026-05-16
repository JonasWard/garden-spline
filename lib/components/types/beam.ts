type BaseBeamType = {
  width: number;
  height: number;
};

type InlineType = BaseBeamType & {
  type: 'inline';
};

type StackBeamType = BaseBeamType & {
  type: 'stack';
  count: number;
  /** When true, stacks offset along +surface normal; when false, along −normal. */
  up: boolean;
};

export type BeamType = InlineType | StackBeamType;

export const BEAM_STACK_MIN_MAX = {
  min: 1,
  max: 5
};

export const DEFAULT_BEAM = {
  inline: {
    type: 'inline',
    width: 0.05,
    height: 0.05
  },
  stack: {
    type: 'stack',
    width: 0.05,
    height: 0.05,
    count: 2,
    up: true
  }
} as const;
