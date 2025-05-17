export default class Vec2 {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static zero(): Vec2 {
    return new Vec2(0, 0);
  }

  static one(): Vec2 {
    return new Vec2(1, 1);
  }

  static fromAngle(angle: number): Vec2 {
    return new Vec2(Math.cos(angle), Math.sin(angle));
  }

  /** Map a noise sample in [-1; 1] to a unit vector */
  static fromNoise(n: number): Vec2 {
    n = Math.max(-1, Math.min(1, n));
    const angle = (n + 1) * Math.PI;
    return Vec2.fromAngle(angle);
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  addMut(v: Vec2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  subMut(v: Vec2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mul(v: Vec2): Vec2 {
    return new Vec2(this.x * v.x, this.y * v.y);
  }

  mulMut(v: Vec2): this {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  scale(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s);
  }

  scaleMut(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }

  eq(v: Vec2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  len(): number {
    return Math.hypot(this.x, this.y);  // Math.sqrt(x² + y²)
  }

  lenSqr(): number {
    return this.x * this.x + this.y * this.y
  }

  normalize(): Vec2 {
    const len = this.len();
    return len === 0 ? Vec2.zero() : this.scale(1 / len);
  }

  distTo(v: Vec2): number {
    return v.sub(this).len();
  }

  dirTo(v: Vec2): Vec2 {
    return v.sub(this).normalize();
  }

  dot(v: Vec2): number {
    return this.x * v.x + this.y * v.y;
  }

  toString(): string {
    return `Vec2(${this.x.toFixed(3)}, ${this.y.toFixed(3)})`;
  }

  toArray(): number[] {
    return [this.x, this.y];
  }

  toObject(): { x: number; y: number } {
    return {
      x: this.x,
      y: this.y
    }
  }
}
