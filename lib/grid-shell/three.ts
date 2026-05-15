import type { Quad } from './types';
import { BufferAttribute, BufferGeometry, Vector3 } from 'three';

export function quadMeshGeometry(vertices: Vector3[], faces: Quad[]) {
  const positions = new Float32Array(vertices.length * 3);
  for (let i = 0; i < vertices.length; i++) {
    const p = vertices[i]!;
    positions[i * 3 + 0] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  }

  const triCount = faces.length * 2;
  const indexArray = vertices.length > 65535 ? new Uint32Array(triCount * 3) : new Uint16Array(triCount * 3);

  let k = 0;
  for (const [a, b, c, d] of faces) {
    indexArray[k++] = a;
    indexArray[k++] = b;
    indexArray[k++] = c;
    indexArray[k++] = a;
    indexArray[k++] = c;
    indexArray[k++] = d;
  }

  const geom = new BufferGeometry();
  geom.setAttribute('position', new BufferAttribute(positions, 3));
  geom.setIndex(new BufferAttribute(indexArray as any, 1));
  geom.computeVertexNormals();
  return geom;
}
