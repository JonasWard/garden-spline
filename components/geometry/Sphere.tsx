import { Vector2, Vector3 } from 'three';

export const Sphere: React.FC<{ origin: Vector2 | Vector3; color?: string; radius?: number }> = ({
  origin,
  color = '#fbf0df',
  radius = 0.01
}) => (
  <mesh position={[origin.x, origin.y, (origin as Vector3)?.z ?? 0]}>
    <sphereGeometry args={[radius, 20, 20]} />
    <meshStandardMaterial color={color} metalness={0.15} roughness={0.55} />
  </mesh>
);
