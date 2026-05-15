import { AxisRay, AxisType, HexType, OctagonalType, QuadType, TriType } from '../../types/axis';
import { Vector2, Vector3 } from 'three';

const getV2XRotated = (rad: number) =>
  new Vector2(...new Vector3(1, 0, 0).applyAxisAngle(new Vector3(0, 0, 1), rad).toArray().slice(0, 2));

const X_AXIS = new Vector2(1, 0);
const Y_AXIS = new Vector2(0, 1);
const T_60_DEG = getV2XRotated(Math.PI / 3);
const T_120_DEG = getV2XRotated((2 * Math.PI) / 3);
const T_45_DEG = getV2XRotated(Math.PI / 4);
const T_135_DEG = getV2XRotated((3 * Math.PI) / 4);

const scaleAxisRay = (ray: AxisRay, scale: number): AxisRay => ({
  origin: ray.origin.clone().multiplyScalar(scale),
  direction: ray.direction,
  spacingDirection: ray.spacingDirection.clone().multiplyScalar(scale)
});

const getFirstValueFromRelative = (relativePosition: number) => relativePosition * (relativePosition + 1);

const baseTris: [AxisRay, AxisRay, AxisRay] = [
  { origin: new Vector2(), direction: X_AXIS, spacingDirection: T_60_DEG },
  { origin: new Vector2(), direction: T_60_DEG, spacingDirection: T_120_DEG },
  { origin: new Vector2(), direction: T_120_DEG, spacingDirection: X_AXIS }
];

const getBaseRayTri = (triAxis: TriType): [AxisRay, AxisRay, AxisRay] =>
  baseTris.map((ray) => scaleAxisRay(ray, triAxis.globalSize)) as [AxisRay, AxisRay, AxisRay];

const baseQuads: [AxisRay, AxisRay] = [
  { origin: new Vector2(), direction: X_AXIS, spacingDirection: Y_AXIS },
  { origin: new Vector2(), direction: Y_AXIS, spacingDirection: X_AXIS }
];

const centerShift = (v: number) => new Vector2(v, v);

const getBaseRayQuad = ({ relativeSize, globalSize }: QuadType) =>
  relativeSize === 1
    ? (baseQuads.map((ray) => scaleAxisRay(ray, globalSize)) as [AxisRay, AxisRay])
    : ([
        ...baseQuads,
        ...baseQuads.map((r) => ({
          ...r,
          origin: r.origin.clone().add(centerShift(getFirstValueFromRelative(relativeSize)))
        }))
      ]
        .map((r) => (r.origin.add(centerShift(getFirstValueFromRelative(relativeSize * -0.5))), r))
        .map((ray) => scaleAxisRay(ray, globalSize)) as [AxisRay, AxisRay, AxisRay, AxisRay]);

const baseHexes: [AxisRay, AxisRay, AxisRay] = [
  { origin: new Vector2(), direction: X_AXIS, spacingDirection: T_60_DEG },
  { origin: new Vector2(), direction: T_60_DEG, spacingDirection: T_120_DEG },
  { origin: new Vector2(0.5), direction: T_120_DEG, spacingDirection: X_AXIS }
];

const getBaseRayHex = ({ globalSize }: HexType): [AxisRay, AxisRay, AxisRay] =>
  baseHexes
    .map((ray) => scaleAxisRay(ray, globalSize))
    .map((r) => (r.origin.add(T_120_DEG.clone().multiplyScalar(globalSize * -0.5)), r)) as [AxisRay, AxisRay, AxisRay];

const baseQuadTurned: [AxisRay, AxisRay] = [
  { origin: new Vector2(-0.5), direction: T_45_DEG, spacingDirection: new Vector2(1) },
  { origin: new Vector2(-0.5), direction: T_135_DEG, spacingDirection: new Vector2(1) }
];

const getBaseRayOctagonal = (octagonalAxis: OctagonalType): [AxisRay, AxisRay, AxisRay, AxisRay, AxisRay, AxisRay] => {
  const r = getFirstValueFromRelative(octagonalAxis.relativeSize) * 0.5;
  const o1 = new Vector2(-r, -r);
  const o2 = new Vector2(r, r);

  return [
    ...baseQuadTurned,
    ...baseQuads.map((r) => ({
      ...r,
      origin: r.origin.clone().add(o1)
    })),
    ...baseQuads.map((r) => ({
      ...r,
      origin: r.origin.clone().add(o2)
    }))
  ] as [AxisRay, AxisRay, AxisRay, AxisRay, AxisRay, AxisRay];
};

/**
 * Gives the base rays describing a single axis grid.
 * These need to be repeated over to cover an entire domain.
 * @param axis - `AxisType` the axis to get the base rays for.
 */
export const getBaseAxisRays = (axis: AxisType): AxisRay[] => {
  switch (axis.type) {
    case 'tri':
      return getBaseRayTri(axis);
    case 'quad':
      return getBaseRayQuad(axis);
    case 'hex':
      return getBaseRayHex(axis);
    case 'octagonal':
      return getBaseRayOctagonal(axis);
  }
};
