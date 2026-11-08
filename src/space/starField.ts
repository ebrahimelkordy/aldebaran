import { BufferGeometry, Float32BufferAttribute, Group, LineSegments, Points, ShaderMaterial, Vector3 } from 'three';
import { GALAXY_BAND_NORMAL, LOW_END_DEVICE, MAX_PIXEL_RATIO, type Vec3 } from '@/space/constants';
import { createRandom } from '@/space/sceneBuilders';
import {
  starPointFragmentShader,
  starPointVertexShader,
  starStreakFragmentShader,
  starStreakVertexShader,
} from '@/space/shaders';

const STAR_COUNT = LOW_END_DEVICE ? 8000 : 26000;
const SHELL_MIN = 14000;
const SHELL_MAX = 32000;
const FIELD_CENTER = new Vector3(0, 0, -4000);
const BAND_NORMAL = new Vector3(...GALAXY_BAND_NORMAL).normalize();
const BAND_U = new Vector3().crossVectors(BAND_NORMAL, new Vector3(1, 0, 0)).normalize();
const BAND_V = new Vector3().crossVectors(BAND_NORMAL, BAND_U);
const BAND_FRACTION = 0.6;
const BAND_SPREAD = 0.13;

const STELLAR_CLASSES: readonly { color: Vec3; weight: number }[] = [
  { color: [0.61, 0.7, 1.0], weight: 0.01 },
  { color: [0.8, 0.86, 1.0], weight: 0.05 },
  { color: [0.97, 0.97, 1.0], weight: 0.08 },
  { color: [1.0, 0.95, 0.84], weight: 0.12 },
  { color: [1.0, 0.82, 0.6], weight: 0.22 },
  { color: [1.0, 0.62, 0.42], weight: 0.52 },
];

function pickStellarColor(random: () => number): Vec3 {
  let roll = random();
  for (const stellarClass of STELLAR_CLASSES) {
    roll -= stellarClass.weight;
    if (roll <= 0) return stellarClass.color;
  }
  return STELLAR_CLASSES[STELLAR_CLASSES.length - 1].color;
}

function uniformDirection(random: () => number): Vector3 {
  const u = random() * 2 - 1;
  const theta = random() * Math.PI * 2;
  const ring = Math.sqrt(1 - u * u);
  return new Vector3(ring * Math.cos(theta), u, ring * Math.sin(theta));
}

function bandDirection(random: () => number): Vector3 {
  const phi = random() * Math.PI * 2;
  const latitude = (random() + random() + random() - 1.5) * BAND_SPREAD * 2;
  return new Vector3()
    .copy(BAND_U)
    .multiplyScalar(Math.cos(phi))
    .addScaledVector(BAND_V, Math.sin(phi))
    .addScaledVector(BAND_NORMAL, latitude)
    .normalize();
}

export function buildStarField() {
  const random = createRandom(73);
  const pixelRatio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const brights = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    const direction = random() < BAND_FRACTION ? bandDirection(random) : uniformDirection(random);
    const radius = SHELL_MIN + (SHELL_MAX - SHELL_MIN) * Math.cbrt(random());
    positions[i * 3] = FIELD_CENTER.x + direction.x * radius;
    positions[i * 3 + 1] = FIELD_CENTER.y + direction.y * radius;
    positions[i * 3 + 2] = FIELD_CENTER.z + direction.z * radius;

    colors.set(pickStellarColor(random), i * 3);
    const tier = random();
    if (tier < 0.84) {
      // 84% Deep micro-stars
      sizes[i] = 0.6 + random() * 0.7;
      brights[i] = 0.2 + random() * 0.45;
    } else if (tier < 0.975) {
      // 13.5% Mid-field stars
      sizes[i] = 1.3 + random() * 1.5;
      brights[i] = 0.45 + random() * 0.45;
    } else {
      // 2.5% Brilliant beacons with optical glint
      sizes[i] = 3.2 + random() * 3.8;
      brights[i] = 0.9 + random() * 0.4;
    }
  }

  const shared = {
    uTime: { value: 0 },
    uWarp: { value: 0 },
    uOpacity: { value: 1.0 },
    uTail: { value: new Vector3() },
  };
  const group = new Group();

  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  pointGeometry.setAttribute('aColor', new Float32BufferAttribute(colors, 3));
  pointGeometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
  pointGeometry.setAttribute('aBright', new Float32BufferAttribute(brights, 1));
  const pointMaterial = new ShaderMaterial({
    uniforms: { ...shared, uPixelRatio: { value: pixelRatio } },
    vertexShader: starPointVertexShader,
    fragmentShader: starPointFragmentShader,
    transparent: true,
    depthWrite: false,
  });

  const streakPositions = new Float32Array(STAR_COUNT * 6);
  const streakColors = new Float32Array(STAR_COUNT * 6);
  const streakEnds = new Float32Array(STAR_COUNT * 2);
  const streakBrights = new Float32Array(STAR_COUNT * 2);
  for (let i = 0; i < STAR_COUNT; i++) {
    for (let end = 0; end < 2; end++) {
      const vertex = i * 2 + end;
      streakPositions.set(positions.subarray(i * 3, i * 3 + 3), vertex * 3);
      streakColors.set(colors.subarray(i * 3, i * 3 + 3), vertex * 3);
      streakEnds[vertex] = end;
      streakBrights[vertex] = brights[i];
    }
  }
  const streakGeometry = new BufferGeometry();
  streakGeometry.setAttribute('position', new Float32BufferAttribute(streakPositions, 3));
  streakGeometry.setAttribute('aColor', new Float32BufferAttribute(streakColors, 3));
  streakGeometry.setAttribute('aEnd', new Float32BufferAttribute(streakEnds, 1));
  streakGeometry.setAttribute('aBright', new Float32BufferAttribute(streakBrights, 1));
  const streakMaterial = new ShaderMaterial({
    uniforms: shared,
    vertexShader: starStreakVertexShader,
    fragmentShader: starStreakFragmentShader,
    transparent: true,
    depthWrite: false,
  });

  group.add(new Points(pointGeometry, pointMaterial), new LineSegments(streakGeometry, streakMaterial));

  return {
    group,
    update(time: number, warpIntensity: number, tail: Vector3) {
      shared.uTime.value = time;
      shared.uWarp.value = warpIntensity;
      shared.uTail.value.copy(tail);
    },
  };
}
