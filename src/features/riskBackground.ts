import { prefersReducedMotion } from "@/lib/dom";

export interface RiskBackground {
  start: () => void;
  stop: () => void;
  resize: () => void;
}

const VERT_SRC = "attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}";
const FRAG_SRC = [
  "precision highp float;",
  "uniform vec2 u_res;uniform float u_time;",
  "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
  "float noise(vec2 p){vec2 i=floor(p),f=fract(p);",
  "float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));",
  "vec2 u=f*f*(3.-2.*f);",
  "return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}",
  "float fbm(vec2 p){float v=0.,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}",
  "void main(){",
  "vec2 uv=gl_FragCoord.xy/u_res.xy;",
  "vec2 p=uv*3.0;p.x*=u_res.x/u_res.y;",
  "float t=u_time*0.05;",
  "float n=fbm(p+vec2(t,t*0.7)+fbm(p*1.5-t*0.3));",
  "n=pow(n,1.6);",
  "float g=smoothstep(0.15,0.92,n);",
  "vec3 col=mix(vec3(0.015),vec3(0.40),g);",
  "gl_FragColor=vec4(col,1.0);}",
].join("\n");

const NOOP: RiskBackground = { start() {}, stop() {}, resize() {} };

/** WebGL sis/grain arka planı (risk testi). WebGL yoksa CSS yedeğine düşer. */
export function createRiskBackground(canvas: HTMLCanvasElement | null): RiskBackground {
  if (!canvas) return NOOP;

  let gl: WebGLRenderingContext | null = null;
  try {
    gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
  } catch {
    gl = null;
  }
  if (!gl) {
    canvas.classList.add("no-webgl");
    return NOOP;
  }

  const ctx = gl;
  const reduced = prefersReducedMotion();

  function compile(type: number, src: string): WebGLShader {
    const sh = ctx.createShader(type)!;
    ctx.shaderSource(sh, src);
    ctx.compileShader(sh);
    return sh;
  }

  const prog = ctx.createProgram()!;
  ctx.attachShader(prog, compile(ctx.VERTEX_SHADER, VERT_SRC));
  ctx.attachShader(prog, compile(ctx.FRAGMENT_SHADER, FRAG_SRC));
  ctx.linkProgram(prog);
  if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) {
    canvas.classList.add("no-webgl");
    return NOOP;
  }
  ctx.useProgram(prog);

  const buf = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
  const loc = ctx.getAttribLocation(prog, "p");
  ctx.enableVertexAttribArray(loc);
  ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);
  const uRes = ctx.getUniformLocation(prog, "u_res");
  const uTime = ctx.getUniformLocation(prog, "u_time");

  let raf: number | null = null;
  const t0 = Date.now();
  let running = false;

  function resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.floor(canvas!.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas!.clientHeight * dpr));
    if (canvas!.width !== w || canvas!.height !== h) {
      canvas!.width = w;
      canvas!.height = h;
    }
    ctx.viewport(0, 0, canvas!.width, canvas!.height);
  }

  function frame(): void {
    if (!running) return;
    resize();
    ctx.uniform2f(uRes, canvas!.width, canvas!.height);
    ctx.uniform1f(uTime, (Date.now() - t0) / 1000);
    ctx.drawArrays(ctx.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  }

  function start(): void {
    if (running) return;
    running = true;
    if (reduced) {
      resize();
      ctx.uniform2f(uRes, canvas!.width, canvas!.height);
      ctx.uniform1f(uTime, 12.0);
      ctx.drawArrays(ctx.TRIANGLES, 0, 3);
      running = false;
      return;
    }
    frame();
  }

  function stop(): void {
    running = false;
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
  }

  return { start, stop, resize };
}
