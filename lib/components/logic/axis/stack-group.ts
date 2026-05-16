import type { AxisRay, AxisStackGroup, AxisType } from '../../types/axis';
import type { ReferenceSurfaceBase } from '../../types/reference-surface';
import { getBaseAxisRays, STACK_BEAM_ORDER } from './base-compute';
import { populateUVBox } from './populate-uv-box';

/** Pairs each base ray with its in-stack slot from {@link STACK_BEAM_ORDER}. */
export function groupBaseAxisRaysByStackOrder(axis: AxisType): {
  ray: AxisRay;
  rayIndex: number;
  orderInStack: number;
}[] {
  const rays = getBaseAxisRays(axis);
  const order = STACK_BEAM_ORDER[axis.type];
  if (order.length !== rays.length) {
    throw new Error(
      `STACK_BEAM_ORDER.${axis.type} length ${order.length} does not match base ray count ${rays.length}`
    );
  }
  return rays.map((ray, rayIndex) => ({ ray, rayIndex, orderInStack: order[rayIndex]! }));
}

/** Number of normal-offset slots within one stack layer (max order + 1). */
export function getSlotsPerStackLayer(axis: AxisType): number {
  const order = STACK_BEAM_ORDER[axis.type];
  return Math.max(0, ...order) + 1;
}

/** Normal offset for one beam: stack type × layer stride + in-stack slot × beam height (sign from `up`). */
export function getStackBeamNormalOffset(
  axis: AxisType,
  stackType: number,
  orderInStack: number,
  beamHeight: number,
  up: boolean
): number {
  const offset = stackType * getSlotsPerStackLayer(axis) * beamHeight + orderInStack * beamHeight;
  return up ? offset : -offset;
}

/** Base axis rays and populated UV segments, each tagged with its in-stack slot. */
export function getAxisStackGroups(axis: AxisType, referenceSurface: ReferenceSurfaceBase): AxisStackGroup[] {
  return groupBaseAxisRaysByStackOrder(axis).map(({ ray, rayIndex, orderInStack }) => ({
    orderInStack,
    rayIndex,
    ray,
    lines: populateUVBox(ray, referenceSurface)
  }));
}

/** Populated segments grouped by in-stack slot (for 2D preview / slot-wise styling). */
export function get2DVisualisationByOrderSlot(
  axis: AxisType,
  referenceSurface: ReferenceSurfaceBase
): AxisStackGroup['lines'][] {
  const groups = getAxisStackGroups(axis, referenceSurface);
  const slots = getSlotsPerStackLayer(axis);
  const bySlot: AxisStackGroup['lines'][] = Array.from({ length: slots }, () => []);
  for (const { orderInStack, lines } of groups) {
    bySlot[orderInStack]!.push(...lines);
  }
  return bySlot;
}
