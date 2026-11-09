export const forgeNebulaVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Exact high-definition 3D noise & 5-octave FBM architecture from `mainStar.ts` (`TODAY_SUN`)
const sunGradeNoiseGlsl = /* glsl */ `
  float h3(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float n3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(
        mix(h3(i), h3(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(h3(i + vec3(0.0, 1.0, 0.0)), h3(i + vec3(1.0, 1.0, 0.0)), f.x),
        f.y
      ),
      mix(
        mix(h3(i + vec3(0.0, 0.0, 1.0)), h3(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(h3(i + vec3(0.0, 1.0, 1.0)), h3(i + vec3(1.0, 1.0, 1.0)), f.x),
        f.y
      ),
      f.z
    );
  }

  const mat3 rotOct = mat3(
     0.00,  0.80,  0.60,
    -0.80,  0.36, -0.48,
    -0.60, -0.48,  0.64
  );

  float fbm5(vec3 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 5; i++) {
      s += a * n3(p);
      p = rotOct * p * 2.03 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return s;
  }

  float fbm3(vec3 p) {
    float a = 0.53;
    float s = 0.0;
    for (int i = 0; i < 3; i++) {
      s += a * n3(p);
      p = rotOct * p * 2.07 + vec3(2.3, 5.1, 1.9);
      a *= 0.47;
    }
    return s;
  }
`;

export const forgeNebulaFragmentShader = /* glsl */ `
  uniform vec3 uCam;
  uniform vec3 uCenter;
  uniform float uTime;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  ${sunGradeNoiseGlsl}

  void main() {
    if (uOpacity < 0.004) discard;

    vec2 borderUv = vUv * 2.0 - 1.0;
    float borderDist = length(borderUv);
    if (borderDist >= 1.0) discard;
    float vignette = 1.0 - smoothstep(0.62, 1.0, borderDist);

    vec3 ro = uCam - uCenter;
    vec3 rd = normalize(vWorldPos - uCam);
    float invRdZ = abs(rd.z) > 0.08 ? (1.0 / rd.z) : -1.0;

    // Living solar-style surface convection speed
    float evo = uTime * 0.64;

    // Projected mid coordinates for sculpting the central monumental typography rift
    float tMid = (0.0 - ro.z) * invRdZ;
    vec2 pMid = (ro.xy + rd.xy * max(tMid, 0.0)) / vec2(680.0, 650.0);

    // Deep cosmic rift window directly behind "THE FORGE" typography:
    // Centered at pMid (-0.12, -0.02) corresponding to the exact 3D screen space of the monumental text
    vec2 pText = vec2((pMid.x - (-0.12)) * 2.5, (pMid.y - (-0.02)) * 2.9);
    float textCavity = exp(-dot(pText, pText) * 4.6);

    // --- LAYER 1 (DEEP CAVERN SHELL, dz = -175): Vivid Ionized Amethyst & Electric Sapphire Core ---
    float tBack = (-175.0 - ro.z) * invRdZ;
    vec2 pBack = (ro.xy + rd.xy * max(tBack, 0.0)) / vec2(740.0, 690.0);
    vec2 rpB = vec2(pBack.x * 0.94 - pBack.y * 0.34, pBack.x * 0.34 + pBack.y * 0.94);

    float bw1 = fbm3(vec3(rpB * 2.2, evo * 0.20));
    float bw2 = fbm3(vec3(rpB * 2.0 + 4.3, -evo * 0.16));
    float bGas = fbm5(vec3(rpB * 3.1 + 1.6 * vec2(bw1 - 0.5, bw2 - 0.5), evo * 0.08));

    float bRad = length(pBack * vec2(0.92, 0.84));
    float bEnv = (1.0 - smoothstep(0.18, 0.94, bRad - (bw1 - 0.5) * 0.28));
    float bDensity = smoothstep(0.28, 0.78, bGas) * bEnv * (1.0 - textCavity * 0.96);

    // Vivid cosmic ionization heart
    float cavernMask = exp(-dot(pBack - vec2(0.18, -0.02), pBack - vec2(0.18, -0.02)) * 4.2);
    vec2 summitPos = vec2(0.06, 0.40);
    float summitGlow = exp(-dot(pBack - summitPos, pBack - summitPos) * 6.5);

    // Deep interstellar void -> Vivid ionized ultraviolet -> Electric cobalt-sapphire
    vec3 colDeepVoid   = vec3(0.005, 0.007, 0.016);
    vec3 colIonViolet  = vec3(0.20, 0.08, 0.46);
    vec3 colCobaltRim  = vec3(0.12, 0.45, 0.92);
    vec3 colSummitCyan = vec3(0.28, 0.85, 1.35);

    vec3 backCol = mix(colDeepVoid, colIonViolet, smoothstep(0.25, 0.75, bGas));
    backCol = mix(backCol, colCobaltRim, cavernMask * smoothstep(0.30, 0.70, bGas) * 0.88);
    backCol += colSummitCyan * summitGlow * smoothstep(0.35, 0.80, bGas) * 0.85;

    vec3 compCol = backCol * bDensity * 0.92;
    float compAlpha = bDensity * 0.78;

    // --- LAYER 2 (MAIN SCULPTED CLIFF SHELL, dz = 0): Vivid Electric Cyan (O-III) & Cosmic Violet Gas ---
    vec2 rpM = vec2(pMid.x * 0.92 + pMid.y * 0.39, -pMid.x * 0.39 + pMid.y * 0.92);

    vec3 qM = vec3(rpM * 2.45, 1.3);
    float mw1 = fbm5(qM + vec3(0.0, evo * 0.25, evo * 0.18));
    float mw2 = fbm5(qM * 0.92 + 7.0 - vec3(evo * 0.21, -evo * 0.12, 0.0));
    float mBoil = fbm5(qM * 1.68 + 2.15 * vec3(mw1 - 0.5, mw2 - 0.5, mw1 - mw2));

    float rawVein = 1.0 - abs(2.0 * fbm5(qM * 1.52 + 1.35 * vec3(mw2 - 0.5, mw1 - 0.5, evo * 0.09)) - 1.0);
    float plasmaRibbon = pow(clamp(rawVein, 1e-4, 1.0), 4.5);
    float searingVein = pow(clamp(rawVein, 1e-4, 1.0), 9.5);

    // Sculpted crescent cliff around the inner sapphire-amethyst amphitheater
    float mRad = length((pMid - vec2(0.05, 0.02)) * vec2(0.96, 0.82));
    float mEnv = 1.0 - smoothstep(0.16, 0.92, mRad - (mw1 - 0.5) * 0.34);
    float ridgeArc = exp(-pow(max(abs(length(pMid - vec2(0.08, -0.04)) - 0.36) * 2.6, 1e-4), 1.6));

    float mStructure = smoothstep(0.26, 0.78, mBoil * 0.82 + plasmaRibbon * 0.42) * mEnv * (0.48 + 0.72 * ridgeArc);
    // Smoothly carve away gas in the central text cavity so typography sits on pure void
    mStructure *= (1.0 - textCavity * 0.96);

    // Vivid deep-space emission spectrum (Astronomical O-III & H-beta lines):
    // Cosmic Amethyst -> Saturated Ultramarine -> Radiant Electric Cyan/Teal -> Clean Cyan Starlight
    vec3 colAmethyst     = vec3(0.25, 0.08, 0.52);
    vec3 colUltramarine  = vec3(0.06, 0.38, 0.82);
    vec3 colElectricCyan = vec3(0.08, 0.75, 0.92);
    vec3 colStarlight    = vec3(0.55, 1.10, 1.45);

    float heat = clamp(smoothstep(0.32, 0.76, mBoil) * (0.55 + 0.65 * ridgeArc) + plasmaRibbon * 0.48, 0.0, 1.35);
    heat *= (1.0 - textCavity * 0.95);

    vec3 midCol = mix(colAmethyst, colUltramarine, smoothstep(0.10, 0.44, heat));
    midCol = mix(midCol, colElectricCyan, smoothstep(0.40, 0.78, heat));
    midCol = mix(midCol, colStarlight, clamp(searingVein * 1.25 + smoothstep(0.88, 1.30, heat) * 0.45, 0.0, 1.0));

    // Blend Layer 2 over Layer 1
    float midAlpha = clamp(mStructure * 0.90, 0.0, 0.95);
    compCol = compCol * (1.0 - midAlpha) + midCol * midAlpha;
    compAlpha = compAlpha + midAlpha * (1.0 - compAlpha);

    // Completely clear out any residual emission inside the text window
    compCol *= (1.0 - textCavity * 0.94);
    compAlpha *= (1.0 - textCavity * 0.90);

    // --- LAYER 3 (FOREGROUND DARK BOK-DUST & LIVING CYAN RIM, dz = +135) ---
    float tFront = (135.0 - ro.z) * invRdZ;
    vec2 pFront = (ro.xy + rd.xy * max(tFront, 0.0)) / vec2(650.0, 620.0);
    vec3 qF = vec3(pFront * 2.65, 3.7);

    float fw1 = fbm3(qF + vec3(evo * 0.16, -evo * 0.19, 0.0));
    float fDustRaw = fbm5(qF * 1.45 + 1.5 * vec3(fw1 - 0.5, -fw1 + 0.5, evo * 0.08));
    float fRimVein = 1.0 - abs(2.0 * fbm3(qF * 1.8 + vec3(fw1, 0.0, -evo * 0.14)) - 1.0);
    float fCyanEdge = pow(clamp(fRimVein, 1e-4, 1.0), 5.5);

    // Dark obsidian dust lanes concentrated on periphery folds
    float fRad = length((pFront - vec2(-0.08, 0.06)) * vec2(0.95, 0.85));
    float fMask = (1.0 - smoothstep(0.15, 0.86, fRad)) * smoothstep(-0.45, 0.35, -pFront.x + pFront.y * 0.35);
    float dustAlpha = smoothstep(0.46, 0.82, fDustRaw) * fMask * 0.84 * (1.0 - textCavity * 0.85);

    // Dark obsidian dust absorbs background glow while its rim shimmers with vibrant electric cyan
    vec3 dustCol = vec3(0.005, 0.007, 0.014) + vec3(0.14, 0.78, 0.95) * fCyanEdge * smoothstep(0.40, 0.65, fDustRaw) * 0.90;
    compCol = compCol * (1.0 - dustAlpha) + dustCol * dustAlpha;
    compAlpha = compAlpha + dustAlpha * (1.0 - compAlpha);

    float finalAlpha = clamp(compAlpha * vignette * uOpacity, 0.0, 1.0);
    if (finalAlpha < 0.003) discard;

    // High dynamic range filmic mapping:
    // Preserves punchy obsidian blacks and vivid cosmic cyan/violet saturation with zero washed-out chalkiness
    vec3 hdr = compCol;
    vec3 filmic = hdr / (vec3(1.0) + hdr * 0.28);
    // Deep S-curve contrast boost: eliminates pale pastels and gives rich, vivid celestial depth
    filmic = pow(filmic, vec3(1.18));

    gl_FragColor = vec4(filmic, finalAlpha);
  }
`;

export const foregroundVeilFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  ${sunGradeNoiseGlsl}

  void main() {
    if (uOpacity < 0.005) discard;
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    if (r >= 1.0) discard;

    // Clear center so foreground veil NEVER clouds or obscures the typography
    float textClear = smoothstep(0.20, 0.70, r);

    float evo = uTime * 0.45;
    vec3 q = vec3(p.x * 2.4, p.y * 2.1, 0.0);
    float w = fbm3(q + vec3(0.0, evo * 0.22, evo * 0.14));
    float n = fbm5(q * 1.5 + 1.4 * vec3(w - 0.5, -w + 0.5, 0.0));
    float vein = pow(clamp(1.0 - abs(2.0 * n - 1.0), 1e-4, 1.0), 5.5);

    float mask = pow(max(1.0 - r, 1e-4), 2.2) * textClear;
    float wisp = smoothstep(0.48, 0.86, n * 0.68 + vein * 0.50) * mask;
    float alpha = wisp * 0.22 * uOpacity;
    if (alpha < 0.003) discard;

    // Vivid electric cyan celestial rim smoke
    vec3 col = mix(vec3(0.01, 0.02, 0.04), vec3(0.20, 0.90, 1.25), vein);
    gl_FragColor = vec4(col, alpha);
  }
`;

export const forgeProtoStarVertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  uniform float uTime;
  varying vec3 vColor;
  varying float vPulse;

  void main() {
    vColor = aColor;
    float pulse = 0.88 + 0.12 * sin(uTime * 2.1 + position.x * 0.025 + position.y * 0.035);
    vPulse = pulse;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * pulse;
    gl_Position = projectionMatrix * mv;
  }
`;

export const forgeProtoStarFragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vPulse;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p) * 2.0;
    if (d >= 1.0) discard;

    // Brilliant photographic stellar core + silky exponential halo matching ref_sector_02.jpeg stars
    float core = exp(-d * d * 28.0);
    float innerHalo = exp(-d * 5.2) * 0.46;
    float outerHalo = exp(-d * 2.6) * 0.14 * (1.0 - smoothstep(0.65, 1.0, d));

    // Authentic 8-ray astrograph diffraction star flare (rotated 14° so never a plain '+' cross)
    vec2 p1 = vec2(p.x * 0.9703 - p.y * 0.2419, p.x * 0.2419 + p.y * 0.9703);
    float rMain1 = exp(-abs(p1.y) * 58.0) * exp(-abs(p1.x) * 3.6);
    float rMain2 = exp(-abs(p1.x) * 58.0) * exp(-abs(p1.y) * 3.6);

    // Secondary 45° diagonal rays
    vec2 p2 = vec2((p1.x - p1.y) * 0.7071, (p1.x + p1.y) * 0.7071);
    float rDiag1 = exp(-abs(p2.y) * 72.0) * exp(-abs(p2.x) * 5.2);
    float rDiag2 = exp(-abs(p2.x) * 72.0) * exp(-abs(p2.y) * 5.2);

    float spikes = (rMain1 + rMain2) * 0.72 + (rDiag1 + rDiag2) * 0.36;

    float intensity = (core + innerHalo + outerHalo + spikes) * uOpacity * vPulse;
    if (intensity < 0.006) discard;

    vec3 col = mix(vColor, vec3(1.18, 1.14, 1.06), clamp(core * 1.2, 0.0, 1.0));
    gl_FragColor = vec4(col * intensity * 1.25, intensity);
  }
`;
