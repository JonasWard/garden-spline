import { Box3, Color, OrthographicCamera, Scene, Vector2, Vector3, type WebGLRenderer } from 'three';

import {
  CONFIGURATOR_WORLD_MATRIX,
  localBoxCornerPoints,
  worldBoxFromLocalBox
} from '../view/fit-camera-to-box';

export type OrthographicViewId = 'top' | 'front' | 'left';

export type OrthographicViewCaptures = Record<OrthographicViewId, string>;

const TMP = {
  center: new Vector3(),
  size: new Vector3(),
  corner: new Vector3()
};

const VIEW_EYE: Record<OrthographicViewId, Vector3> = {
  top: new Vector3(0, 1, 0),
  front: new Vector3(0, 0, 1),
  left: new Vector3(-1, 0, 0)
};

const VIEW_UP: Record<OrthographicViewId, Vector3> = {
  top: new Vector3(0, 0, 1),
  front: new Vector3(0, 1, 0),
  left: new Vector3(0, 1, 0)
};

const frameOrthoOnWorldBox = (
  camera: OrthographicCamera,
  localBox: Box3,
  worldBox: Box3,
  eyeDir: Vector3,
  up: Vector3,
  margin = 1.18
) => {
  const center = worldBox.getCenter(TMP.center);
  const size = worldBox.getSize(TMP.size);
  const distance = Math.max(size.length() * 2, 8);

  camera.position.copy(center).addScaledVector(eyeDir, distance);
  camera.up.copy(up);
  camera.lookAt(center);
  camera.updateMatrixWorld();

  const inv = camera.matrixWorldInverse;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const localCorner of localBoxCornerPoints(localBox)) {
    TMP.corner.copy(localCorner).applyMatrix4(CONFIGURATOR_WORLD_MATRIX);
    TMP.corner.applyMatrix4(inv);
    minX = Math.min(minX, TMP.corner.x);
    maxX = Math.max(maxX, TMP.corner.x);
    minY = Math.min(minY, TMP.corner.y);
    maxY = Math.max(maxY, TMP.corner.y);
    minZ = Math.min(minZ, TMP.corner.z);
    maxZ = Math.max(maxZ, TMP.corner.z);
  }

  const pad = margin * 0.5 * Math.max(maxX - minX, maxY - minY, 0.01);
  camera.left = minX - pad;
  camera.right = maxX + pad;
  camera.top = maxY + pad;
  camera.bottom = minY - pad;
  camera.near = Math.max(0.1, -maxZ - 50);
  camera.far = -minZ + 50;
  camera.updateProjectionMatrix();
};

/** Render top / front / left orthographic screenshots (world space, white background). */
export const captureOrthographicViews = (
  gl: WebGLRenderer,
  scene: Scene,
  localBox: Box3,
  size: { width: number; height: number }
): OrthographicViewCaptures => {
  const worldBox = worldBoxFromLocalBox(localBox, CONFIGURATOR_WORLD_MATRIX);
  const camera = new OrthographicCamera();
  const prevSize = new Vector2();
  gl.getSize(prevSize);
  const prevPixelRatio = gl.getPixelRatio();
  const prevBackground = scene.background;
  const prevClear = new Color();
  gl.getClearColor(prevClear);
  const prevClearAlpha = gl.getClearAlpha();

  gl.setPixelRatio(1);
  gl.setSize(size.width, size.height, false);
  scene.background = new Color(0xffffff);
  gl.setClearColor(0xffffff, 1);

  const out = {} as OrthographicViewCaptures;

  try {
    for (const view of ['top', 'front', 'left'] as const) {
      frameOrthoOnWorldBox(camera, localBox, worldBox, VIEW_EYE[view], VIEW_UP[view]);
      gl.render(scene, camera);
      out[view] = gl.domElement.toDataURL('image/png');
    }
  } finally {
    gl.setPixelRatio(prevPixelRatio);
    gl.setSize(prevSize.x, prevSize.y, false);
    scene.background = prevBackground;
    gl.setClearColor(prevClear, prevClearAlpha);
  }

  return out;
};
