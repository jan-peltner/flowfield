import { Vec2d, type DrawSettings, type Rect } from "./vec2d";

export class Ray2d {
  public origin: Vec2d;
  public dir: Vec2d;
  public hasFiniteLength: boolean;

  constructor(origin: Vec2d, dir: Vec2d, hasFiniteLength: boolean = false) {
    this.origin = origin;
    this.dir = dir;
    this.hasFiniteLength = hasFiniteLength;
  };

  public static center(rect: Rect, hasFiniteLength = false): Ray2d {
    return new Ray2d(
      new Vec2d(
        (rect.minX + rect.maxX) / 2,
        (rect.minY + rect.maxY) / 2,
      ),
      Vec2d.fromAngle(0),
      hasFiniteLength
    )
  }

  public raycast(rect: Rect): null | [Vec2d, number] {
    if (this.dir.lenSqr() < 1e-12) return null;

    const scalars = [];
    // check right side
    if (this.dir.x > 0) scalars.push((rect.maxX - this.origin.x) / this.dir.x);
    // check left side
    if (this.dir.x < 0) scalars.push((rect.minX - this.origin.x) / this.dir.x);
    // check top side (bottom on canvas)
    if (this.dir.y > 0) scalars.push((rect.maxY - this.origin.y) / this.dir.y);
    // check bottom side (top on canvas)
    if (this.dir.y < 0) scalars.push((rect.minY - this.origin.y) / this.dir.y);

    const s = Math.min(...scalars.filter(s => s > 0));
    if (!isFinite(s) || this.hasFiniteLength && s > 1) return null;

    return [new Vec2d(this.origin.x + this.dir.x * s, this.origin.y + this.dir.y * s), s];
  }

  /* p(s) = this.orign + this.dir * s
   * q(t) = ray.origin + ray.dir * t
   * we have an intersection, if p(s) = q(t)
  */

  public intersect(ray: Ray2d): null | [Vec2d, number] {
    // this.origin -> ray.origin
    const thisToRay = ray.origin.sub(this.origin);

    const det = this.dir.cross(ray.dir);

    // rays don't intersect -> rays are parallel or co-linear
    if (det === 0) return null;

    // scalars to get to the intersection point
    const s = thisToRay.cross(ray.dir) / det;
    const t = thisToRay.cross(this.dir) / det;

    // intersection is not in the direction that ray/this faces
    if (s <= 0 || t <= 0) return null;

    const intersectionPoint = this.origin.add(this.dir.scale(s));

    // check if the intersection point lies within the length of both rays
    if (this.hasFiniteLength) {
      if (
        intersectionPoint.sub(this.origin).lenSqr() > this.dir.lenSqr() ||
        intersectionPoint.sub(ray.origin).lenSqr() > ray.dir.lenSqr()
      ) return null;
    }

    return [intersectionPoint, s];
  }

  public intersectClosest(rays: Ray2d[]): null | [Vec2d, Ray2d, number] {
    if (rays.length === 0) return null;

    let min = Number.MAX_VALUE;
    let vec: Vec2d | null = null;
    let ray: Ray2d | null = null;

    rays.forEach((r) => {
      if (this.origin.eq(r.origin) && this.dir.eq(r.dir)) return;

      const ret = this.intersect(r);

      if (ret !== null) {
        const [intersection, s] = ret;
        if (s < min) {
          min = s;
          vec = intersection;
          ray = r;
        }
      }

    })

    return vec !== null ? [vec, ray!, min] : null;
  }

  public draw(ctx: CanvasRenderingContext2D, settings: DrawSettings = Vec2d.drawSettings) {
    this.dir.draw(ctx, this.origin, settings);
  }

  public drawOrigin(ctx: CanvasRenderingContext2D, radius: number = 2, color: string = "#000") {
    this.origin.drawPoint(ctx, radius, color);
  }

  public drawIntersection(ctx: CanvasRenderingContext2D, ray: Ray2d) {
    const intersection = this.intersect(ray);
    if (intersection === null) return;

    const [vec] = intersection;
    vec.drawPoint(ctx);
  }

  public drawClosestIntersection(ctx: CanvasRenderingContext2D, rays: Ray2d[], radius: number = 2, color: string = "#f00") {
    const intersection = this.intersectClosest(rays);
    if (intersection === null) return;

    const [vec] = intersection;
    vec.drawPoint(ctx, radius, color);
  }
}
