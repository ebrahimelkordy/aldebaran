import { simplexNoiseGlsl } from '@/space/shaders';

export const blackHoleVertexShader = /* glsl */ `
  varying vec3 vWorld;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const blackHoleFragmentShader = /* glsl */ `
  uniform vec3 uCam;
  uniform vec3 uCenter;
  uniform vec3 uDiskNormal;
  uniform float uRs;
  uniform float uInner;
  uniform float uOuter;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vWorld;

  ${simplexNoiseGlsl}

  const int MAX_STEPS = 160;
  const float ESCAPE_RADIUS = 40.0;

  vec3 rotateAbout(vec3 v, vec3 axis, float angle) {
    return v * cos(angle) + cross(axis, v) * sin(angle) + axis * dot(axis, v) * (1.0 - cos(angle));
  }

  vec3 diskEmission(vec3 q, vec3 n, vec3 toCam, float rd, float time) {
    vec3 radial = q - n * dot(q, n);
    vec3 tangent = cross(n, radial);
    tangent /= max(length(tangent), 1e-5);

    // Orthonormal disk-plane basis for spiral azimuthal plasma waves (zero extra noise cost)
    vec3 uAxis = normalize(abs(n.y) < 0.9 ? cross(n, vec3(0.0, 1.0, 0.0)) : cross(n, vec3(1.0, 0.0, 0.0)));
    vec3 vAxis = cross(n, uAxis);
    float phi = atan(dot(radial, vAxis), dot(radial, uAxis));

    float g = clamp(1.0 + 0.62 * dot(tangent, toCam), 0.35, 1.95);
    float beam = pow(g, 2.55);

    // Visibly flowing Keplerian differential rotation (faster near photon sphere, trailing outward)
    float omega = 3.1 * pow(rd, -1.25);
    vec3 qr = rotateAbout(q, n, -time * omega);
    vec3 sp = qr * 0.9;
    float n1 = snoise(sp + vec3(0.0, 0.0, time * 0.08));
    float n2 = snoise(sp * 2.6 + vec3(7.1, 3.3, -time * 0.06));
    float n3 = snoise(sp * 5.0 - vec3(0.0, 2.2, time * 0.12));
    float turbulence = 0.6 * n1 + 0.4 * n2;
    float clump = smoothstep(-0.25, 0.55, turbulence);
    float filament = pow(clamp(1.0 - abs(n3), 0.0, 1.0), 6.0);

    // Spiraling relativistic plasma arms + inward-drifting concentric striations
    float spiral = 0.82 + 0.18 * sin(phi * 3.0 + rd * 1.4 - time * 1.35 + n1 * 2.0);
    float striations = 0.72 + 0.28 * sin(rd * 34.0 + time * 1.45 + n1 * 3.0);
    float shimmer = 1.0 + 0.06 * sin(time * 2.2 - phi * 2.0);

    float edge = smoothstep(uInner * 0.98, uInner * 1.08, rd) * (1.0 - smoothstep(uOuter * 0.52, uOuter, rd));
    float T = pow(uInner / rd, 1.08) * (0.48 + 0.75 * clump) * striations * spiral;

    vec3 deep = vec3(0.58, 0.12, 0.015);
    vec3 mid = vec3(1.05, 0.54, 0.14);
    vec3 hot = vec3(1.15, 0.96, 0.82);
    vec3 color = mix(deep, mid, smoothstep(0.14, 0.58, T));
    color = mix(color, hot, smoothstep(0.58, 1.08, T));

    float intensity = edge * T * beam * shimmer * 1.18 * (0.52 + 0.78 * clump + 0.38 * filament);
    return color * intensity;
  }

  void main() {
    if (uOpacity <= 0.005) {
      discard;
      return;
    }
    vec3 center = uCenter;
    vec3 p = (uCam - center) / uRs;
    vec3 toCam = normalize(uCam - center);
    vec3 v = normalize(vWorld - uCam);
    vec3 n = uDiskNormal;

    vec3 L = cross(p, v);
    float h2 = dot(L, L);
    float prevSide = dot(p, n);
    vec3 prevP = p;

    vec3 col = vec3(0.0);
    int hits = 0;
    bool captured = false;

    for (int i = 0; i < MAX_STEPS; i++) {
      float r = length(p);
      if (r < 1.0) {
        captured = true;
        break;
      }
      if (r > ESCAPE_RADIUS && dot(p, v) > 0.0) break;

      float dt = clamp(0.06 * r, 0.01, 0.6);
      float r2 = r * r;
      vec3 acceleration = -1.5 * h2 * p / (r2 * r2 * r);
      v = normalize(v + acceleration * dt);
      prevP = p;
      p += v * dt;

      float side = dot(p, n);
      if (side * prevSide < 0.0 && hits < 3) {
        float t = prevSide / (prevSide - side);
        vec3 q = mix(prevP, p, t);
        float rd = length(q - n * dot(q, n));
        if (rd > uInner && rd < uOuter) {
          col += diskEmission(q, n, toCam, rd, uTime) * (hits == 0 ? 1.0 : 0.62);
          hits++;
        }
      }
      prevSide = side;
    }

    if (captured && hits == 0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, uOpacity);
    } else if (hits > 0) {
      float lum = clamp(max(col.r, max(col.g, col.b)) * 1.15, 0.0, 1.0);
      float diskAlpha = captured ? 1.0 : clamp(pow(lum, 0.62), 0.0, 0.96);
      gl_FragColor = vec4(col * uOpacity, diskAlpha * uOpacity);
    } else {
      gl_FragColor = vec4(0.0);
    }
  }
`;
