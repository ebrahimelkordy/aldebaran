import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
} from 'three';

export const shockwaveVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const shockwaveFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;    // 0.0 -> 1.0
  uniform vec3 uColorCore;    // [1.0, 0.96, 0.88]
  uniform vec3 uColorEdge;    // [0.95, 0.62, 0.25]
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    // Coordinate normalized to center [-1, 1]
    vec2 p = vUv * 2.0 - 1.0;
    float dist = length(p);
    if (dist > 1.0) discard;

    // Relativistic gravitational wave pulse front
    float waveRadius = clamp(uProgress * 0.96 + 0.02, 0.01, 0.98);
    float waveWidth = mix(0.14, 0.038, uProgress); // Sharpens and thins out as wavefront expands

    float delta = abs(dist - waveRadius);
    if (delta > waveWidth * 1.5) discard;

    // Relativistic Gaussian pulse shape
    float pulse = exp(-pow(delta / (waveWidth * 0.42), 2.0));

    // Chromatic gravitational dispersion:
    // Leading edge is Doppler-blueshifted, trailing wake is redshifted
    float dispersion = clamp((dist - waveRadius) / waveWidth, -1.0, 1.0);
    vec3 blueShift = vec3(0.55, 0.78, 1.25);
    vec3 redShift = vec3(1.2, 0.38, 0.12);
    vec3 spectralColor = mix(redShift, blueShift, smoothstep(-0.6, 0.6, dispersion));

    vec3 blendedColor = mix(spectralColor, uColorCore, pulse * 0.8);

    // Geometric 1/r energy conservation attenuation
    float attenuation = pow(1.0 - uProgress, 1.8) * (1.0 / (1.0 + uProgress * 2.2));
    float alpha = pulse * attenuation * 0.92;

    // Subtle interference ripples on the trailing wake
    float ripple = sin((dist - waveRadius) * 65.0 - uTime * 12.0) * 0.15;
    alpha = clamp(alpha + ripple * pulse * attenuation, 0.0, 1.0);

    gl_FragColor = vec4(blendedColor * (1.2 + pulse * 1.8), alpha);
  }
`;

export interface RelativisticShockwaveInstance {
  mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  age: number;
  duration: number;
  maxRadius: number;
}

export function createRelativisticShockwave(
  duration = 1.85,
  maxRadius = 380,
): RelativisticShockwaveInstance {
  const geometry = new PlaneGeometry(2, 2, 1, 1);
  const material = new ShaderMaterial({
    vertexShader: shockwaveVertexShader,
    fragmentShader: shockwaveFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uColorCore: { value: new Color('#FFF7E0') },
      uColorEdge: { value: new Color('#EAC078') },
    },
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  });

  const mesh = new Mesh(geometry, material);
  mesh.renderOrder = 10;

  return {
    mesh,
    age: 0,
    duration,
    maxRadius,
  };
}
