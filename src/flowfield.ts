import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import { Vec2d, type DrawSettings } from "./vec2d";
import { Ray2d } from "./ray2d";

export interface Flowline {
  path: Ray2d[],
  color: Color,
  segmentIndex: number
};

export type Color = string;

export class Flowfield {
  private static instance: Flowfield | null = null;

  public static createInstance(ctx: CanvasRenderingContext2D, palette?: Color[]): Flowfield {
    if (Flowfield.instance !== null) {
      throw new Error("Flowfield instance already exists");
    }
    Flowfield.instance = new Flowfield(ctx, palette);
    return Flowfield.instance;
  }

  public static getInstance(): Flowfield {
    if (Flowfield.instance === null) {
      throw new Error("Flowfield instance has to be created first");
    }
    return Flowfield.instance;
  }

  private canvasCtx: CanvasRenderingContext2D;
  public readonly noiseFn: NoiseFunction2D;
  private noiseRays: Ray2d[] = [];
  public smoothness: number = 0.001;
  private flowlines: Flowline[] = [];
  private palette?: Color[];

  private constructor(ctx: CanvasRenderingContext2D, palette?: Color[]) {
    this.canvasCtx = ctx;
    this.noiseFn = createNoise2D();
    this.palette = palette;
  }

  private computeNoiseRays(resolution: number): void {
    // normalized resolution -> ..=1
    if (resolution < 0.01 || resolution > 1) throw new Error("resolution must be a value between 0.01 and 1");

    const stepX = this.canvasCtx.canvas.width * resolution;
    const stepY = this.canvasCtx.canvas.height * resolution;
    for (let y = 0; y < this.canvasCtx.canvas.height; y += stepY) {
      for (let x = 0; x < this.canvasCtx.canvas.width; x += stepX) {
        const ray: Ray2d = new Ray2d(
          new Vec2d(x, y),
          Vec2d.fromNoise(this.noiseFn(x * this.smoothness, y * this.smoothness)).scaleMut(10),
          false
        )
        this.noiseRays.push(ray);
      }
    }
  }

  public flowlineFrom(origin: Vec2d, segments: number = 50, segmentLen: number = 10): void {
    const originRay = new Ray2d(
      origin,
      Vec2d.fromNoise(this.noiseFn(origin.x * this.smoothness, origin.y * this.smoothness)),
      false
    );

    const color = this.palette?.[Math.floor(Math.random() * this.palette.length)] ?? "#000000";
    const line: Flowline = {
      path: [originRay],
      color,
      segmentIndex: 0
    };

    for (let i = 0; i < segments; ++i) {
      const lastRay = line.path[i];
      const newOrigin = lastRay.origin.add(lastRay.dir.scale(segmentLen));

      if (newOrigin.x < 0 || newOrigin.x >= this.canvasCtx.canvas.width || newOrigin.y < 0 || newOrigin.y >= this.canvasCtx.canvas.height) break;

      const newDir = Vec2d.fromNoise(this.noiseFn(newOrigin.x * this.smoothness, newOrigin.y * this.smoothness));
      line.path.push(new Ray2d(
        newOrigin,
        newDir,
        false
      ));
    }

    this.flowlines.push(line);
  }

  public drawFlowlines(width: number = 3): void {
    this.canvasCtx.save();
    this.canvasCtx.lineWidth = width;

    this.flowlines.forEach(flowline => {
      this.canvasCtx.strokeStyle = flowline.color;
      this.canvasCtx.beginPath();
      flowline.path.forEach((ray, idx) => {
        if (idx === 0) {
          this.canvasCtx.moveTo(ray.origin.x, ray.origin.y);
        } else {
          this.canvasCtx.lineTo(ray.origin.x, ray.origin.y);
        }
      })
      this.canvasCtx.stroke();
    });

    this.canvasCtx.restore();
  }

  public drawFlowlinesSegmentwise(width: number = 3): void {
    this.canvasCtx.save();
    this.canvasCtx.lineWidth = width;

    this.flowlines.forEach(flowline => {
      this.canvasCtx.strokeStyle = flowline.color;
      this.canvasCtx.beginPath();
      flowline.path.forEach((ray, idx) => {
        if (idx === 0) {
          this.canvasCtx.moveTo(ray.origin.x, ray.origin.y);
        } else if (idx <= flowline.segmentIndex) {
          this.canvasCtx.lineTo(ray.origin.x, ray.origin.y);
        }
      })
      this.canvasCtx.stroke();
      flowline.segmentIndex++;
    });

    this.canvasCtx.restore();
  }

  public drawNoise(resolution: number, drawSettings?: DrawSettings): void {
    // check if noise rays have already been computed
    if (this.noiseRays.length === 0) this.computeNoiseRays(resolution);

    this.noiseRays.forEach(ray => {
      ray.draw(this.canvasCtx, drawSettings);
    })
  }
}
