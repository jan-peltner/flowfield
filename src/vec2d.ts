export interface Rect {
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
};

export interface MarkerSettings {
  tailColor: string,
  tailLength: number
};

export interface DrawSettings {
  lineWidth: number,
  lineColor: string,
  markerSettings?: MarkerSettings
};

export class Vec2d {
  public x: number;
  public y: number;

  public static drawSettings: DrawSettings = {
    lineWidth: 1,
    lineColor: "#000",
    markerSettings: {
      tailColor: "red",
      tailLength: 5
    }
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public static zero(): Vec2d {
    return new Vec2d(0, 0);
  }

  public static one(): Vec2d {
    return new Vec2d(1, 1);
  }

  public static center(rect: Rect): Vec2d {
    return new Vec2d(
      (rect.minX + rect.maxX) / 2,
      (rect.minY + rect.maxY) / 2
    );
  }

  public static random(rect: Rect): Vec2d {
    const x = Math.floor(Math.random() * (rect.maxX - rect.minX + 1)) + rect.minX;
    const y = Math.floor(Math.random() * (rect.maxY - rect.minY + 1)) + rect.minY;
    return new Vec2d(x, y);
  }

  public static fromAngle(angle: number): Vec2d {
    return new Vec2d(Math.cos(angle), Math.sin(angle));
  }

  /** Map a noise sample in [-1; 1] to a unit vector */
  public static fromNoise(n: number): Vec2d {
    n = Math.max(-1, Math.min(1, n));
    const angle = (n + 1) * Math.PI;
    return Vec2d.fromAngle(angle);
  }

  public clone(): Vec2d {
    return new Vec2d(this.x, this.y);
  }

  public add(v: Vec2d): Vec2d {
    return new Vec2d(this.x + v.x, this.y + v.y);
  }

  public addMut(v: Vec2d): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  public sub(v: Vec2d): Vec2d {
    return new Vec2d(this.x - v.x, this.y - v.y);
  }

  public subMut(v: Vec2d): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  public mul(v: Vec2d): Vec2d {
    return new Vec2d(this.x * v.x, this.y * v.y);
  }

  public mulMut(v: Vec2d): this {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  public scale(s: number): Vec2d {
    return new Vec2d(this.x * s, this.y * s);
  }

  public scaleMut(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }

  /*
  * | a c |
  * | b d | 
  */

  public transform(a: number, b: number, c: number, d: number): Vec2d {
    return new Vec2d(
      this.x * a + this.y * c,
      this.x * b + this.y * d
    );
  }

  public transformMut(a: number, b: number, c: number, d: number): this {
    const x = this.x;
    const y = this.y;

    this.x = x * a + y * c;
    this.y = x * b + y * d;
    return this;
  }

  /* rotation matrix: 
   * cos(theta) -sin(theta)
   * sin(theta) cos(theta)
   */

  /** Performs a mathematical counterclockwise rotation that appears clockwise on canvas
   * because the y-axis is flipped
   */
  public rotate(angle: number): Vec2d {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return this.transform(cos, sin, -sin, cos);
  }

  /** Performs a mathematical counterclockwise rotation that appears clockwise on canvas
   * because the y-axis is flipped
   */
  public rotateMut(angle: number): this {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this.transformMut(cos, sin, -sin, cos);
    return this;
  }

  public map(fn: (comp: number, index: 0 | 1) => number): this {
    this.x = fn(this.x, 0);
    this.y = fn(this.y, 1);
    return this;
  }

  public mapMut(fn: (comp: number, index: 0 | 1) => number): Vec2d {
    return new Vec2d(fn(this.x, 0), fn(this.y, 1));
  }

  public angle(): number {
    return Math.atan2(this.y, this.x);
  }

  public eq(v: Vec2d, epsilon: number = 1e-6): boolean {
    return Math.abs(this.x - v.x) <= epsilon && Math.abs(this.y - v.y) <= epsilon;
  }

  public len(): number {
    return Math.hypot(this.x, this.y);
  }

  public lenSqr(): number {
    return this.x * this.x + this.y * this.y
  }

  public normalize(): Vec2d {
    const len = this.len();
    return len === 0 ? Vec2d.zero() : this.scale(1 / len);
  }

  public normalizeMut(): this {
    const len = this.len();
    if (len === 0) {
      this.x = 0;
      this.y = 0;
    } else {
      this.scaleMut(1 / len);
    }
    return this;
  }

  public to(v: Vec2d): Vec2d {
    return v.sub(this);
  }

  public distTo(v: Vec2d): number {
    return this.to(v).len();
  }

  public dirTo(v: Vec2d): Vec2d {
    return v.sub(this).normalize();
  }

  public dot(v: Vec2d): number {
    return this.x * v.x + this.y * v.y;
  }

  public cross(v: Vec2d): number {
    return this.x * v.y - this.y * v.x;
  }

  public toString(): string {
    return `Vec2(${this.x.toFixed(3)}, ${this.y.toFixed(3)})`;
  }

  public toArray(): number[] {
    return [this.x, this.y];
  }

  public toObject(): { x: number; y: number } {
    return {
      x: this.x,
      y: this.y
    }
  }

  private drawLine(
    ctx: CanvasRenderingContext2D,
    width: number,
    origin: Vec2d,
    color = "#000"
  ): void {
    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + this.x, origin.y + this.y);
    ctx.stroke();

    ctx.restore();
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    origin: Vec2d,
    settings: DrawSettings = Vec2d.drawSettings
  ) {
    // draw actual vector
    this.drawLine(ctx, settings.lineWidth, origin, settings.lineColor);

    // optionally draw marker
    if (settings.markerSettings) {
      ctx.save();

      const perpVec = this.normalize().rotateMut(Math.PI / 2).scaleMut(settings.markerSettings.tailLength);
      const perpOppVec = perpVec.scale(-1).normalize().scale(perpVec.len() * 0.5);
      perpVec.drawLine(ctx, 1, origin.add(perpOppVec), settings.markerSettings.tailColor);

      ctx.restore();
    }

  }

  public drawPoint(ctx: CanvasRenderingContext2D, radius: number = 2, color: string = "#000") {
    ctx.save();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }
}
