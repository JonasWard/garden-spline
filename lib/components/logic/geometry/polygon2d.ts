import { Vector2 } from 'three';

export type Polygon2D = Vector2[];

/** is point inside, using winding number */
export const isPointInside = (polygon: Polygon2D, point: Vector2): boolean => {
  // Winding number algorithm
  let windingNumber = 0;
  const n = polygon.length;
  if (n < 3) return false; // Not a polygon.

  for (let i = 0; i < n; i++) {
    const v1 = polygon[i]!;
    const v2 = polygon[(i + 1) % n]!;

    if (Math.abs(v1.y - v2.y) < 1e-10 && Math.abs(point.y - v1.y) < 1e-10) {
      // If the point is colinear with one of the polygon's horizontal edges, check if it is within the x bounds.
      if (point.x >= Math.min(v1.x, v2.x) && point.x <= Math.max(v1.x, v2.x)) {
        return true; // On edge.
      }
    }
    // Check if an upward or downward crossing
    if (v1.y <= point.y) {
      if (v2.y > point.y) {
        // Upward crossing
        const isLeft = (v2.x - v1.x) * (point.y - v1.y) - (point.x - v1.x) * (v2.y - v1.y);
        if (isLeft > 0) {
          ++windingNumber;
        } else if (isLeft === 0) {
          // On edge
          return true;
        }
      }
    } else {
      if (v2.y <= point.y) {
        // Downward crossing
        const isLeft = (v2.x - v1.x) * (point.y - v1.y) - (point.x - v1.x) * (v2.y - v1.y);
        if (isLeft < 0) {
          --windingNumber;
        } else if (isLeft === 0) {
          // On edge
          return true;
        }
      }
    }
  }
  return windingNumber !== 0;
};
