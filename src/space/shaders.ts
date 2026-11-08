import { GALAXY_BAND_NORMAL } from '@/space/constants';

export const simplexNoiseGlsl = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

export const starPointVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aBright;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vAlpha = aBright * (0.9 + 0.1 * sin(uTime * (0.6 + aBright) + aSize * 31.0)) * uOpacity;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;

export const starPointFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p) * 2.0;
    if (d > 1.0) discard;

    // Pin-point diamond core
    float core = exp(-d * d * 28.0);
    float halo = exp(-d * 3.8) * 0.35;
    // Delicate optical cross glint on brightest stars
    float spike = (exp(-abs(p.x) * 36.0) * exp(-abs(p.y) * 2.5) + exp(-abs(p.y) * 36.0) * exp(-abs(p.x) * 2.5)) * 0.28;

    float intensity = (core + halo + spike) * vAlpha;
    if (intensity < 0.005) discard;

    vec3 col = mix(vColor, vec3(1.0, 1.0, 1.0), core * 0.8);
    gl_FragColor = vec4(col * intensity, intensity);
  }
`;

export const starStreakVertexShader = /* glsl */ `
  attribute float aEnd;
  attribute float aBright;
  attribute vec3 aColor;
  uniform vec3 uTail;
  uniform float uWarp;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vAlpha = uWarp * aBright * (1.0 - 0.5 * aEnd);
    vec3 p = position - uTail * aEnd;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const starStreakFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

export const skyDomeVertexShader = /* glsl */ `
  varying vec3 vDir;

  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyDomeFragmentShader = /* glsl */ `
  varying vec3 vDir;

  void main() {
    vec3 d = normalize(vDir);
    // Pure, deep, crystalline obsidian void
    vec3 deepVoid = vec3(0.0010, 0.0012, 0.0018);
    vec3 upperVoid = vec3(0.0014, 0.0016, 0.0024);
    vec3 base = mix(deepVoid, upperVoid, smoothstep(-0.8, 0.8, d.y));

    // Subtle, ethereal galactic plane with zero muddy smudges
    vec3 bandNormal = normalize(vec3(${GALAXY_BAND_NORMAL.join(', ')}));
    float band = exp(-pow(dot(d, bandNormal) / 0.18, 2.0));
    vec3 galacticStarlight = vec3(0.012, 0.016, 0.022) * band;

    gl_FragColor = vec4(base + galacticStarlight, 1.0);
  }
`;

export const starCoreVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormalView;
  varying vec3 vWorldNormal;

  ${simplexNoiseGlsl}

  void main() {
    vPos = position;
    vec3 d = normalize(position);
    // Subtle thermodynamic plasma surface pulsation
    float wave = snoise(d * 3.5 + vec3(uTime * 0.12)) * 1.6;
    float ripple = snoise(d * 8.0 - vec3(0.0, uTime * 0.28, 0.0)) * 0.7;
    vec3 displaced = position + normal * (wave + ripple);

    vNormalView = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const starCoreFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormalView;
  varying vec3 vWorldNormal;

  ${simplexNoiseGlsl}

  // Multi-octave convective noise with cellular inversion
  float solarFbm(vec3 p, float t) {
    float a = 0.5;
    float sum = 0.0;
    vec3 shift = vec3(t * 0.18, -t * 0.12, t * 0.08);
    for (int i = 0; i < 4; i++) {
      float n = snoise(p + shift);
      sum += a * (1.0 - abs(n));
      p = p * 2.15 + vec3(4.3, 1.7, 7.1);
      shift = shift * 1.5;
      a *= 0.52;
    }
    return sum;
  }

  void main() {
    vec3 d = normalize(vPos);
    float t = uTime * 0.07;

    // Convective granules (boiling plasma cells)
    float cells = solarFbm(d * 7.5, t);
    float microGranules = solarFbm(d * 20.0, t * 1.6);
    float granulation = cells * 0.7 + microGranules * 0.3;

    // Magnetic active regions / solar flare plages
    float activeFlux = snoise(d * 2.4 + vec3(1.2, t * 0.08, 8.4));
    float plage = smoothstep(0.42, 0.85, activeFlux);

    // Magnetic sunspots restricted to solar active latitudes (lat +- 15-30 deg)
    float latMask = smoothstep(0.4, 0.15, abs(d.y - 0.22)) + smoothstep(0.4, 0.15, abs(d.y + 0.22));
    float spotBase = snoise(d * 4.8 + vec3(9.1, 4.3, 2.7));
    float umbra = smoothstep(0.78, 0.92, spotBase) * latMask;
    float penumbra = smoothstep(0.68, 0.82, spotBase) * latMask;

    // Incandescent solar color palette
    vec3 darkLanes = vec3(0.28, 0.04, 0.01);       // Sinking cool plasma (~3,500K)
    vec3 bodyGold  = vec3(1.00, 0.44, 0.08);       // Photospheric body (~5,800K)
    vec3 hotWhite  = vec3(2.20, 1.80, 1.25);       // Granule crests & flare peaks (~12,000K HDR)

    vec3 color = mix(darkLanes, bodyGold, smoothstep(0.35, 0.75, granulation));
    color = mix(color, hotWhite, smoothstep(0.72, 0.98, granulation) * 0.6 + plage * 0.85);

    // Dark sunspot depression
    vec3 spotColor = mix(vec3(0.18, 0.04, 0.01), vec3(0.04, 0.005, 0.002), umbra);
    color = mix(color, spotColor, penumbra * 0.88);

    // Physical Eddington stellar limb darkening: I(mu) = I0 * (1 - u*(1 - mu))
    float mu = clamp(dot(vNormalView, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    float limbDarkening = 0.28 + 0.72 * pow(mu, 0.5);

    // Coronal limb surge (extreme energy grazing the horizon)
    float limbSurge = pow(1.0 - mu, 4.0) * (0.8 + 0.5 * snoise(d * 8.0 + vec3(t * 2.0)));
    vec3 finalColor = color * limbDarkening + vec3(1.4, 0.55, 0.12) * limbSurge;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const prominenceVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormal;

  ${simplexNoiseGlsl}

  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const prominenceFragmentShader = /* glsl */ `
  void main() {
    discard;
  }
`;

export const coronaVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const coronaFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uRadius;
  varying vec2 vUv;

  ${simplexNoiseGlsl}

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float dist = length(p);
    float angle = atan(p.y, p.x);

    // Star core radius on plane
    float innerR = 0.31;
    if (dist >= 1.0) discard;

    // Smooth continuous radial decay from inside core outward into deep space
    float coreBlend = smoothstep(innerR * 0.8, innerR * 1.15, dist);
    float normDist = clamp((dist - innerR * 0.9) / (1.0 - innerR * 0.9), 0.0, 1.0);
    float decay = pow(1.0 - normDist, 2.8) * coreBlend;

    // Animated solar coronal streamers radiating outwards
    float streamers = 0.5 + 0.5 * sin(angle * 7.0 + snoise(vec3(cos(angle) * 2.5, sin(angle) * 2.5, uTime * 0.05)) * 4.0);
    float microRays = 0.5 + 0.5 * sin(angle * 26.0 - uTime * 0.12 + snoise(vec3(p * 4.0, uTime * 0.08)) * 3.0);
    float flareGust = smoothstep(0.35, 0.85, snoise(vec3(p * 2.0, uTime * 0.09)));

    float radiation = decay * (0.55 + 0.3 * streamers + 0.15 * microRays + 0.35 * flareGust);

    vec3 innerGold = vec3(1.4, 0.65, 0.18);
    vec3 outerRed  = vec3(0.5, 0.08, 0.015);
    vec3 rayColor  = mix(innerGold, outerRed, smoothstep(0.0, 0.75, normDist));

    float alpha = clamp(radiation * 0.5 * uIntensity, 0.0, 1.0);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(rayColor * alpha * 1.5, alpha);
  }
`;

export const nebulaVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const nebulaFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColorCore;
  uniform vec3 uColorMid;
  uniform vec3 uColorRim;
  uniform float uSeed;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  ${simplexNoiseGlsl}

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float dist = length(p);
    if (dist >= 1.0) discard;

    float t = uTime * 0.025 + uSeed;

    // Multi-octave domain-warped fractal turbulence (Astrophotographic gas flow)
    vec3 q1 = vec3(p * 2.2, t * 0.4);
    float warp1 = snoise(q1);
    vec3 q2 = q1 + vec3(warp1 * 1.3, snoise(q1 * 1.5 + vec3(4.3, 1.2, 0.7)), t * 0.2);
    float warp2 = snoise(q2 * 2.0);
    vec3 q3 = q2 + vec3(warp2 * 1.1, snoise(q2 * 2.2 + vec3(8.1, 3.4, 2.9)), 0.0);

    // Sculpted gas density with fine filamentous ridges
    float f1 = snoise(q3 * 1.8);
    float f2 = snoise(q3 * 3.6);
    float f3 = snoise(q3 * 7.2);
    float f4 = snoise(q3 * 14.4);
    float gas = clamp(0.48 * f1 + 0.28 * f2 + 0.16 * f3 + 0.08 * f4 + 0.15, 0.0, 1.0);

    // Ethereal filamentary ribbons (abs noise produces fine tendrils)
    float filaments = 1.0 - abs(snoise(q3 * 3.2));
    filaments = pow(filaments, 2.2);

    // Cold molecular dark dust veins (Bok globules silhouetting the emission glow)
    float darkVein = smoothstep(0.42, 0.68, 0.5 + 0.5 * snoise(q2 * 2.6 + vec3(1.7, 5.1, 9.3)));
    float dustAttenuation = mix(0.18, 1.0, darkVein);

    // Soft organic pillar boundary falloff
    float boundary = pow(clamp(1.0 - dist, 0.0, 1.0), 2.2);
    float density = smoothstep(0.08, 0.85, gas + filaments * 0.35) * boundary * dustAttenuation;

    // Chromatic astrophotography emission spectrum:
    // Outer [O III] cyan/teal ionization front -> [H-alpha] deep magenta/violet -> Incandescent core gold
    vec3 col = mix(uColorRim, uColorMid, smoothstep(0.12, 0.52, gas));
    col = mix(col, uColorCore, smoothstep(0.52, 0.95, gas + filaments * 0.2));

    // High-energy ionization rim excitation
    vec3 ionizationGlow = vec3(0.15, 0.85, 0.98) * pow(filaments, 3.0) * 0.45;
    col += ionizationGlow;

    float alpha = density * uOpacity * 0.55;
    if (alpha < 0.002) discard;

    gl_FragColor = vec4(col * alpha * 1.8, alpha);
  }
`;

export const protoStarVertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  uniform float uTime;
  varying vec3 vColor;
  varying float vPulse;

  void main() {
    vColor = aColor;
    float pulse = 0.85 + 0.15 * sin(uTime * 2.2 + position.x * 0.05 + position.y * 0.05);
    vPulse = pulse;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * pulse;
    gl_Position = projectionMatrix * mv;
  }
`;

export const protoStarFragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vPulse;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p) * 2.0;

    // Searing diamond stellar core bloom
    float core = exp(-d * d * 24.0);
    float halo = exp(-d * 3.8) * 0.45;

    // Authentic James Webb 6-point hexagonal diffraction spikes (angles at 0°, 60°, 120°)
    float s1 = exp(-abs(p.y) * 55.0) * exp(-abs(p.x) * 3.2); // 0°
    vec2 rot60 = vec2(0.5 * p.x - 0.866025 * p.y, 0.866025 * p.x + 0.5 * p.y);
    float s2 = exp(-abs(rot60.y) * 55.0) * exp(-abs(rot60.x) * 3.2); // 60°
    vec2 rot120 = vec2(-0.5 * p.x - 0.866025 * p.y, 0.866025 * p.x - 0.5 * p.y);
    float s3 = exp(-abs(rot120.y) * 55.0) * exp(-abs(rot120.x) * 3.2); // 120°

    float spikes = (s1 + s2 + s3) * 0.75;

    float intensity = (core + halo + spikes) * uOpacity * vPulse;
    if (intensity < 0.01) discard;

    vec3 col = mix(vColor, vec3(1.15, 1.08, 0.98), core);
    gl_FragColor = vec4(col * intensity * 1.8, intensity);
  }
`;
