import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineLoop,
  LinearFilter,
  Mesh,
  type PerspectiveCamera,
  PlaneGeometry,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import { LOW_END_DEVICE, PALETTE, REST_FOV, SECTORS, STAR_LIGHT_COLOR } from '@/space/constants';
import { PROJECTS, type BodyDef } from '@/space/content';
import {
  atmosphereFragmentShader,
  atmosphereVertexShader,
  planetFragmentShader,
  planetVertexShader,
  ringFragmentShader,
  ringVertexShader,
} from '@/space/planetShaders';
import { createRandom } from '@/space/sceneBuilders';
import { createStarPoints, type StarSample } from '@/space/starPoints';

const SYSTEM_CENTER = new Vector3(...SECTORS[1].position);
// Offset flagship ringed planet to left-center (x ~ 22.5%, y ~ 48.5%) matching ref_sector_01.jpeg
const PLANET_OFFSET = new Vector3(-395, 10, 0);
const PLANET_WORLD_CENTER = SYSTEM_CENTER.clone().add(PLANET_OFFSET);

const LIGHT_DIRECTION = new Vector3(0.84, -0.34, 0.42).normalize();
const LIGHT_COLOR = new Vector3(...STAR_LIGHT_COLOR);

const FLAGSHIP_RADIUS = PROJECTS[0].body.size; // 150
const DUST_COUNT = LOW_END_DEVICE ? 700 : 1400;
const DUST_INNER = 205;
const DUST_OUTER = 540;
const DUST_THICKNESS = 24;

// Outer ring radius = 150 * 2.64 = 396. Every moon orbits strictly outside r >= 450 (zero ring intersection!)
const RING_INNER = 1.36;
const RING_OUTER = 2.64;

const SYSTEM_ROLL_Z = -0.56;
const SYSTEM_TILT_X = 0.49;
const RING_NORMAL = new Vector3(0, 1, 0)
  .applyAxisAngle(new Vector3(1, 0, 0), SYSTEM_TILT_X)
  .applyAxisAngle(new Vector3(0, 0, 1), SYSTEM_ROLL_Z)
  .normalize();

const ATMOSPHERE_SCALE = 1.075;
const OUTER_HAZE_SCALE = 1.18;
const OUTER_HAZE_STRENGTH = 0.3;
const CREAM = new Color(PALETTE.cream);

export interface PlanetSystem {
  group: Group;
  meshes: Mesh[];
  update(
    time: number,
    hovered: number | null,
    focused: number | null,
    opacity?: number,
    camera?: PerspectiveCamera,
    framing?: number,
  ): void;
  worldPosition(index: number, target: Vector3): Vector3;
  ringAnchorPosition(target: Vector3): Vector3;
  refreshTextures?(): void;
  dispose?(): void;
}

// Distinct 3D inclined orbital planes for each moon (relative to `PLANET_OFFSET`):
// Every moon has `semiMinor - size > RING_OUTER * 150` (> 415 > 396), so NO moon can EVER touch or sink into the rings!
// Each moon also has its own orbital inclination (`planeTiltX`, `planeRollZ`, `planeNodeY`) and Keplerian velocity
// (including retrograde motion on P-02) so they move on completely independent, realistic celestial paths.
interface DistinctMoonOrbit {
  semiMajor: number;
  semiMinor: number;
  planeTiltX: number;
  planeRollZ: number;
  planeNodeY: number;
  speed: number;
  phase: number;
  spinSpeed: number;
  size: number;
  palette: { dark: [number, number, number]; mid: [number, number, number]; light: [number, number, number] };
}

const MOON_ORBITS: Record<number, DistinctMoonOrbit> = {
  // P-01 (LYRA CRM): Large cratered moon on a low-inclination outer prograde orbit
  1: {
    semiMajor: 452,
    semiMinor: 438,
    planeTiltX: 0.38,
    planeRollZ: -0.44,
    planeNodeY: 0.15,
    speed: 0.155,
    phase: 0.58,
    spinSpeed: 0.22,
    size: 29,
    palette: { dark: [0.18, 0.18, 0.18], mid: [0.54, 0.52, 0.49], light: [0.84, 0.82, 0.78] },
  },
  // P-02 (HALO VAULT): Inclined retrograde moon (Triton-style) sweeping upper-left to lower-right on a steep plane
  2: {
    semiMajor: 518,
    semiMinor: 496,
    planeTiltX: 0.86,
    planeRollZ: -0.92,
    planeNodeY: 0.65,
    speed: -0.115,
    phase: 2.75,
    spinSpeed: -0.18,
    size: 20,
    palette: { dark: [0.2, 0.19, 0.18], mid: [0.52, 0.5, 0.48], light: [0.8, 0.78, 0.75] },
  },
  // P-03 (ORBIT STUDIO): Warm terracotta-orange moon on an inclined prograde plane sweeping across 'S' of SELECTED WORK
  3: {
    semiMajor: 486,
    semiMinor: 470,
    planeTiltX: 0.62,
    planeRollZ: -0.22,
    planeNodeY: -0.35,
    speed: 0.13,
    phase: -0.38,
    spinSpeed: 0.25,
    size: 24,
    palette: { dark: [0.24, 0.09, 0.03], mid: [0.76, 0.36, 0.12], light: [0.98, 0.62, 0.28] },
  },
  // P-04 (VERA COMMERCE): Distant high-inclination icy moonlet on a wide outer ellipse
  4: {
    semiMajor: 582,
    semiMinor: 548,
    planeTiltX: 0.28,
    planeRollZ: -0.78,
    planeNodeY: 1.1,
    speed: 0.088,
    phase: 1.92,
    spinSpeed: 0.16,
    size: 16,
    palette: { dark: [0.42, 0.42, 0.44], mid: [0.72, 0.72, 0.75], light: [0.9, 0.9, 0.92] },
  },
};

function createAtmosphere(body: BodyDef, scale: number, strength: number) {
  const material = new ShaderMaterial({
    uniforms: {
      uColor: { value: new Vector3(...body.atmosphere) },
      uIntensity: { value: strength },
      uOpacity: { value: 0 },
      uLightDir: { value: LIGHT_DIRECTION },
      uLightColor: { value: LIGHT_COLOR },
    },
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    side: BackSide,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const mesh = new Mesh(new SphereGeometry(body.size * scale, 64, 48), material);
  mesh.renderOrder = 2;
  return { mesh, material };
}

function createRing(body: BodyDef) {
  const inner = body.size * RING_INNER;
  const outer = body.size * RING_OUTER;
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Vector3(...body.palette.mid) },
      uInner: { value: inner },
      uOuter: { value: outer },
      uOpacity: { value: 0 },
      uLightDir: { value: LIGHT_DIRECTION },
      uLightColor: { value: LIGHT_COLOR },
      uRingNormal: { value: RING_NORMAL },
      uCenter: { value: PLANET_WORLD_CENTER },
      uRadius: { value: body.size },
    },
    vertexShader: ringVertexShader,
    fragmentShader: ringFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: DoubleSide,
  });
  const ring = new Mesh(new RingGeometry(inner, outer, 192), material);
  ring.rotation.x = -Math.PI / 2;
  ring.renderOrder = 3;
  return { mesh: ring, material };
}

function createPlanet(body: BodyDef, overrideSize?: number, overridePalette?: DistinctMoonOrbit['palette']) {
  const isMoon = body.orbit !== null;
  const radius = overrideSize ?? body.size;
  const pal = overridePalette ?? body.palette;
  const subMaterials: ShaderMaterial[] = [];

  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uHover: { value: 0 },
      uOpacity: { value: 0 },
      uBands: { value: body.bands ? 1 : 0 },
      uColorA: { value: new Vector3(...pal.dark) },
      uColorB: { value: new Vector3(...pal.mid) },
      uColorC: { value: new Vector3(...pal.light) },
      uLightDir: { value: LIGHT_DIRECTION },
      uLightColor: { value: LIGHT_COLOR },
      uCenter: { value: PLANET_WORLD_CENTER },
      uShadowRadius: { value: FLAGSHIP_RADIUS },
      uRingNormal: { value: RING_NORMAL },
      uRingInner: { value: body.rings ? radius * RING_INNER : 0 },
      uRingOuter: { value: body.rings ? radius * RING_OUTER : 0 },
    },
    vertexShader: planetVertexShader,
    fragmentShader: planetFragmentShader,
    transparent: true,
    depthWrite: true,
  });
  subMaterials.push(material);

  const mesh = new Mesh(new SphereGeometry(radius, 96, 64), material);
  mesh.renderOrder = 2;

  if (!isMoon) {
    const innerAtmo = createAtmosphere(body, ATMOSPHERE_SCALE, body.glow * 0.65);
    mesh.add(innerAtmo.mesh);
    subMaterials.push(innerAtmo.material);

    if (body.glow > 0) {
      const outerAtmo = createAtmosphere(body, OUTER_HAZE_SCALE, body.glow * OUTER_HAZE_STRENGTH);
      mesh.add(outerAtmo.mesh);
      subMaterials.push(outerAtmo.material);
    }
  }

  if (body.rings) {
    const ring = createRing(body);
    mesh.add(ring.mesh);
    subMaterials.push(ring.material);
  }

  return { mesh, material, subMaterials };
}

function createSelectedWorkPlane() {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;

  const drawText = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const label = 'SELECTED WORK';
    const fontSize = 860;
    ctx.font = `700 ${fontSize}px "Antonio", "Bebas Neue", "Anton", sans-serif`;
    ctx.textBaseline = 'alphabetic';
    const metrics = ctx.measureText(label);
    const measuredW = Math.max(metrics.width, 1);
    const targetW = canvas.width * 0.992;
    const scaleX = targetW / measuredW;

    ctx.save();
    ctx.scale(scaleX, 1.06);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, 8 / scaleX, 865);
    ctx.restore();
    texture.needsUpdate = true;
  };

  drawText();
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      drawText();
    });
  }

  const material = new ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uOpacity: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        vec4 tex = texture2D(uMap, vUv);
        if (tex.a < 0.01) discard;
        vec3 crispWhite = vec3(0.84, 0.835, 0.82);
        gl_FragColor = vec4(crispWhite, tex.a * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
  });

  const mesh = new Mesh(new PlaneGeometry(1, 1), material);
  mesh.renderOrder = 1;
  return { mesh, material };
}

function createSubtleOrbitArc(semiMajor: number, semiMinor = semiMajor, opacity = 0.065): LineLoop {
  const segments = 192;
  const points = Array.from({ length: segments }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return new Vector3(Math.cos(a) * semiMajor, 0, Math.sin(a) * semiMinor);
  });
  const loop = new LineLoop(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({ color: CREAM, transparent: true, opacity, depthWrite: false }),
  );
  loop.renderOrder = 1;
  return loop;
}

function createDust() {
  const random = createRandom(29);
  const samples = Array.from({ length: DUST_COUNT }, (): StarSample => {
    const angle = random() * Math.PI * 2;
    const radius = DUST_INNER + (DUST_OUTER - DUST_INNER) * Math.sqrt(random());
    return {
      position: [Math.cos(angle) * radius, (random() - 0.5) * DUST_THICKNESS, Math.sin(angle) * radius],
      color: random() > 0.5 ? [1.0, 0.9, 0.72] : [0.75, 0.8, 0.88],
      size: 0.8 + Math.pow(random(), 4) * 2.2,
      bright: 0.18 + random() * 0.42,
    };
  });
  return createStarPoints(samples);
}

export function buildPlanetSystem(): PlanetSystem {
  const group = new Group();
  group.position.copy(SYSTEM_CENTER);

  // 3D "SELECTED WORK" plane positioned behind the ring & moon system (z = -340)
  const selectedWork = createSelectedWorkPlane();
  const PLANE_Z = -340;
  selectedWork.mesh.position.set(220, 180, PLANE_Z);
  group.add(selectedWork.mesh);

  // Anchor at planet center (`PLANET_OFFSET`) holding both the ringed planet rig AND each moon's independent orbital plane
  const planetCenterAnchor = new Group();
  planetCenterAnchor.position.copy(PLANET_OFFSET);
  group.add(planetCenterAnchor);

  // Ringed planet rig (-32deg roll & +28deg equatorial tilt)
  const rollRig = new Group();
  rollRig.rotation.z = SYSTEM_ROLL_Z;

  const tiltRig = new Group();
  tiltRig.rotation.x = SYSTEM_TILT_X;
  rollRig.add(tiltRig);
  planetCenterAnchor.add(rollRig);

  const ringBeacon = new Group();
  ringBeacon.position.set(225, 0, 45);
  tiltRig.add(ringBeacon);

  const dust = createDust();
  tiltRig.add(dust.object);

  const orbitLines: LineLoop[] = [];

  const bodies = PROJECTS.map((project, index) => {
    const orbit = MOON_ORBITS[index];
    const { mesh, material, subMaterials } = createPlanet(
      project.body,
      orbit?.size,
      orbit?.palette,
    );

    if (index === 0) {
      tiltRig.add(mesh);
    } else if (orbit) {
      // Dedicated 3D inclined orbital plane per moon — distinct track, zero ring clipping!
      const moonPlane = new Group();
      moonPlane.rotation.order = 'ZXY';
      moonPlane.rotation.z = orbit.planeRollZ;
      moonPlane.rotation.x = orbit.planeTiltX;
      moonPlane.rotation.y = orbit.planeNodeY;

      const arc = createSubtleOrbitArc(orbit.semiMajor, orbit.semiMinor, 0.06);
      orbitLines.push(arc);
      moonPlane.add(arc, mesh);
      planetCenterAnchor.add(moonPlane);
    } else {
      planetCenterAnchor.add(mesh);
    }

    return { mesh, material, subMaterials, orbit, hoverVal: 0 };
  });

  return {
    group,
    meshes: bodies.map((body) => body.mesh),
    update(time, hovered, focused, opacity = 1.0, camera, framing = 1.0) {
      group.visible = opacity > 0.002;
      if (!group.visible) return;

      const aspect = camera?.aspect ?? 16 / 9;
      const baseCamZ = SECTORS[1].camera[2] * framing;
      const distToPlane = baseCamZ - PLANE_Z;
      const frustumH = 2 * distToPlane * Math.tan((REST_FOV * Math.PI) / 360);
      const frustumW = frustumH * aspect;

      const xLeft = (-0.5 + 0.364) * frustumW;
      const xRight = (-0.5 + 1.006) * frustumW;
      const yTop = (0.5 - 0.124) * frustumH;
      const yBottom = (0.5 - 0.382) * frustumH;

      selectedWork.mesh.position.set((xLeft + xRight) * 0.5, (yTop + yBottom) * 0.5, PLANE_Z);
      selectedWork.mesh.scale.set(xRight - xLeft, yTop - yBottom, 1);
      selectedWork.material.uniforms.uOpacity.value = focused !== null ? opacity * 0.22 : opacity;

      const beaconAngle = 0.18 + Math.sin(time * 0.35) * 0.08;
      ringBeacon.position.set(Math.cos(beaconAngle) * 235, 0, Math.sin(beaconAngle) * 235);

      dust.material.uniforms.uTime.value = time;
      if (dust.material.uniforms.uOpacity) {
        dust.material.uniforms.uOpacity.value = opacity * 0.75;
      }
      dust.object.rotation.y = time * 0.015;

      orbitLines.forEach((line) => {
        (line.material as LineBasicMaterial).opacity = 0.06 * opacity;
      });

      bodies.forEach((body, index) => {
        if (body.orbit) {
          const angle = body.orbit.phase + time * body.orbit.speed;
          body.mesh.position.set(
            Math.cos(angle) * body.orbit.semiMajor,
            0,
            Math.sin(angle) * body.orbit.semiMinor,
          );
          body.mesh.rotation.y = time * body.orbit.spinSpeed + index;
        }

        const targetHover = index === hovered || index === focused ? 1.0 : 0.0;
        body.hoverVal += (targetHover - body.hoverVal) * 0.12;

        body.material.uniforms.uTime.value = time;
        body.material.uniforms.uHover.value = body.hoverVal;

        body.subMaterials.forEach((mat) => {
          mat.uniforms.uOpacity.value = opacity;
          if (mat.uniforms.uTime) {
            mat.uniforms.uTime.value = time;
          }
        });
      });
    },
    worldPosition(index, target) {
      return bodies[index].mesh.getWorldPosition(target);
    },
    ringAnchorPosition(target) {
      return ringBeacon.getWorldPosition(target);
    },
    refreshTextures() {
      selectedWork.texture.needsUpdate = true;
    },
    dispose() {
      group.traverse((child) => {
        if ('geometry' in child && (child as Mesh).geometry) {
          (child as Mesh).geometry.dispose();
        }
        if ('material' in child && (child as Mesh).material) {
          const mat = (child as Mesh).material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      selectedWork.texture.dispose();
      dust.object.geometry.dispose();
      dust.material.dispose();
    },
  };
}
