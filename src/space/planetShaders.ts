import { simplexNoiseGlsl } from '@/space/shaders';

export const occlusionGlsl = /* glsl */ `
  float sphereHit(vec3 p, vec3 L, vec3 c, float r) {
    if (r <= 0.0) return 0.0;
    vec3 q = p - c;
    float b = dot(q, L);
    float cc = dot(q, q) - r * r;
    float disc = b * b - cc;
    return (cc > 0.0 && b < 0.0 && disc > 0.0) ? 1.0 : 0.0;
  }
`;

export const planetVertexShader = /* glsl */ `
  varying vec3 vObjPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vObjPos = position;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const planetFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform float uOpacity;
  uniform float uBands;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uLightDir;
  uniform vec3 uLightColor;
  uniform vec3 uCenter;
  uniform float uShadowRadius;
  uniform vec3 uRingNormal;
  uniform float uRingInner;
  uniform float uRingOuter;
  varying vec3 vObjPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  ${simplexNoiseGlsl}
  ${occlusionGlsl}

  float rockHeight(vec3 p) {
    return 0.5 * snoise(p * 2.0) + 0.25 * snoise(p * 5.0) + 0.12 * snoise(p * 13.0);
  }

  // 4-octave FBM for smooth, organic gas-giant fluid advection (Sun-style domain warping, subtle & realistic)
  float gasFbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * (0.5 + 0.5 * snoise(x));
      x = x * 2.04 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }

  float ringHit(vec3 p, vec3 L) {
    if (uRingOuter <= 0.0) return 0.0;
    float facing = dot(uRingNormal, L);
    if (abs(facing) < 0.001) return 0.0;
    float t = dot(uRingNormal, uCenter - p) / facing;
    if (t <= 0.0) return 0.0;
    float r = length(p + L * t - uCenter);
    if (r >= uRingInner && r <= uRingOuter) {
      float normR = (r - uRingInner) / (uRingOuter - uRingInner);
      float cassini = smoothstep(0.015, 0.035, abs(normR - 0.65));
      float ringlets = 0.5 + 0.5 * sin(normR * 120.0);
      return (0.35 + 0.55 * ringlets) * cassini;
    }
    return 0.0;
  }

  void main() {
    vec3 p = normalize(vObjPos);
    vec3 L = normalize(uLightDir);
    vec3 n = normalize(vWorldNormal);
    vec3 color;

    if (uBands > 0.5) {
      float lat = p.y;

      // 1. True 3D axial rotation around polar Y-axis + differential zonal jet-stream shear
      float baseSpin = uTime * 0.17;
      float zonalWind = sin(lat * 11.0) * (uTime * 0.048);
      float spinAngle = baseSpin + zonalWind;
      float cs = cos(spinAngle);
      float sn = sin(spinAngle);
      vec3 rp = vec3(p.x * cs - p.z * sn, lat, p.x * sn + p.z * cs);

      // 2. Refined Sun-inspired domain-warped FBM atmospheric evolution (natural & calm, zero exaggeration)
      float evo = uTime * 0.22;
      vec3 flowCoord = vec3(rp.x * 2.5, lat * 4.8, rp.z * 2.5);
      float w1 = gasFbm(flowCoord + vec3(0.0, 0.0, evo * 0.34));
      float w2 = gasFbm(flowCoord * 1.15 + vec3(5.2, -evo * 0.26, 1.9));

      // Subtle Kelvin-Helmholtz eddies curling between planetary cloud belts
      float warpedLat = lat + (w1 - 0.5) * 0.095 + (w2 - 0.5) * 0.048;
      float fluidCells = gasFbm(flowCoord * 1.75 + 0.72 * vec3(w1 - 0.5, (w2 - 0.5) * 0.6, w1 - w2));

      float mainBands = 0.5 + 0.5 * sin(warpedLat * 30.0 + (fluidCells - 0.5) * 2.2);
      float fineRibbons = 0.5 + 0.5 * sin(warpedLat * 62.0 + (w2 - 0.5) * 2.6);
      float h = clamp(0.56 * mainBands + 0.24 * fineRibbons + 0.20 * fluidCells, 0.0, 1.0);

      // Rotating anticyclonic oval storm carried naturally with the planet's rotation
      vec3 stormCenter = normalize(vec3(0.35, -0.24, 0.90));
      float distToStorm = length(rp - stormCenter);
      float stormEye = smoothstep(0.28, 0.03, distToStorm);
      vec3 dStorm = rp - stormCenter;
      float stormAngle = atan(dStorm.z, dStorm.x);
      float stormSpiral = 0.5 + 0.5 * sin(stormAngle * 2.0 + distToStorm * 18.0 - uTime * 0.55);

      // Subtle cloud-top relief rotating with rp
      float e = 0.025;
      float h1 = snoise(rp * 4.5 + vec3(e, 0.0, evo * 0.08));
      float h2 = snoise(rp * 4.5 - vec3(e, 0.0, -evo * 0.08));
      float h3 = snoise(rp * 4.5 + vec3(0.0, e, evo * 0.08));
      float h4 = snoise(rp * 4.5 - vec3(0.0, e, -evo * 0.08));
      vec3 grad = vec3(h1 - h2, h3 - h4, 0.0);
      n = normalize(n - 0.009 * (grad - dot(grad, n) * n));

      // Luxury Saturnian champagne/honey/ammonia palette
      vec3 deepBelt = uColorA * 0.78;
      vec3 midDeck  = uColorB;
      vec3 highAmmonia = mix(uColorC, vec3(1.0, 0.96, 0.9), 0.65);

      color = mix(deepBelt, midDeck, smoothstep(0.18, 0.72, h));
      color = mix(color, highAmmonia, smoothstep(0.62, 0.94, h) * 0.82);
      color = mix(color, vec3(1.0, 0.94, 0.86), stormEye * (0.45 + 0.55 * stormSpiral) * 0.65);

      // Soft polar hexagon haze
      float polar = smoothstep(0.75, 1.0, abs(lat));
      color = mix(color, vec3(0.32, 0.42, 0.5), polar * 0.34);
    } else {
      float h = clamp(0.5 + 0.5 * rockHeight(p), 0.0, 1.0);
      color = mix(uColorA, uColorB, smoothstep(0.2, 0.8, h));
      float maria = smoothstep(0.05, 0.45, snoise(p * 1.4 + vec3(7.0)));
      color = mix(color, uColorA * 0.9, maria * 0.5);
      float crater = smoothstep(0.66, 0.8, 0.5 + 0.5 * snoise(p * 17.0));
      color *= 1.0 - 0.3 * crater;

      float e = 0.02;
      vec3 gradient = vec3(
        rockHeight(p + vec3(e, 0.0, 0.0)) - rockHeight(p - vec3(e, 0.0, 0.0)),
        rockHeight(p + vec3(0.0, e, 0.0)) - rockHeight(p - vec3(0.0, e, 0.0)),
        rockHeight(p + vec3(0.0, 0.0, e)) - rockHeight(p - vec3(0.0, 0.0, e))
      ) / (2.0 * e);
      n = normalize(n - 0.04 * (gradient - dot(gradient, n) * n));
    }

    float ndl = dot(n, L);
    float lit = uBands > 0.5 ? clamp((ndl + 0.08) / 1.08, 0.0, 1.0) : clamp(ndl, 0.0, 1.0);
    float occlusion = max(sphereHit(vWorldPos, L, uCenter, uShadowRadius), ringHit(vWorldPos, L));
    float shade = lit * (1.0 - occlusion);

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float ndv = max(dot(n, viewDir), 0.0);
    float limb = uBands > 0.5 ? 0.6 + 0.4 * pow(ndv, 0.45) : 1.0;

    float terminator = exp(-pow(ndl / 0.16, 2.0)) * (1.0 - occlusion) * (uBands > 0.5 ? 1.0 : 0.0);
    float haze = pow(1.0 - ndv, 3.5) * lit * (uBands > 0.5 ? 1.0 : 0.0);

    vec3 direct = color * uLightColor * shade * limb * 1.25;
    vec3 glow = (color * terminator * 0.4 + uColorC * haze * 0.22) * uLightColor;
    vec3 ambient = color * vec3(0.005, 0.006, 0.009);

    float hoverLimb = pow(1.0 - ndv, 2.8);
    vec3 hoverAura = mix(uColorC, vec3(1.15, 0.95, 0.78), 0.5) * hoverLimb * 0.45;
    vec3 hoverScan = color * (1.0 - lit) * 0.015;
    vec3 hoverTotal = (hoverAura + hoverScan) * uHover;

    vec3 finalColor = direct + glow + ambient + hoverTotal;
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vViewNormal;
  varying vec3 vWorldNormal;

  void main() {
    vViewNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uOpacity;
  uniform vec3 uLightDir;
  uniform vec3 uLightColor;
  varying vec3 vViewNormal;
  varying vec3 vWorldNormal;

  void main() {
    float viewDot = clamp(dot(-vViewNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    float rim = pow(1.0 - viewDot, 3.0);
    
    float ndl = dot(normalize(vWorldNormal), normalize(uLightDir));
    float sunlit = smoothstep(-0.25, 0.45, ndl);
    float forward = exp(-pow((ndl - 0.1) / 0.35, 2.0)) * 0.7;
    
    vec3 sunsetColor = vec3(1.0, 0.6, 0.28);
    float sunset = pow(1.0 - abs(ndl), 3.0) * sunlit;
    vec3 atmoColor = mix(uColor, sunsetColor, sunset * 0.75);
    
    float alpha = rim * (0.04 + 0.96 * (sunlit + forward)) * uIntensity * uOpacity;
    gl_FragColor = vec4(atmoColor * uLightColor * alpha, alpha);
  }
`;

export const ringVertexShader = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vWorld;

  void main() {
    vLocal = position;
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ringFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uInner;
  uniform float uOuter;
  uniform float uOpacity;
  uniform vec3 uLightDir;
  uniform vec3 uLightColor;
  uniform vec3 uRingNormal;
  uniform vec3 uCenter;
  uniform float uRadius;
  varying vec3 vLocal;
  varying vec3 vWorld;

  ${simplexNoiseGlsl}
  ${occlusionGlsl}

  void main() {
    vec3 L = normalize(uLightDir);
    float r = length(vLocal.xy);
    float t = (r - uInner) / (uOuter - uInner);
    float angle = atan(vLocal.y, vLocal.x) - uTime * (0.14 / max(0.35 + t, 0.35));

    float broad = 0.5 + 0.5 * snoise(vec3(r * 0.035, 0.0, 1.7));
    float fine = 0.5 + 0.5 * snoise(vec3(r * 0.45, 0.0, 4.3));
    float iceSpokes = 0.92 + 0.08 * snoise(vec3(cos(angle) * 2.2, sin(angle) * 2.2, r * 0.025));

    float gap = smoothstep(0.0, 0.05, t) * smoothstep(1.0, 0.95, t);
    float cassini = smoothstep(0.015, 0.04, abs(t - 0.65));
    float ringlets = 0.5 + 0.5 * sin(t * 180.0);
    float alpha = gap * cassini * (0.4 + 0.5 * broad) * (0.7 + 0.3 * fine) * (0.75 + 0.25 * ringlets) * uOpacity;

    float shade = 1.0 - sphereHit(vWorld, L, uCenter, uRadius);
    float sunFace = 0.45 + 0.55 * abs(dot(normalize(uRingNormal), L));
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float forward = pow(max(-dot(viewDir, L), 0.0), 3.0);
    
    vec3 iceGlint = mix(uColor, vec3(1.2, 1.15, 1.08), 0.45) * iceSpokes;
    vec3 lit = iceGlint * uLightColor * (0.55 + 0.45 * broad) * shade * sunFace * (1.2 + 1.8 * forward);
    gl_FragColor = vec4(lit * 1.3, alpha * 0.95);
  }
`;
