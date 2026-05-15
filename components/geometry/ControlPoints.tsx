'use client';

import { useR3FStore } from '@/store/r3f-store';
import { Html, Line } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { Camera, Mesh, Object3D } from 'three';
import { Matrix4, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three';

/** Half-length of the constraint guide in parent **local** space (large segment ≈ “infinite” on screen). */
const CONSTRAINT_LINE_HALF_LOCAL = 400;

const AXIS: Record<'x' | 'y' | 'z', Vector3> = {
  x: new Vector3(1, 0, 0),
  y: new Vector3(0, 1, 0),
  z: new Vector3(0, 0, 1)
};

const TMP_W = new Vector3();
const TMP_TO_RAY = new Vector3();

/** Screen px from projected **control point center** to the **left** edge of the Z input (LTR). */
const Z_INPUT_SCREEN_OFFSET_X = 30;
/** Fixed on-screen height of the Z value field (CSS pixels; no `distanceFactor` so Html scale stays 1). */
const Z_INPUT_SCREEN_HEIGHT_PX = 30;
/** Target apparent sphere radius in CSS pixels (mesh uses unit geometry + per-frame scale). */
const CONTROL_POINT_SCREEN_RADIUS_PX = 5;
/** Sphere geometry radius (world scale is applied each frame for constant screen size). */
const CONTROL_POINT_GEOMETRY_RADIUS = 1;
const HTML_SCREEN_POS = new Vector3();
const SCREEN_SPHERE_MESH_POS = new Vector3();
const SCREEN_SPHERE_CAM_POS = new Vector3();

/** Projects the control **center** (Html group world origin), then places the field in screen px to its right. */
function calculateZInputScreenPosition(
  el: Object3D,
  camera: Camera,
  size: { width: number; height: number }
): number[] {
  HTML_SCREEN_POS.setFromMatrixPosition(el.matrixWorld);
  HTML_SCREEN_POS.project(camera);
  const widthHalf = size.width / 2;
  const heightHalf = size.height / 2;
  const centerX = HTML_SCREEN_POS.x * widthHalf + widthHalf;
  const centerY = -HTML_SCREEN_POS.y * heightHalf + heightHalf;
  const x = centerX + Z_INPUT_SCREEN_OFFSET_X;
  const y = centerY - Z_INPUT_SCREEN_HEIGHT_PX / 2;
  return [x, y];
}

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
  screenRadiusPx: number;
}> = ({ constraint, position, onChange, screenRadiusPx }) => {
  const meshRef = useRef<Mesh>(null);
  const zInputRef = useRef<HTMLInputElement>(null);
  const skipZCommitOnBlurRef = useRef(false);
  const [constraintGuide, setConstraintGuide] = useState<{
    world0: Vector3;
    axisWorld: Vector3;
  } | null>(null);
  const [dragLocal, setDragLocal] = useState<Vector3 | null>(null);
  const [zInputFocused, setZInputFocused] = useState(false);
  const [zDraft, setZDraft] = useState(() => position.z.toString());

  const activeCommand = constraintGuide !== null || zInputFocused;

  useEffect(() => {
    if (activeCommand) useR3FStore.getState().enableOrbitConrol && useR3FStore.setState({ enableOrbitConrol: false });
    else !useR3FStore.getState().enableOrbitConrol && useR3FStore.setState({ enableOrbitConrol: true });
  }, [activeCommand]);

  useEffect(() => {
    if (!zInputFocused) setZDraft(position.z.toString());
  }, [position.z, zInputFocused]);

  const drag = useRef<{
    pointerId: number;
    axisWorld: Vector3;
    world0: Vector3;
    captureTarget: HTMLElement;
  } | null>(null);

  const releaseCapture = useCallback((pointerId: number) => {
    const cap = drag.current?.captureTarget;
    if (!cap) return;
    try {
      cap.releasePointerCapture?.(pointerId);
    } catch {
      //
    }
  }, []);

  const finalizeZOnBlur = useCallback(() => {
    const parsed = Number(zDraft);
    if (Number.isFinite(parsed)) {
      onChange(new Vector3(position.x, position.y, parsed));
    } else {
      setZDraft(position.z.toString());
    }
  }, [onChange, position.x, position.y, position.z, zDraft]);

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

      const captureTarget = e.target as HTMLElement;
      drag.current = { pointerId: e.pointerId, axisWorld, world0, captureTarget };
      setConstraintGuide({ world0: world0.clone(), axisWorld: axisWorld.clone() });
      setDragLocal(null);
      captureTarget.setPointerCapture?.(e.pointerId);
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
      setDragLocal(local);
    },
    []
  );

  const endDragCommit = useCallback(
    (pointerId: number) => {
      if (drag.current?.pointerId !== pointerId) return;
      releaseCapture(pointerId);
      drag.current = null;
      setConstraintGuide(null);
      setDragLocal((prev) => {
        if (prev) onChange(prev);
        return null;
      });
    },
    [onChange, releaseCapture]
  );

  const endDragCancel = useCallback(
    (pointerId: number) => {
      if (drag.current?.pointerId !== pointerId) return;
      releaseCapture(pointerId);
      drag.current = null;
      setConstraintGuide(null);
      setDragLocal(null);
    },
    [releaseCapture]
  );

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      endDragCommit(e.pointerId);
    },
    [endDragCommit]
  );

  const onPointerCancel = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      endDragCancel(e.pointerId);
    },
    [endDragCancel]
  );

  useEffect(() => {
    if (!constraintGuide) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape') return;
      const pid = drag.current?.pointerId;
      if (pid === undefined) return;
      endDragCancel(pid);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [constraintGuide, endDragCancel]);

  const effective = dragLocal ?? position;

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

  useFrame(({ camera, size }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.updateWorldMatrix(true, false);
    mesh.getWorldPosition(SCREEN_SPHERE_MESH_POS);
    camera.getWorldPosition(SCREEN_SPHERE_CAM_POS);
    const dist = SCREEN_SPHERE_MESH_POS.distanceTo(SCREEN_SPHERE_CAM_POS);
    let worldRadius: number;
    if (camera instanceof PerspectiveCamera) {
      const vFov = (camera.fov * Math.PI) / 180;
      worldRadius =
        (screenRadiusPx * 2 * dist * Math.tan(vFov / 2)) / (size.height * CONTROL_POINT_GEOMETRY_RADIUS);
    } else if (camera instanceof OrthographicCamera) {
      const frustumH = (camera.top - camera.bottom) / camera.zoom;
      worldRadius = (screenRadiusPx * frustumH) / (size.height * CONTROL_POINT_GEOMETRY_RADIUS);
    } else {
      worldRadius = CONTROL_POINT_GEOMETRY_RADIUS;
    }
    mesh.scale.setScalar(worldRadius);
  });

  const onZInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      zInputRef.current?.blur();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setZDraft(position.z.toString());
      skipZCommitOnBlurRef.current = true;
      zInputRef.current?.blur();
    }
  };

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
        position={[effective.x, effective.y, effective.z]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <sphereGeometry args={[CONTROL_POINT_GEOMETRY_RADIUS, 20, 20]} />
        <meshStandardMaterial color="#fbf0df" metalness={0.15} roughness={0.55} />
        {constraint === 'z' && (
          <Html
            transform={false}
            calculatePosition={calculateZInputScreenPosition}
            style={{ pointerEvents: 'auto' }}
            zIndexRange={[100, 0]}
            occlude={false}
          >
            <input
              ref={zInputRef}
              type="number"
              step="any"
              className="box-border w-[4.5rem] rounded border border-white/25 bg-black/70 px-1.5 text-[11px] leading-none text-white tabular-nums outline-none focus:border-amber-300/80"
              style={{ height: Z_INPUT_SCREEN_HEIGHT_PX }}
              value={zDraft}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setZDraft(e.target.value)}
              onFocus={() => setZInputFocused(true)}
              onBlur={() => {
                setZInputFocused(false);
                if (skipZCommitOnBlurRef.current) {
                  skipZCommitOnBlurRef.current = false;
                  return;
                }
                finalizeZOnBlur();
              }}
              onKeyDown={onZInputKeyDown}
            />
          </Html>
        )}
      </mesh>
    </>
  );
};

const replacePositionInArray = (array: Vector3[], index: number, newPosition: Vector3) =>
  array.map((p, i) => (i === index ? newPosition.clone() : p.clone()));

const CONSTRAINT = 'z';

export const ControlPoints: React.FC<{
  positions: Vector3[];
  onChange: (newPositions: Vector3[]) => void;
  /** Apparent sphere radius in CSS pixels (default 5). */
  screenRadiusPx?: number;
  constraint?: 'x' | 'y' | 'z';
}> = ({ positions, onChange, screenRadiusPx = CONTROL_POINT_SCREEN_RADIUS_PX, constraint = CONSTRAINT }) => (
  <group>
    {positions.map((pos, index) => (
      <ControlPoint
        key={index}
        constraint={constraint}
        position={pos}
        onChange={(newPosition) => onChange(replacePositionInArray(positions, index, newPosition))}
        screenRadiusPx={screenRadiusPx}
      />
    ))}
  </group>
);
