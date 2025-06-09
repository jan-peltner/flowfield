import { Vec2d, type Rect } from "./vec2d";
import { Ray2d } from "./ray2d";
import { Flowfield } from "./flowfield";

interface State {
  ctx: CanvasRenderingContext2D,
  lastTs: number,
  flowfield: Flowfield
};

function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function render(ts: number, state: State): void {
  const dt = (ts - state.lastTs) / 1000;
  state.lastTs = ts;

  state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height);
  // state.flowfield.drawNoise(0.01);
  state.flowfield.drawFlowlines();

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

  window.addEventListener("resize", () => resizeCanvas(canvas));
  resizeCanvas(canvas);

  const palette = [
    "#003049",
    "#d62828",
    "f77f00",
    "fcbf49",
    "eae2b7"
  ];

  const flowfield = Flowfield.createInstance(ctx, palette);
  flowfield.smoothness = 0.001;

  let state: State = {
    ctx,
    lastTs: 0,
    flowfield
  };

  for (let i = 0; i < 10000; ++i) {
    state.flowfield.flowlineFrom(Vec2d.random({
      minX: 0,
      minY: 0,
      maxX: state.ctx.canvas.width,
      maxY: state.ctx.canvas.height,
    }
    ))
  }

  requestAnimationFrame((ts) => render(ts, state));
}

main();
