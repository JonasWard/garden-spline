'use client';

import { useR3FStore } from '@/store/r3f-store';
import { Line } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Mesh } from 'three';
import { Matrix4, Vector3 } from 'three';

/** Half-length of the constraint guide in parent **local** space (large segment ≈ “infinite” on screen). */
const CONSTRAINT_LINE_HALF_LOCAL = 400;

const AXIS: Record<'x' | 'y' | 'z', Vector3> = {
  x: new Vector3(1, 0, 0),
  y: new Vector3(0, 1, 0),
  z: new Vector3(0, 0, 1)
};

const TMP_W = new Vector3();
const TMP_TO_RAY = new Vector3();

/**
 * Closest point on the infinite line (linePoint + s * lineDir) to the mouse ray (rayOrigin + t * rayDir).
 * Uses the skew-line closest-approach formula (two lines in space). The ray is the half-line t >= 0; if the
 * unconstrained closest point on the infinite ray line lies behind the origin, we use the closest point on the
 * constraint line to rayOrigin (orthogonal projection onto the axis).
 */
function closestPointOnLineToRay(
  linePoint: Vector3,
  lineDir: Vector3,
  rayOrigin: Vector3,
  rayDir: Vector3,
  out: Vector3
): void {
  const v1 = lineDir;
  const v2 = rayDir;
  TMP_W.subVectors(linePoint, rayOrigin);

  const a = v1.dot(v1);
  const b = v1.dot(v2);
  const c = v2.dot(v2);
  const d = v1.dot(TMP_W);
  const e = v2.dot(TMP_W);
  const denom = a * c - b * b;

  let s: number;
  let t: number;

  if (Math.abs(denom) < 1e-12) {
    TMP_TO_RAY.subVectors(rayOrigin, linePoint);
    s = TMP_TO_RAY.dot(v1) / a;
    out.copy(linePoint).addScaledVector(v1, s);
    return;
  }

  s = (b * e - c * d) / denom;
  t = (a * e - b * d) / denom;

  if (t < 0) {
    TMP_TO_RAY.subVectors(rayOrigin, linePoint);
    s = TMP_TO_RAY.dot(v1) / a;
  }

  out.copy(linePoint).addScaledVector(v1, s);
}

const ControlPoint: React.FC<{
  constraint: 'x' | 'y' | 'z';
  position: Vector3;
  onChange: (newPosition: Vector3) => void;
  radius: number;
}> = ({ constraint, position, onChange, radius }) => {
  const meshRef = useRef<Mesh>(null);
  const [constraintGuide, setConstraintGuide] = useState<{
    world0: Vector3;
    axisWorld: Vector3;
  } | null>(null);

  useEffect(() => {
    if (constraintGuide) useR3FStore.getState().enableOrbitConrol && useR3FStore.setState({ enableOrbitConrol: false });
    else !useR3FStore.getState().enableOrbitConrol && useR3FStore.setState({ enableOrbitConrol: true });
  }, [constraintGuide]);

  const drag = useRef<{
    pointerId: number;
    axisWorld: Vector3;
    world0: Vector3;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const mesh = meshRef.current;
      const parent = mesh?.parent;
      if (!mesh || !parent) return;

      parent.updateWorldMatrix(true, true);
      const axisWorld = AXIS[constraint].clone().transformDirection(parent.matrixWorld).normalize();

      const world0 = new Vector3();
      mesh.getWorldPosition(world0);

      drag.current = { pointerId: e.pointerId, axisWorld, world0 };
      setConstraintGuide({ world0: world0.clone(), axisWorld: axisWorld.clone() });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [constraint]
  );

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId || (e.buttons & 1) === 0) return;
      e.stopPropagation();

      const mesh = meshRef.current;
      const parent = mesh?.parent;
      if (!mesh || !parent) return;

      const world1 = new Vector3();
      closestPointOnLineToRay(d.world0, d.axisWorld, e.ray.origin, e.ray.direction, world1);

      const local = world1.clone();
      parent.worldToLocal(local);
      onChange(local);
    },
    [onChange]
  );

  const endDrag = useCallback((pointerId: number) => {
    if (drag.current?.pointerId !== pointerId) return;
    drag.current = null;
    setConstraintGuide(null);
  }, []);

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        //
      }
      endDrag(e.pointerId);
    },
    [endDrag]
  );

  const onPointerCancel = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      endDrag(e.pointerId);
    },
    [endDrag]
  );

  let linePoints: [number, number, number][] | null = null;
  if (constraintGuide && meshRef.current?.parent) {
    const parent = meshRef.current.parent;
    parent.updateWorldMatrix(true, true);
    const inv = new Matrix4().copy(parent.matrixWorld).invert();
    const { world0: oW, axisWorld: uW } = constraintGuide;
    const originLocal = oW.clone().applyMatrix4(inv);
    const axisLocal = uW.clone().transformDirection(inv).normalize();
    const a = originLocal.clone().addScaledVector(axisLocal, -CONSTRAINT_LINE_HALF_LOCAL);
    const b = originLocal.clone().addScaledVector(axisLocal, CONSTRAINT_LINE_HALF_LOCAL);
    linePoints = [
      [a.x, a.y, a.z],
      [b.x, b.y, b.z]
    ];
  }

  return (
    <>
      {linePoints && (
        <Line
          points={linePoints}
          color="#f3d5a3"
          lineWidth={1}
          dashed={false}
          depthTest={false}
          renderOrder={10}
          opacity={0.5}
          transparent
        />
      )}
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <sphereGeometry args={[radius, 20, 20]} />
        <meshStandardMaterial color="#fbf0df" metalness={0.15} roughness={0.55} />
      </mesh>
    </>
  );
};

const replacePositionInArray = (array: Vector3[], index: number, newPosition: Vector3) =>
  array.map((p, i) => (i === index ? newPosition.clone() : p.clone()));

const RADIUS = 0.01;
const CONSTRAINT = 'z';

export const ControlPoints: React.FC<{
  positions: Vector3[];
  onChange: (newPositions: Vector3[]) => void;
  radius?: number;
  constraint?: 'x' | 'y' | 'z';
}> = ({ positions, onChange, radius = RADIUS, constraint = CONSTRAINT }) => (
  <group>
    {positions.map((pos, index) => (
      <ControlPoint
        key={index}
        constraint={constraint}
        position={pos}
        onChange={(newPosition) => onChange(replacePositionInArray(positions, index, newPosition))}
        radius={radius}
      />
    ))}
  </group>
);
