import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import { Vec2 } from "./vec";

interface State {
  ctx: CanvasRenderingContext2D,
  lastTs: number,
  noise: NoiseFunction2D,
  vecs: Vec2[]
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

  state.vecs[0].draw(
    state.ctx,
    new Vec2(100, 100),
    {
      lineColor: "#000",
      lineWidth: 1,
      markerSettings: {
        tailColor: "000",
        tailLength: 10
      }
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
    vecs: []
  };
  state.vecs.push(Vec2.fromAngle(0).scaleMut(100));
  requestAnimationFrame((ts) => render(ts, state));
}

main();
