import {
  AddEquation,
  CustomBlending,
  Group,
  Matrix3,
  OneFactor,
  OneMinusSrcAlphaFactor,
  type PerspectiveCamera,
  ShaderMaterial,
  Vector2,
  Vector3,
  type WebGLRenderer,
} from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

// Exact "Today Sun" parameters from `the sun lay out/src/App.tsx`
const TODAY_SUN = {
  c0: [1.0, 0.26, 0.01] as const,
  c1: [2.3, 1.0, 0.12] as const,
  c2: [3.6, 2.9, 1.3] as const,
  glow: [1.8, 0.68, 0.1] as const,
  gI: 1.0,
  freq: 3.4,
  warp: 1.1,
  cells: 0.0,
  gas: 0.0,
  shell: 0.0,
  boil: 1.1,
};

const BASE_RAD = 0.23;

const VS_SOURCE = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Exact photorealistic multi-layer solar shader from `the sun lay out/src/App.tsx`
const FS_SOURCE = /* glsl */ `
  uniform vec2 res;
  uniform float sc, rad, cx, cy, fade, t, evo, blur, freq, warp, cells, gas, shell, gI, flick;
  uniform vec3 c0, c1, c2, glow;
  uniform mat3 rotMat;

  float h(vec3 p){ p = fract(p*.3183099 + .1); p *= 17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float n3(vec3 x){
    vec3 i = floor(x), f = fract(x);
    f = f*f*(3.-2.*f);
    return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x), mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x), f.y),
               mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x), mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x), f.y), f.z);
  }
  float fbm(vec3 p){
    float a=.5, s=0.;
    for(int i=0;i<5;i++){ s+=a*n3(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; }
    return s;
  }

  void main(){
    vec2 uv = (gl_FragCoord.xy - .5*res)/res.y;
    vec2 p = (uv - vec2(cx, cy))/sc;
    float d = length(p);
    float e = max(d-rad, 0.);
    vec3 col = vec3(0.);

    // Photorealistic multi-layer solar corona (K-corona, magnetic streamers, prominences, F-corona)
    vec2 dir = p / max(d, 1e-4);
    float angle = atan(p.y, p.x);
    float rRatio = max(d / rad, 1.0);
    float rLog = log(rRatio);

    // 1. Radial coronal streamers (solar wind filaments stretching outward)
    float rayAngle1 = angle * 5.0 + sin(angle * 3.0 + evo * 0.2) * 0.6;
    float st1 = fbm(vec3(cos(rayAngle1) * 1.8, sin(rayAngle1) * 1.8, rLog * 2.5 - evo * 0.25));

    float rayAngle2 = angle * 11.0 - evo * 0.15;
    float st2 = n3(vec3(cos(rayAngle2) * 2.2, sin(rayAngle2) * 2.2, rLog * 4.8 + evo * 0.3));

    // Fine needle-like magnetic field filaments
    float needles = pow(0.5 + 0.5 * sin(angle * 26.0 + fbm(vec3(dir * 3.5, evo * 0.2)) * 4.5), 3.2);
    float streamers = mix(st1, st2, 0.45) * 1.25 + needles * 0.35;

    // 2. Multi-tier radial exponential decay
    float innerCore = exp(-e / (rad * 0.032));
    float midCorona = exp(-e / (rad * 0.14)) * (0.55 + 0.9 * streamers);
    float outerMask = smoothstep(rad * 1.35, rad * 0.18, e);
    float outerCorona = exp(-e / (rad * 0.42)) * outerMask * (0.45 + 0.75 * st1);

    // 3. Solar Prominences (hot plasma loops erupting off the solar limb)
    float promNoise = fbm(vec3(dir * 14.0, evo * 0.45));
    float prominences = pow(smoothstep(0.48, 0.85, promNoise), 3.0) * exp(-e / (rad * 0.038));

    // 4. Photorealistic chromatic layering
    vec3 innerCol = mix(vec3(4.2, 3.8, 2.8), glow * 2.0, smoothstep(0.0, 1.0, e / (rad * 0.035)));
    vec3 midCol = vec3(2.6, 1.25, 0.22) * (1.0 + 0.35 * streamers);
    vec3 outerCol = vec3(1.15, 0.32, 0.035) * (1.0 + 0.55 * st1);
    vec3 promCol = vec3(4.0, 0.65, 0.1);

    vec3 corona = innerCol * innerCore * 1.8
                + midCol * midCorona * 1.1
                + outerCol * outerCorona * 0.7
                + promCol * prominences * 2.2;

    // Solar atmospheric shimmer & pulsation
    corona *= (1.0 + 0.08 * sin(t * 2.3 + angle * 2.0) + 0.05 * sin(t * 5.7));
    corona *= smoothstep(rad * 2.2, rad * 0.95, e);
    col += corona * gI;

    float discAlpha = 0.0;
    if(d < rad + .02){
      float k = min(d/rad, 1.);
      vec3 nrm = vec3(p/rad, sqrt(max(1.-k*k, 0.)));
      vec3 n = rotMat * nrm;

      // Spinning fast smears the surface along rotation axis
      float sq = 1./(1.+blur*3.2);
      vec3 q = vec3(n.x*sq, n.y, n.z*sq);

      float w1 = fbm(q*freq + vec3(0.,0.,evo*.28));
      float w2 = fbm(q*freq*.9 + 7. - vec3(evo*.22,0.,0.));
      float v = fbm(q*freq*1.7 + warp*2.2*vec3(w1, w2, w1-w2));
      float vein = 1.-abs(2.*fbm(q*freq*1.5 + warp*1.3*vec3(w2, w1, 0.))-1.);
      vein = pow(vein, 9.);

      float s = smoothstep(.24,.76,v);
      s = mix(s, clamp(vein*1.25 + s*.14,0.,1.), cells);

      vec3 c = mix(c0, c1, smoothstep(.0,.55,s));
      c = mix(c, c2, smoothstep(.5,1.,s));

      float mu = nrm.z;
      c *= mix(mix(.34, .8, gas), 1., pow(mu,.5));
      c += glow*pow(1.-mu,2.6)*.42*min(gI,1.)*(1.-gas);

      float edge = smoothstep(1., .985, k);
      float soft = smoothstep(1., .58, k + (fbm(q*3.4 + evo*.1)-.5)*.62) * smoothstep(1., .9, k);
      float a = mix(edge, soft, gas);
      col = mix(col, c, a);
      discAlpha = a;
    }

    col = 1. - exp(-col*1.15);
    vec3 srgb = pow(max(col, vec3(0.0)), vec3(.4545));
    gl_FragColor = vec4(srgb * fade, discAlpha * fade);
  }
`;

function multiplyMat3(a: number[], b: number[]): number[] {
  const out = new Array<number>(9);
  for (let c = 0; c < 3; c++) {
    for (let r = 0; r < 3; r++) {
      out[c * 3 + r] =
        a[0 * 3 + r] * b[c * 3 + 0] +
        a[1 * 3 + r] * b[c * 3 + 1] +
        a[2 * 3 + r] * b[c * 3 + 2];
    }
  }
  return out;
}

function axisAngleMatrix(x: number, y: number, z: number, angle: number): number[] {
  const len = Math.hypot(x, y, z) || 1;
  x /= len;
  y /= len;
  z /= len;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;

  return [
    t * x * x + c,
    t * x * y + s * z,
    t * x * z - s * y,

    t * x * y - s * z,
    t * y * y + c,
    t * y * z + s * x,

    t * x * z + s * y,
    t * y * z - s * x,
    t * z * z + c,
  ];
}

function applyRotation(m: number[], ax: number, ay: number, az: number, angle: number): number[] {
  const d = axisAngleMatrix(ax, ay, az, angle);
  return multiplyMat3(d, m);
}

function orthonormalize(m: number[]): number[] {
  let [x0, x1, x2, y0, y1, y2] = m;
  const lx = Math.hypot(x0, x1, x2) || 1;
  x0 /= lx;
  x1 /= lx;
  x2 /= lx;

  const dot = x0 * y0 + x1 * y1 + x2 * y2;
  y0 -= dot * x0;
  y1 -= dot * x1;
  y2 -= dot * x2;
  const ly = Math.hypot(y0, y1, y2) || 1;
  y0 /= ly;
  y1 /= ly;
  y2 /= ly;

  const z0 = x1 * y2 - x2 * y1;
  const z1 = x2 * y0 - x0 * y2;
  const z2 = x0 * y1 - x1 * y0;

  return [x0, x1, x2, y0, y1, y2, z0, z1, z2];
}

export function buildMainStar() {
  const group = new Group();

  const rotMatUniform = new Matrix3();
  const resUniform = new Vector2(1, 1);

  const uniforms = {
    res: { value: resUniform },
    sc: { value: 1.0 },
    rad: { value: BASE_RAD },
    cx: { value: 0.0 },
    cy: { value: 0.0 },
    fade: { value: 1.0 },
    t: { value: 0.0 },
    evo: { value: 0.0 },
    blur: { value: 0.0 },
    freq: { value: TODAY_SUN.freq },
    warp: { value: TODAY_SUN.warp },
    cells: { value: TODAY_SUN.cells },
    gas: { value: TODAY_SUN.gas },
    shell: { value: TODAY_SUN.shell },
    gI: { value: TODAY_SUN.gI },
    flick: { value: 1.0 },
    c0: { value: new Vector3(...TODAY_SUN.c0) },
    c1: { value: new Vector3(...TODAY_SUN.c1) },
    c2: { value: new Vector3(...TODAY_SUN.c2) },
    glow: { value: new Vector3(...TODAY_SUN.glow) },
    rotMat: { value: rotMatUniform },
  };

  const material = new ShaderMaterial({
    vertexShader: VS_SOURCE,
    fragmentShader: FS_SOURCE,
    uniforms,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    toneMapped: false,
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: OneFactor,
    blendDst: OneMinusSrcAlphaFactor,
  });

  // Official Three.js FullScreenQuad guarantees `position` attribute count = 3 on all GPUs
  const fsQuad = new FullScreenQuad(material);

  let rotMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  let evo = 0;
  let velocityX = 0;
  let velocityY = 0;
  let isDragging = false;
  let visible = true;
  let lastTime = -1;

  const worldOrigin = new Vector3(0, 0, 0);
  const projected = new Vector3();
  const camToStar = new Vector3();
  const camForward = new Vector3();
  const drawSize = new Vector2();

  return {
    group,
    onDragStart() {
      isDragging = true;
      velocityX = 0;
      velocityY = 0;
    },
    onDragMove(dx: number, dy: number) {
      if (!isDragging) return;
      const angleY = dx * 0.0055;
      const angleX = dy * 0.0055;
      rotMatrix = applyRotation(rotMatrix, 0, 1, 0, angleY);
      rotMatrix = applyRotation(rotMatrix, 1, 0, 0, angleX);
      rotMatrix = orthonormalize(rotMatrix);
      velocityX = angleY;
      velocityY = angleX;
    },
    onDragEnd() {
      isDragging = false;
    },
    update(time: number, camera?: PerspectiveCamera, weight = 1, baseDistance = 920) {
      const dt = lastTime < 0 ? 0.016 : Math.min(0.05, Math.max(0, time - lastTime));
      lastTime = time;

      if (weight <= 0.001) {
        visible = false;
        return;
      }

      if (!isDragging) {
        if (Math.hypot(velocityX, velocityY) > 0.00005) {
          rotMatrix = applyRotation(rotMatrix, 0, 1, 0, velocityX * dt * 60);
          rotMatrix = applyRotation(rotMatrix, 1, 0, 0, velocityY * dt * 60);
          rotMatrix = orthonormalize(rotMatrix);
          velocityX *= Math.exp(-dt * 2.8);
          velocityY *= Math.exp(-dt * 2.8);
        }
        rotMatrix = applyRotation(rotMatrix, 0.08, 1.0, 0.0, 0.2 * dt);
        rotMatrix = orthonormalize(rotMatrix);
      }

      const speed = Math.hypot(velocityX, velocityY) * 70;
      const blur = Math.min(1.4, speed * 0.08);
      evo += dt * TODAY_SUN.boil * (1.0 + speed * 0.06);

      const flick = 1.0 + 0.1 * Math.sin(time * 2.1) + 0.06 * Math.sin(time * 5.3);

      let cx = 0.0;
      let cy = 0.0;
      let distScale = 1.0;

      if (camera) {
        camera.updateMatrixWorld();
        camToStar.subVectors(worldOrigin, camera.position);
        camera.getWorldDirection(camForward);
        const forwardDot = camToStar.dot(camForward);
        if (forwardDot <= 10) {
          visible = false;
          return;
        }
        const dist = Math.max(camToStar.length(), 120);
        distScale = baseDistance / dist;

        projected.copy(worldOrigin).project(camera);
        const aspect = camera.aspect || 1;
        cx = 0.5 * projected.x * aspect;
        cy = 0.5 * projected.y;
      }

      visible = true;
      uniforms.t.value = time;
      uniforms.evo.value = evo;
      uniforms.blur.value = blur;
      uniforms.flick.value = flick;
      uniforms.cx.value = cx;
      uniforms.cy.value = cy;
      uniforms.rad.value = BASE_RAD * distScale;
      uniforms.fade.value = Math.min(1.0, Math.max(0.0, weight));
      rotMatUniform.fromArray(rotMatrix);
    },
    renderOverlay(renderer: WebGLRenderer) {
      if (!visible) return;
      renderer.setRenderTarget(null);
      renderer.getDrawingBufferSize(drawSize);
      const w = Math.max(1, drawSize.x);
      const h = Math.max(1, drawSize.y);
      resUniform.set(w, h);
      const aspect = w / h;
      uniforms.sc.value = Math.min(1.0, aspect < 1 ? aspect * 1.15 : 1.0);

      const prevAutoClear = renderer.autoClear;
      renderer.autoClear = false;
      fsQuad.render(renderer);
      renderer.autoClear = prevAutoClear;
    },
    dispose() {
      fsQuad.dispose();
      material.dispose();
    },
  };
}
