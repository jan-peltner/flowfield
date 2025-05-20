export interface MarkerSettings {
  tailColor: string,
  tailLength: number
};

export interface DrawSettings {
  lineWidth: number,
  lineColor: string,
  markerSettings?: MarkerSettings
};

export class Vec2 {
  public x: number;
  public y: number;

  private static drawSettings: DrawSettings = {
    lineWidth: 1,
    lineColor: "000",
    markerSettings: {
      tailColor: "red",
      tailLength: 5
    }
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public static zero(): Vec2 {
    return new Vec2(0, 0);
  }

  public static one(): Vec2 {
    return new Vec2(1, 1);
  }

  public static fromAngle(angle: number): Vec2 {
    return new Vec2(Math.cos(angle), Math.sin(angle));
  }

  /** Map a noise sample in [-1; 1] to a unit vector */
  public static fromNoise(n: number): Vec2 {
    n = Math.max(-1, Math.min(1, n));
    const angle = (n + 1) * Math.PI;
    return Vec2.fromAngle(angle);
  }

  public clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  public add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  public addMut(v: Vec2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  public sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  public subMut(v: Vec2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  public mul(v: Vec2): Vec2 {
    return new Vec2(this.x * v.x, this.y * v.y);
  }

  public mulMut(v: Vec2): this {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  public scale(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s);
  }

  public scaleMut(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }

  // rotation matrix: 
  // cos(theta) -sin(theta)
  // sin(theta) cos(theta)

  /** Performs a mathematical counterclockwise rotation that appears clockwise on canvas
   * because the y-axis is flipped
   */
  public rotate(angle: number): Vec2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  /** Performs a mathematical counterclockwise rotation that appears clockwise on canvas
   * because the y-axis is flipped
   */
  public rotateMut(angle: number): this {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x;
    const y = this.y;
    this.x = x * cos - y * sin;
    this.y = x * sin + y * cos;
    return this;
  }

  public angle(): number {
    return Math.atan2(this.y, this.x);
  }

  public eq(v: Vec2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  public len(): number {
    return Math.hypot(this.x, this.y);  // Math.sqrt(x² + y²)
  }

  public lenSqr(): number {
    return this.x * this.x + this.y * this.y
  }

  public normalize(): Vec2 {
    const len = this.len();
    return len === 0 ? Vec2.zero() : this.scale(1 / len);
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

  public to(v: Vec2): Vec2 {
    return v.sub(this);
  }

  public distTo(v: Vec2): number {
    return this.to(v).len();
  }

  public dirTo(v: Vec2): Vec2 {
    return v.sub(this).normalize();
  }

  public dot(v: Vec2): number {
    return this.x * v.x + this.y * v.y;
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
    origin: Vec2,
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
    origin: Vec2,
    settings: DrawSettings = Vec2.drawSettings
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
