import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import { Vec2d, type Rect } from "./vec2d";
import { Ray2d } from "./ray2d";

interface Flowline {
  path: Ray2d[]
}

interface State {
  ctx: CanvasRenderingContext2D,
  lastTs: number,
  noise: NoiseFunction2D,
  rays: Ray2d[],
  rects: Rect[],
  flowlines: Flowline[],
  smoothness: number
};

function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function render(ts: number, state: State): void {
  const dt = (ts - state.lastTs) / 1000;
  state.lastTs = ts;

  state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height);
  state.ctx.fillStyle = "#ccd5ae";
  state.ctx.fillRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height);

  state.rects.forEach(rect => {
    state.ctx.beginPath();
    state.ctx.rect(rect.minX, rect.minY, rect.maxX, rect.maxY);
    state.ctx.stroke();
  })

  state.ctx.fillText(`dt: ${dt.toFixed(2)}ms`, 10, 20);

  state.rays.forEach(ray => {
    // ray.dir.rotateMut((Math.PI) * dt);
    ray.draw(state.ctx, {
      lineColor: "#181818",
      lineWidth: 1,
      markerSettings: {
        tailColor: "#181818",
        tailLength: 5
      }
    });
  });

  // state.rays[0].dir.rotateMut(((2 * Math.PI) / 5) * dt);

  const raycastRes = state.rays[0].raycast({
    minX: 20,
    maxX: state.ctx.canvas.width - 20,
    minY: 20,
    maxY: state.ctx.canvas.height - 20,
  });

  if (raycastRes !== null) {
    const [intersection] = raycastRes;
    intersection.drawPoint(state.ctx, 5, "#f00");
  }

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
    rects: [],
    flowlines: [],
    smoothness: 0.001
  };

  // for (let y = 0; y < state.ctx.canvas.height; y += 20) {
  //   for (let x = 0; x < state.ctx.canvas.width; x += 20) {
  //     const ray: Ray2d = new Ray2d(
  //       new Vec2d(x, y),
  //       Vec2d.fromNoise(state.noise(x * state.smoothness, y * state.smoothness)).scaleMut(10),
  //       true
  //     )
  //     state.rays.push(ray);
  //   }
  // }
  state.rects.push({
    get maxX() { return state.ctx.canvas.width - 40 },
    minX: 20,
    get maxY() { return state.ctx.canvas.height - 40 },
    minY: 20
  })

  const center = Ray2d.center(
    {
      minX: 0,
      maxX: state.ctx.canvas.width,
      minY: 0,
      maxY: state.ctx.canvas.height,
    }
  );
  center.dir.scaleMut(10);
  center.dir.rotateMut(Math.PI + 0.1);

  state.rays.push(center);

  requestAnimationFrame((ts) => render(ts, state));
}

main();
