import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import { Vec2d, type Rect } from "./vec2d";
import { Ray2d } from "./ray2d";

interface State {
  ctx: CanvasRenderingContext2D,
  lastTs: number,
  noise: NoiseFunction2D,
  rays: Ray2d[]
  smoothness: number
};

function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function render(ts: number, state: State): void {
  const dt = ts - state.lastTs;
  state.lastTs = ts;

  state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height);

  state.ctx.fillText(`dt: ${dt.toFixed(2)}ms`, 10, 20);

  state.rays.forEach(ray => {
    ray.draw(state.ctx);
  });

  requestAnimationFrame((ts) => render(ts, state));
}

function main(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas#main");
  if (!canvas) {
    console.error("No canvas found!");
    return;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("Could not get context from canvas!");
    return;
  }

  const noise = createNoise2D();

  window.addEventListener("resize", () => resizeCanvas(canvas));
  resizeCanvas(canvas);

  let state: State = {
    ctx: ctx,
    lastTs: 0,
    noise: noise,
    rays: [],
    smoothness: 0.001
  };

  for (let y = 0; y < state.ctx.canvas.height; y += 20) {
    for (let x = 0; x < state.ctx.canvas.width; x += 20) {
      const ray: Ray2d = new Ray2d(
        new Vec2d(x, y),
        Vec2d.fromNoise(state.noise(x * state.smoothness, y * state.smoothness)).scaleMut(10)
      )
      state.rays.push(ray);
    }
  }
  requestAnimationFrame((ts) => render(ts, state));
}

main();
