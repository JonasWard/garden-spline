import { Box3, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import type { OrbitControls } from 'three-stdlib';

const TMP = {
  center: new Vector3(),
  size: new Vector3(),
  direction: new Vector3()
};

/** Same as {@link GridShellScene} content root — maps editor Y-up control points to world space. */
export const CONFIGURATOR_WORLD_MATRIX = new Matrix4(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);

export const worldBoxFromLocalPoints = (points: Vector3[], matrix = CONFIGURATOR_WORLD_MATRIX): Box3 => {
  const box = new Box3();
  const v = new Vector3();
  for (const p of points) {
    v.copy(p).applyMatrix4(matrix);
    box.expandByPoint(v);
  }
  return box;
};

/** Eight corners of a local-space AABB (for camera framing). */
export const localBoxCornerPoints = (box: Box3): Vector3[] => {
  const { min, max } = box;
  return [
    new Vector3(min.x, min.y, min.z),
    new Vector3(max.x, min.y, min.z),
    new Vector3(min.x, max.y, min.z),
    new Vector3(max.x, max.y, min.z),
    new Vector3(min.x, min.y, max.z),
    new Vector3(max.x, min.y, max.z),
    new Vector3(min.x, max.y, max.z),
    new Vector3(max.x, max.y, max.z)
  ];
};

export const worldBoxFromLocalBox = (box: Box3, matrix = CONFIGURATOR_WORLD_MATRIX): Box3 =>
  worldBoxFromLocalPoints(localBoxCornerPoints(box), matrix);

/** Multiplier on fit distance when framing content on load (larger = farther). */
export const CAMERA_FIT_MARGIN = 1.2;

/** Frame a perspective camera + orbit controls on an axis-aligned world-space box. */
export const fitPerspectiveCameraToBox = (
  camera: PerspectiveCamera,
  controls: OrbitControls,
  box: Box3,
  margin = CAMERA_FIT_MARGIN
) => {
  if (box.isEmpty()) return;

  const center = box.getCenter(TMP.center);
  const size = box.getSize(TMP.size);
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6);

  const fovRad = (camera.fov * Math.PI) / 180;
  const fitHeightDistance = maxDim / (2 * Math.tan(fovRad / 2));
  const fitWidthDistance = fitHeightDistance / Math.max(camera.aspect, 1e-6);
  const distance = margin * Math.max(fitHeightDistance, fitWidthDistance);

  TMP.direction.subVectors(camera.position, controls.target);
  if (TMP.direction.lengthSq() < 1e-8) TMP.direction.set(1, 0.85, 1);
  TMP.direction.normalize();

  camera.position.copy(center).add(TMP.direction.multiplyScalar(distance));
  controls.target.copy(center);

  camera.near = Math.max(distance / 200, 0.01);
  camera.far = Math.max(distance * 200, camera.near + 1);
  camera.updateProjectionMatrix();
  controls.update();
};
