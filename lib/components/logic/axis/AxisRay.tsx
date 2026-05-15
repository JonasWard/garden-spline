import { AxisRay } from '../../types/axis';
import { InfiniteLine2dRenderer } from '../geometry/InfiniteLine2dRenderer';
import { FiniteLine2dRenderer } from '../geometry/FiniteLine2dRenderer';

export const AxisRay2D: React.FC<{ ray: AxisRay }> = ({ ray }) => (
  <>
    <InfiniteLine2dRenderer line={ray} />
    <FiniteLine2dRenderer line={{ start: ray.origin, end: ray.origin.clone().add(ray.spacingDirection) }} />
  </>
);
