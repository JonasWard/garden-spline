import {
  densing,
  undensing,
  schema,
  meta,
  object,
  fixed,
  int,
  bool,
  array,
  union,
  enumeration,
  pointer,
  optional
} from 'densing';

import {
  clampControlPointDelta,
  controlPointCount,
  type ControlPointDelta,
  type ControlPointDeltas,
  CONTROL_POINT_DELTA_MAX,
  CONTROL_POINT_DELTA_PRECISION
} from '@/lib/components/logic/reference-surface/control-point-deltas';
import type { AxisType } from '@/lib/components/types/axis';
import type { BeamType } from '@/lib/components/types/beam';
import { BEAM_STACK_MIN_MAX } from '@/lib/components/types/beam';
import type { ReferenceSurfaceBase } from '@/lib/components/types/reference-surface';
import type { ViewSettings } from '@/components/ui/configurator/ViewSettings';

/** Wire-format version (bump when {@link CONFIGURATOR_DENSE_SCHEMA} layout changes). */
export const CONFIGURATOR_STATE_VERSION = 3;

const AXIS_PATTERN_TYPES = ['tri', 'quad', 'hex', 'octagonal'] as const;
const BEAM_TYPES = ['inline', 'stack'] as const;

const NM_MIN = 1;
const NM_MAX = 12;
const SPACING_MIN = 0.01;
const SPACING_MAX = 10;
const SPACING_PRECISION = 0.01;
const AXIS_SIZE_MIN = 0.01;
const AXIS_SIZE_MAX = 5;
const AXIS_SIZE_PRECISION = 0.01;
const BEAM_DIM_MIN = 0.001;
const BEAM_DIM_MAX = 1;
const BEAM_DIM_PRECISION = 0.001;

/** Max `(n+1)×(m+1)` control vertices for `n,m ≤ 12`. */
const CONTROL_POINT_COUNT_MAX = (NM_MAX + 1) * (NM_MAX + 1);
const CONTROL_POINT_COUNT_MIN = (NM_MIN + 1) * (NM_MIN + 1);

export const CONFIGURATOR_DENSE_SCHEMA = schema(
  meta(
    object(
      'controlPointDelta',
      fixed('x', -CONTROL_POINT_DELTA_MAX, CONTROL_POINT_DELTA_MAX, CONTROL_POINT_DELTA_PRECISION),
      fixed('y', -CONTROL_POINT_DELTA_MAX, CONTROL_POINT_DELTA_MAX, CONTROL_POINT_DELTA_PRECISION),
      fixed('z', -CONTROL_POINT_DELTA_MAX, CONTROL_POINT_DELTA_MAX, CONTROL_POINT_DELTA_PRECISION)
    )
  ),
  int('version', 0, 255),
  union('axisType', enumeration('type', AXIS_PATTERN_TYPES), {
    tri: [fixed('globalSize', AXIS_SIZE_MIN, AXIS_SIZE_MAX, AXIS_SIZE_PRECISION)],
    quad: [
      fixed('globalSize', AXIS_SIZE_MIN, AXIS_SIZE_MAX, AXIS_SIZE_PRECISION),
      fixed('relativeSize', AXIS_SIZE_MIN, AXIS_SIZE_MAX, AXIS_SIZE_PRECISION)
    ],
    hex: [fixed('globalSize', AXIS_SIZE_MIN, AXIS_SIZE_MAX, AXIS_SIZE_PRECISION)],
    octagonal: [
      fixed('globalSize', AXIS_SIZE_MIN, AXIS_SIZE_MAX, AXIS_SIZE_PRECISION),
      fixed('relativeSize', AXIS_SIZE_MIN, AXIS_SIZE_MAX, AXIS_SIZE_PRECISION)
    ]
  }),
  object(
    'referenceSurfaceBase',
    int('n', NM_MIN, NM_MAX),
    int('m', NM_MIN, NM_MAX),
    fixed('dX', SPACING_MIN, SPACING_MAX, SPACING_PRECISION),
    fixed('dY', SPACING_MIN, SPACING_MAX, SPACING_PRECISION)
  ),
  array(
    'controlPointDeltas',
    CONTROL_POINT_COUNT_MIN,
    CONTROL_POINT_COUNT_MAX,
    optional('delta', pointer('value', 'controlPointDelta'), null)
  ),
  union('beam', enumeration('type', BEAM_TYPES), {
    inline: [
      fixed('width', BEAM_DIM_MIN, BEAM_DIM_MAX, BEAM_DIM_PRECISION),
      fixed('height', BEAM_DIM_MIN, BEAM_DIM_MAX, BEAM_DIM_PRECISION)
    ],
    stack: [
      fixed('width', BEAM_DIM_MIN, BEAM_DIM_MAX, BEAM_DIM_PRECISION),
      fixed('height', BEAM_DIM_MIN, BEAM_DIM_MAX, BEAM_DIM_PRECISION),
      int('count', BEAM_STACK_MIN_MAX.min, BEAM_STACK_MIN_MAX.max),
      bool('up')
    ]
  }),
  object(
    'viewSettings',
    bool('showAxis'),
    bool('showAxis3d'),
    bool('showBeam'),
    bool('showReferenceSurfaceVisualisation'),
    bool('showDividedFaceEdges'),
    bool('showWireframe'),
    bool('showBottomPlane')
  )
);

/** Payload shape consumed and produced by {@link CONFIGURATOR_DENSE_SCHEMA}. */
export type DenseConfiguratorState = {
  version: number;
  axisType: AxisType;
  referenceSurfaceBase: ReferenceSurfaceBase;
  controlPointDeltas: ControlPointDeltas;
  beam: BeamType;
  viewSettings: ViewSettings;
};

/** Configurator React state mirrored in {@link page.tsx}. */
export type ConfiguratorState = {
  axisType: AxisType;
  referenceSurfaceBase: ReferenceSurfaceBase;
  controlPointDeltas: ControlPointDeltas;
  beam: BeamType;
  viewSettings: ViewSettings;
};

export { type ControlPointDelta, type ControlPointDeltas };
export {
  emptyControlPointDeltas,
  resolveControlPoints
} from '@/lib/components/logic/reference-surface/control-point-deltas';

const assertControlPointDeltaCount = (base: ReferenceSurfaceBase, deltas: ControlPointDeltas) => {
  const expected = controlPointCount(base);
  if (deltas.length !== expected) {
    throw new Error(`controlPointDeltas length ${deltas.length} !== (n+1)×(m+1) = ${expected}`);
  }
};

const normalizeDenseDeltas = (deltas: ControlPointDeltas): ControlPointDeltas =>
  deltas.map((d) => (d === null ? null : clampControlPointDelta(d)));

export const configuratorStateToDense = (state: ConfiguratorState): DenseConfiguratorState => {
  assertControlPointDeltaCount(state.referenceSurfaceBase, state.controlPointDeltas);
  return {
    version: CONFIGURATOR_STATE_VERSION,
    axisType: state.axisType,
    referenceSurfaceBase: state.referenceSurfaceBase,
    controlPointDeltas: normalizeDenseDeltas(state.controlPointDeltas),
    beam: state.beam,
    viewSettings: state.viewSettings
  };
};

const normalizeDenseVersion = (dense: DenseConfiguratorState): DenseConfiguratorState => {
  if (dense.version === 2) {
    return {
      ...dense,
      version: CONFIGURATOR_STATE_VERSION,
      viewSettings: { ...dense.viewSettings, showBottomPlane: true }
    };
  }
  return dense;
};

export const denseToConfiguratorState = (dense: DenseConfiguratorState): ConfiguratorState => {
  const normalized = normalizeDenseVersion(dense);
  if (normalized.version !== CONFIGURATOR_STATE_VERSION) {
    throw new Error(
      `Unsupported configurator state version ${normalized.version} (expected ${CONFIGURATOR_STATE_VERSION})`
    );
  }
  assertControlPointDeltaCount(normalized.referenceSurfaceBase, normalized.controlPointDeltas);
  return {
    axisType: normalized.axisType,
    referenceSurfaceBase: normalized.referenceSurfaceBase,
    controlPointDeltas: normalizeDenseDeltas(normalized.controlPointDeltas),
    beam: normalized.beam,
    viewSettings: normalized.viewSettings
  };
};

/** Pack configurator state into a dense URL-safe string. */
export const encodeConfiguratorState = (state: ConfiguratorState): string =>
  densing(CONFIGURATOR_DENSE_SCHEMA, configuratorStateToDense(state));

/** Restore configurator state from a dense string. */
export const decodeConfiguratorState = (encoded: string): ConfiguratorState =>
  denseToConfiguratorState(undensing(CONFIGURATOR_DENSE_SCHEMA, encoded) as DenseConfiguratorState);

/** Canonical dense string used when no `?state=` is provided. */
export const DEFAULT_CONFIGURATOR_STATE =
  'A0YmNEJUlSDPufaWL6H0HCL6H0HCrVn2li-h9BwgvofQcIvofRLC-h9EsAvofRLC-h9EsC-h9BwgvofQcLPtaqWL6H0HCL6H0HCrVWqliMYOmV';

export const createDefaultConfiguratorState = (): ConfiguratorState =>
  decodeConfiguratorState(DEFAULT_CONFIGURATOR_STATE);

/** Decode URL/state string, falling back to {@link DEFAULT_CONFIGURATOR_STATE}. */
export const resolveConfiguratorStateFromEncoded = (encoded: string | null | undefined): ConfiguratorState => {
  const raw = encoded?.trim();
  if (!raw) return createDefaultConfiguratorState();
  try {
    return decodeConfiguratorState(raw);
  } catch {
    return createDefaultConfiguratorState();
  }
};
