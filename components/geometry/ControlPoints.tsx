'use client';

import { useR3FStore } from '@/store/r3f-store';
import { Html, Line } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Camera, Mesh, Object3D } from 'three';
import { Matrix4, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three';
import { NumericInput } from '../ui/shared/NumericInput';
import { evaluateParameterAt, infiniteLineIntersection } from '@/lib/components/logic/geometry/line3d';

type ConstraintAxis = 'x' | 'y' | 'z';

type ConstraintGuide = { world0: Vector3; axisWorld: Vector3 };

type DragState = {
  pointerId: number;
  world0: Vector3;
  axisWorld: Vector3;
  captureTarget: HTMLElement;
};

const CONSTRAINT_LINE_HALF = 400;
const AXIS_INPUT_OFFSET_X = 30;
const AXIS_INPUT_HEIGHT_PX = 30;
const DEFAULT_SCREEN_RADIUS_PX = 5;
const SPHERE_GEOMETRY_RADIUS = 1;

const AXIS: Record<ConstraintAxis, Vector3> = {
  x: new Vector3(1, 0, 0),
  y: new Vector3(0, 1, 0),
  z: new Vector3(0, 0, 1)
};

const TMP = {
  screen: new Vector3(),
  mesh: new Vector3(),
  cam: new Vector3(),
  hit: new Vector3()
};

const GUIDE_LINE_PROPS = {
  color: '#f3d5a3',
  lineWidth: 1,
  dashed: false as const,
  depthTest: false,
  renderOrder: 10,
  opacity: 0.5,
  transparent: true
};

function axisWorldInParent(parent: Object3D, axis: ConstraintAxis): Vector3 {
  return AXIS[axis].clone().transformDirection(parent.matrixWorld).normalize();
}

function constraintLineLocal(parent: Object3D, world0: Vector3, axisWorld: Vector3): [number, number, number][] {
  parent.updateWorldMatrix(true, true);
  const inv = new Matrix4().copy(parent.matrixWorld).invert();
  const o = world0.clone().applyMatrix4(inv);
  const u = axisWorld.clone().transformDirection(inv).normalize();
  const a = o.clone().addScaledVector(u, -CONSTRAINT_LINE_HALF);
  const b = o.clone().addScaledVector(u, CONSTRAINT_LINE_HALF);
  return [
    [a.x, a.y, a.z],
    [b.x, b.y, b.z]
  ];
}

function axisInputScreenPosition(el: Object3D, camera: Camera, size: { width: number; height: number }): number[] {
  TMP.screen.setFromMatrixPosition(el.matrixWorld).project(camera);
  const hw = size.width / 2;
  const hh = size.height / 2;
  return [TMP.screen.x * hw + hw + AXIS_INPUT_OFFSET_X, -TMP.screen.y * hh + hh - AXIS_INPUT_HEIGHT_PX / 2];
}

function screenSpaceSphereScale(
  mesh: Mesh,
  camera: Camera,
  size: { width: number; height: number },
  screenRadiusPx: number
): number {
  mesh.getWorldPosition(TMP.mesh);
  camera.getWorldPosition(TMP.cam);
  const dist = TMP.mesh.distanceTo(TMP.cam);
  if (camera instanceof PerspectiveCamera) {
    const vFov = (camera.fov * Math.PI) / 180;
    return (screenRadiusPx * 2 * dist * Math.tan(vFov / 2)) / (size.height * SPHERE_GEOMETRY_RADIUS);
  }
  if (camera instanceof OrthographicCamera) {
    return (screenRadiusPx * (camera.top - camera.bottom)) / camera.zoom / (size.height * SPHERE_GEOMETRY_RADIUS);
  }
  return SPHERE_GEOMETRY_RADIUS;
}

function releaseCapture(target: HTMLElement | undefined, pointerId: number) {
  try {
    target?.releasePointerCapture?.(pointerId);
  } catch {
    //
  }
}

const ConstraintGuideLine: React.FC<{ points: [number, number, number][] }> = ({ points }) => (
  <Line points={points} {...GUIDE_LINE_PROPS} />
);

const ControlPoint: React.FC<{
  position: Vector3;
  onChange: (position: Vector3) => void;
  screenRadiusPx: number;
}> = ({ position, onChange, screenRadiusPx }) => {
  const meshRef = useRef<Mesh>(null);
  const axisInputRef = useRef<HTMLInputElement>(null);
  const skipCommitOnBlur = useRef(false);
  const drag = useRef<DragState | null>(null);

  const constraint = useR3FStore((s) => s.controlPointConstraint);
  const setEnableOrbitConrol = useR3FStore((s) => s.setEnableOrbitConrol);

  const [guide, setGuide] = useState<ConstraintGuide | null>(null);
  const [dragLocal, setDragLocal] = useState<Vector3 | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const interacting = guide !== null || inputFocused;
  const display = dragLocal ?? position;

  useEffect(() => {
    setEnableOrbitConrol(!interacting);
  }, [interacting, setEnableOrbitConrol]);

  const commitAxis = useCallback(
    (value: number) => {
      const next = position.clone();
      next[constraint] = value;
      onChange(next);
    },
    [constraint, onChange, position]
  );

  const finishDrag = useCallback(
    (pointerId: number, commit: boolean) => {
      const d = drag.current;
      if (!d || d.pointerId !== pointerId) return;
      releaseCapture(d.captureTarget, pointerId);
      drag.current = null;
      setGuide(null);
      setDragLocal((prev) => {
        if (commit && prev) onChange(prev);
        return null;
      });
    },
    [onChange]
  );

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const mesh = meshRef.current;
      const parent = mesh?.parent;
      if (!mesh || !parent) return;

      parent.updateWorldMatrix(true, true);
      const world0 = mesh.getWorldPosition(new Vector3());
      const axisWorld = axisWorldInParent(parent, constraint);
      const captureTarget = e.target as HTMLElement;

      drag.current = { pointerId: e.pointerId, world0, axisWorld, captureTarget };
      setGuide({ world0: world0.clone(), axisWorld: axisWorld.clone() });
      setDragLocal(null);
      captureTarget.setPointerCapture?.(e.pointerId);
    },
    [constraint]
  );

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId || (e.buttons & 1) === 0) return;
    e.stopPropagation();

    const parent = meshRef.current?.parent;
    if (!parent) return;

    if (dragPositionOnAxis(d, e.ray, parent, TMP.hit)) setDragLocal(TMP.hit.clone());
  }, []);

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      finishDrag(e.pointerId, true);
    },
    [finishDrag]
  );

  const onPointerCancel = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      finishDrag(e.pointerId, false);
    },
    [finishDrag]
  );

  useEffect(() => {
    if (!guide) return;
    const onEscape = (ev: globalThis.KeyboardEvent) => {
      if (ev.key !== 'Escape') return;
      const pid = drag.current?.pointerId;
      if (pid !== undefined) finishDrag(pid, false);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [guide, finishDrag]);

  useFrame(({ camera, size }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.updateWorldMatrix(true, false);
    mesh.scale.setScalar(screenSpaceSphereScale(mesh, camera, size, screenRadiusPx));
  });

  const linePoints =
    interacting && meshRef.current?.parent
      ? guide
        ? constraintLineLocal(meshRef.current.parent, guide.world0, guide.axisWorld)
        : constraintLineLocal(
            meshRef.current.parent,
            meshRef.current.getWorldPosition(TMP.mesh),
            axisWorldInParent(meshRef.current.parent, constraint)
          )
      : null;

  return (
    <>
      {linePoints && <ConstraintGuideLine points={linePoints} />}
      <mesh
        ref={meshRef}
        position={display}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <sphereGeometry args={[SPHERE_GEOMETRY_RADIUS, 20, 20]} />
        <meshStandardMaterial color="#fbf0df" metalness={0.15} roughness={0.55} />
        <Html
          transform={false}
          calculatePosition={axisInputScreenPosition}
          style={{ pointerEvents: 'auto' }}
          zIndexRange={[100, 0]}
          occlude={false}
        >
          <NumericInput
            inputRef={axisInputRef}
            value={display[constraint]}
            onChange={commitAxis}
            step={0.001}
            onFocus={() => setInputFocused(true)}
            onBlur={() => {
              setInputFocused(false);
              if (skipCommitOnBlur.current) {
                skipCommitOnBlur.current = false;
                return false;
              }
            }}
          />
        </Html>
      </mesh>
    </>
  );
};

function dragPositionOnAxis(
  drag: DragState,
  ray: { origin: Vector3; direction: Vector3 },
  parent: Object3D,
  out: Vector3
): boolean {
  const axis = { origin: drag.world0, direction: drag.axisWorld };
  const hit = infiniteLineIntersection(axis, { origin: ray.origin, direction: ray.direction });
  if (!hit) return false;
  out.copy(evaluateParameterAt(axis, hit[0]));
  parent.worldToLocal(out);
  return true;
}

export const ControlPoints: React.FC<{
  positions: Vector3[];
  onChange: (positions: Vector3[]) => void;
  screenRadiusPx?: number;
}> = ({ positions, onChange, screenRadiusPx = DEFAULT_SCREEN_RADIUS_PX }) => (
  <group>
    {positions.map((pos, i) => (
      <ControlPoint
        key={i}
        position={pos}
        onChange={(p) => onChange(positions.map((v, j) => (j === i ? p.clone() : v.clone())))}
        screenRadiusPx={screenRadiusPx}
      />
    ))}
  </group>
);
