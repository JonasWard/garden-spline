import { FiniteLine2D } from './line2d';
import { Line } from '@react-three/drei';

const FiniteColor = '#0000ff';

export const FiniteLine2dRenderer: React.FC<{ line: FiniteLine2D }> = ({ line }) => (
  <Line
    points={[line.start, line.end]}
    color={FiniteColor}
    lineWidth={10}
    dashed={false}
    depthTest
    transparent
    opacity={0.9}
  />
);
