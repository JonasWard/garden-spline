import { Vector2 } from 'three';
import { InfiniteLine2D } from './line2d';
import { Line } from '@react-three/drei';

const InfiniteColor = '#00ff00';
const InfiniteLength = 1e3;

const getInfiniteLine = (o: Vector2, d: Vector2): Vector2[] => [
  o.clone().add(d.clone().multiplyScalar(-InfiniteLength)),
  o.clone().add(d.clone().multiplyScalar(InfiniteLength))
];

export const InfiniteLine2dRenderer: React.FC<{ line: InfiniteLine2D }> = ({ line }) => (
  <Line
    points={getInfiniteLine(line.origin, line.direction)}
    color={InfiniteColor}
    lineWidth={1}
    dashed={false}
    depthTest
    transparent
    opacity={0.9}
  />
);
