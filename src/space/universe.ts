import {
  Material,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  ACESFilmicToneMapping,
  WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  FOCUS_OFFSET,
  MAX_PIXEL_RATIO,
  PALETTE,
  REST_FOV,
  SECTORS,
  WARP_DURATION,
  WARP_FOV_BOOST,
} from '@/space/constants';
import { createShockwaveRing, sectorCenter } from '@/space/sceneBuilders';
import { buildPlanetSystem } from '@/space/planetSystem';
import { buildBlackHole } from '@/space/blackHole';
import { buildStarClusters, type Sector2ScreenAnchors } from '@/space/starClusters';
import { buildMainStar } from '@/space/mainStar';
import { buildSkyDome } from '@/space/skyDome';
import { buildStarField } from '@/space/starField';
import { suspendAudioForBackground } from '@/space/audio';
import { spatialStore } from '@/store/spatialStore';
import { anchorBus } from '@/engine/anchorBus';
import type { MoonScreenAnchor } from '@/engine/types';

const UP = new Vector3(0, 1, 0);
const TAIL_LENGTH = 3800;
const SHOCKWAVE_DURATION = 1.4;
const DRAG_YAW = 0.003;
const DRAG_PITCH = 0.002;
const MAX_PITCH = 0.5;
const SWIPE_DISTANCE = 44;
const SWIPE_TIME = 600;
const CLICK_TRAVEL = 6;
const MIN_FRAMING_ASPECT = 1.1;

export interface UniverseCallbacks {
  onWarpStart: (target: number) => void;
  onArrive: (sector: number) => void;
  onProjectClick: (index: number) => void;
}

interface WarpState {
  from: Vector3;
  to: Vector3;
  midPos: Vector3;
  fromLook: Vector3;
  toLook: Vector3;
  midLook: Vector3;
  target: number;
  elapsed: number;
  bankingSign: number;
}

interface Shockwave {
  mesh: Mesh;
  age: number;
}

interface PressState {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  startTime: number;
  travel: number;
  pointerType: string;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothFactor(rate: number, dt: number) {
  return 1 - Math.pow(1 - rate, dt * 60);
}

export class Universe {
  private readonly renderer: WebGLRenderer;
  private readonly composer: EffectComposer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(REST_FOV, 1, 1, 60000);
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly skyDome = buildSkyDome();
  private readonly starfield = buildStarField();
  private readonly aldebaran = buildMainStar();
  private readonly planets = buildPlanetSystem();
  private readonly starClusters = buildStarClusters();
  private readonly horizon = buildBlackHole();
  private framing = 1;
  private readonly camPos = new Vector3();
  private readonly lookPos = new Vector3();
  private readonly motionDir = new Vector3(0, 0, -1);
  private readonly sway = new Vector2();
  private readonly swayCurrent = new Vector2();
  private yaw = 0;
  private pitch = 0;
  private targetYaw = 0;
  private targetPitch = 0;
  private velocityYaw = 0;
  private velocityPitch = 0;
  private lastMoveTime = performance.now();
  private warp: WarpState | null = null;
  private warpIntensity = 0;
  private currentSector = 0;
  private focusIndex: number | null = null;
  private hoverIndex: number | null = null;
  private shockwaves: Shockwave[] = [];
  private shake = 0;
  private time = 0;
  private lastFrame = performance.now();
  private frameId = 0;
  private isContextLost = false;
  private press: PressState | null = null;
  private wheelAccum = 0;
  private wheelTimer: number | undefined;

  constructor(
    private readonly container: HTMLElement,
    private readonly callbacks: UniverseCallbacks,
    initialSector = 0,
  ) {
    this.currentSector = Math.max(0, Math.min(SECTORS.length - 1, initialSector));
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    this.renderer.setClearColor(PALETTE.void);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new Vector2(1, 1), 0.6, 0.35, 1.0));
    this.composer.addPass(new OutputPass());
    this.renderer.domElement.style.display = 'block';
    container.appendChild(this.renderer.domElement);

    this.scene.add(
      this.skyDome,
      this.starfield.group,
      this.aldebaran.group,
      this.planets.group,
      this.starClusters.group,
      this.horizon.group,
    );

    this.resize();
    this.camPos.copy(this.cameraFor(this.currentSector));
    this.lookPos.copy(sectorCenter(this.currentSector));
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.lookPos);
    this.camera.updateProjectionMatrix();

    this.warmupGPU();
    window.addEventListener('resize', this.resize);
    window.addEventListener('blur', this.resetInteraction);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    container.addEventListener('pointerdown', this.handlePointerDown);
    container.addEventListener('pointermove', this.handlePointerMove);
    container.addEventListener('pointerup', this.handlePointerUp);
    container.addEventListener('pointerleave', this.handlePointerLeave);
    container.addEventListener('pointercancel', this.resetInteraction);
    container.addEventListener('wheel', this.handleWheel, { passive: false });
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.handleContextRestored);
    this.frameId = requestAnimationFrame(this.frame);
  }

  jumpInstant(index: number): void {
    if (index < 0 || index >= SECTORS.length) return;
    this.warp = null;
    this.warpIntensity = 0;
    this.currentSector = index;
    this.focusIndex = null;
    this.yaw = 0;
    this.pitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.velocityYaw = 0;
    this.velocityPitch = 0;
    this.camPos.copy(this.cameraFor(index));
    this.lookPos.copy(sectorCenter(index));
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.lookPos);
    this.camera.up.set(0, 1, 0);
    this.camera.updateProjectionMatrix();
  }

  goTo(index: number): boolean {
    if (this.warp || index === this.currentSector || index < 0 || index >= SECTORS.length) return false;
    this.focusIndex = null;
    this.targetYaw = 0;
    this.targetPitch = 0;

    const from = this.camPos.clone();
    const to = this.cameraFor(index);
    const fromLook = this.lookPos.clone();
    const toLook = sectorCenter(index);

    const travelDist = from.distanceTo(to);
    const motion = new Vector3().subVectors(to, from).normalize();
    const lateral = new Vector3().crossVectors(motion, UP).normalize();
    const bankingSign = index > this.currentSector ? 1 : -1;

    // 3D Bezier curve arc control points
    const midPos = from.clone().add(to).multiplyScalar(0.5)
      .addScaledVector(UP, travelDist * 0.15)
      .addScaledVector(lateral, travelDist * 0.12 * bankingSign);

    const midLook = fromLook.clone().add(toLook).multiplyScalar(0.5)
      .addScaledVector(UP, travelDist * 0.04);

    this.warp = {
      from,
      to,
      midPos,
      fromLook,
      toLook,
      midLook,
      target: index,
      elapsed: 0,
      bankingSign,
    };
    this.shake = 0.6; // Launch hyperdrive impulse
    this.callbacks.onWarpStart(index);
    return true;
  }

  step(direction: number): boolean {
    return this.goTo(this.currentSector + Math.sign(direction));
  }

  focusProject(index: number | null) {
    this.focusIndex = index;
    this.targetYaw = 0;
    this.targetPitch = 0;
  }

  getSector1ScreenAnchors(): {
    ringX: number;
    ringY: number;
    moonX: number;
    moonY: number;
    moonBehindPlanet: boolean;
  } | null {
    if (this.currentSector !== 1 || this.warp) return null;
    this.scene.updateMatrixWorld();
    this.camera.updateMatrixWorld();

    const planetWorld = this.planets.worldPosition(0, new Vector3());
    const ringWorld = this.planets.ringAnchorPosition(new Vector3());
    const moonWorld = this.planets.worldPosition(1, new Vector3());

    const moonBehindPlanet =
      moonWorld.z < planetWorld.z - 20 &&
      Math.hypot(moonWorld.x - planetWorld.x, moonWorld.y - planetWorld.y) < 155;

    ringWorld.project(this.camera);
    moonWorld.project(this.camera);

    return {
      ringX: (ringWorld.x + 1) * 0.5,
      ringY: (1 - ringWorld.y) * 0.5,
      moonX: (moonWorld.x + 1) * 0.5,
      moonY: (1 - moonWorld.y) * 0.5,
      moonBehindPlanet,
    };
  }

  getMoonScreenAnchor() {
    return this.getSector1ScreenAnchors();
  }

  setForgeDiscipline(index: number | null) {
    this.starClusters.setActiveDiscipline(index);
  }

  getSector2ScreenAnchors(): Sector2ScreenAnchors | null {
    if (this.currentSector !== 2 || this.warp) return null;
    this.scene.updateMatrixWorld();
    this.camera.updateMatrixWorld();
    return this.starClusters.getScreenAnchors(this.camera);
  }

  emitShockwave() {
    const mesh = createShockwaveRing();
    mesh.position.copy(sectorCenter(3));
    this.scene.add(mesh);
    this.shockwaves.push({ mesh, age: 0 });
    this.shake = 1;
  }

  dispose() {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
    window.clearTimeout(this.wheelTimer);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('blur', this.resetInteraction);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.container.removeEventListener('pointerdown', this.handlePointerDown);
    this.container.removeEventListener('pointermove', this.handlePointerMove);
    this.container.removeEventListener('pointerup', this.handlePointerUp);
    this.container.removeEventListener('pointerleave', this.handlePointerLeave);
    this.container.removeEventListener('pointercancel', this.resetInteraction);
    this.container.removeEventListener('wheel', this.handleWheel);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.composer.dispose();
    this.aldebaran.dispose();
    this.planets.dispose?.();
    this.starClusters.dispose();
    this.horizon.dispose?.();
    this.starfield.dispose?.();
    this.skyDome.geometry.dispose();
    if (Array.isArray(this.skyDome.material)) {
      this.skyDome.material.forEach((m) => m.dispose());
    } else {
      this.skyDome.material.dispose();
    }
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private resetInteraction = () => {
    this.press = null;
    this.velocityYaw = 0;
    this.velocityPitch = 0;
    this.aldebaran.onDragEnd();
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      if (this.frameId) {
        cancelAnimationFrame(this.frameId);
        this.frameId = 0;
      }
      this.resetInteraction();
      suspendAudioForBackground(true);
      if (this.warp) {
        const target = this.warp.target;
        this.jumpInstant(target);
        this.callbacks.onArrive(target);
      }
    } else {
      this.lastFrame = performance.now();
      suspendAudioForBackground(false);
      if (!this.frameId && !this.isContextLost) {
        this.frameId = requestAnimationFrame(this.frame);
      }
    }
  };

  private handleContextLost = (event: Event) => {
    event.preventDefault();
    this.isContextLost = true;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
    spatialStore.setContextLost(true);
  };

  private handleContextRestored = () => {
    this.isContextLost = false;
    this.planets.refreshTextures?.();
    this.starClusters.refreshTextures?.();
    this.horizon.refreshTextures?.();
    spatialStore.setContextLost(false);
    this.lastFrame = performance.now();
    this.jumpInstant(this.currentSector);
    this.frameId = requestAnimationFrame(this.frame);
  };

  private cameraFor(index: number): Vector3 {
    return sectorCenter(index).add(new Vector3(...SECTORS[index].camera).multiplyScalar(this.framing));
  }

  private resize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    const aspect = width / Math.max(height, 1);
    this.framing = Math.max(1, MIN_FRAMING_ASPECT / aspect);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  };

  private updatePointer(clientX: number, clientY: number) {
    const rect = this.container.getBoundingClientRect();
    this.pointer.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
  }

  private pickProject(): number | null {
    if (this.warp || this.currentSector !== 1) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.planets.meshes, false)[0];
    return hit ? this.planets.meshes.indexOf(hit.object as Mesh) : null;
  }

  private handlePointerDown = (event: PointerEvent) => {
    this.container.setPointerCapture(event.pointerId);
    this.velocityYaw = 0;
    this.velocityPitch = 0;
    this.lastMoveTime = performance.now();
    if (this.currentSector === 0 && !this.warp) {
      this.aldebaran.onDragStart();
    }
    this.press = {
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      startTime: performance.now(),
      travel: 0,
      pointerType: event.pointerType,
    };
  };

  private handlePointerMove = (event: PointerEvent) => {
    this.updatePointer(event.clientX, event.clientY);
    this.sway.set(this.pointer.x, this.pointer.y);

    if (this.press) {
      const now = performance.now();
      const dtMove = Math.max((now - this.lastMoveTime) / 1000, 0.008);
      const dx = event.clientX - this.press.lastX;
      const dy = event.clientY - this.press.lastY;
      this.press.lastX = event.clientX;
      this.press.lastY = event.clientY;
      this.press.travel += Math.abs(dx) + Math.abs(dy);
      if (this.currentSector === 0 && !this.warp) {
        this.aldebaran.onDragMove(dx, dy);
      } else {
        this.targetYaw -= dx * DRAG_YAW;
        this.targetPitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.targetPitch + dy * DRAG_PITCH));
        this.velocityYaw = -(dx * DRAG_YAW) / dtMove;
        this.velocityPitch = (dy * DRAG_PITCH) / dtMove;
      }
      this.lastMoveTime = now;
      return;
    }

    this.hoverIndex = this.pickProject();
    this.container.style.cursor = this.hoverIndex !== null ? 'pointer' : 'grab';
  };

  private handlePointerUp = (event: PointerEvent) => {
    this.aldebaran.onDragEnd();
    const press = this.press;
    this.press = null;
    this.container.style.cursor = 'grab';
    if (!press) return;

    const dx = event.clientX - press.startX;
    const dy = event.clientY - press.startY;
    const elapsed = performance.now() - press.startTime;
    const isSwipe = Math.max(Math.abs(dx), Math.abs(dy)) > SWIPE_DISTANCE && elapsed < SWIPE_TIME;

    if (press.pointerType === 'touch' && isSwipe) {
      const delta = Math.abs(dx) > Math.abs(dy) ? -dx : -dy;
      this.step(delta);
      return;
    }

    if (press.travel < CLICK_TRAVEL) {
      this.updatePointer(event.clientX, event.clientY);
      const index = this.pickProject();
      if (index !== null) this.callbacks.onProjectClick(index);
    }
  };

  private handlePointerLeave = () => {
    this.aldebaran.onDragEnd();
    this.hoverIndex = null;
  };

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    this.wheelAccum += event.deltaY;
    window.clearTimeout(this.wheelTimer);
    this.wheelTimer = window.setTimeout(() => {
      this.wheelAccum = 0;
    }, 200);
    if (Math.abs(this.wheelAccum) > 60) {
      this.step(this.wheelAccum);
      this.wheelAccum = 0;
    }
  };

  private frame = (now: number) => {
    const dt = Math.min((now - this.lastFrame) / 1000, 0.05);
    this.lastFrame = now;
    this.time += dt;

    this.updateCamera(dt);
    this.updateScene(dt);
    this.composer.render();
    this.aldebaran.renderOverlay(this.renderer);

    // Single-pass 60fps projection broadcast to anchorBus
    if (this.currentSector === 1 && !this.warp) {
      anchorBus.publish({ orbital: this.getSector1ScreenAnchors() as unknown as MoonScreenAnchor });
    } else if (this.currentSector === 2 && !this.warp) {
      anchorBus.publish({ astrolabe: this.starClusters.getScreenAnchors(this.camera) });
    }

    this.frameId = requestAnimationFrame(this.frame);
  };

  private desiredView(): { pos: Vector3; look: Vector3 } {
    if (this.focusIndex !== null) {
      const look = this.planets.worldPosition(this.focusIndex, new Vector3());
      return { pos: look.clone().add(new Vector3(...FOCUS_OFFSET)), look };
    }
    return { pos: this.cameraFor(this.currentSector), look: sectorCenter(this.currentSector) };
  }

  private updateCamera(dt: number) {
    if (this.warp) {
      const warp = this.warp;
      warp.elapsed += dt;
      const t = Math.min(warp.elapsed / WARP_DURATION, 1);
      const eased = easeInOutCubic(t);

      // Quadratic Bezier interpolation for curved trajectory
      const oneMinus = 1 - eased;
      this.camPos.copy(warp.from)
        .multiplyScalar(oneMinus * oneMinus)
        .addScaledVector(warp.midPos, 2 * oneMinus * eased)
        .addScaledVector(warp.to, eased * eased);

      this.lookPos.copy(warp.fromLook)
        .multiplyScalar(oneMinus * oneMinus)
        .addScaledVector(warp.midLook, 2 * oneMinus * eased)
        .addScaledVector(warp.toLook, eased * eased);

      this.motionDir.subVectors(warp.to, warp.from).normalize();
      this.warpIntensity = Math.sin(Math.PI * t);

      // Visceral deceleration impulse when exiting warp
      if (t > 0.88 && this.shake < 0.2) {
        this.shake = 0.45;
      }

      if (t >= 1) {
        this.warp = null;
        this.warpIntensity = 0;
        this.currentSector = warp.target;
        this.camera.up.set(0, 1, 0);
        this.callbacks.onArrive(warp.target);
      }
    } else {
      const desired = this.desiredView();
      const k = smoothFactor(0.05, dt);
      this.camPos.lerp(desired.pos, k);
      this.lookPos.lerp(desired.look, k);
    }

    const sway = smoothFactor(0.05, dt);
    this.swayCurrent.lerp(this.sway, sway);

    if (!this.press && !this.warp) {
      this.targetYaw += this.velocityYaw * dt;
      this.targetPitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.targetPitch + this.velocityPitch * dt));
      const friction = Math.exp(-3.2 * dt);
      this.velocityYaw *= friction;
      this.velocityPitch *= friction;
    }

    this.yaw += (this.targetYaw - this.yaw) * sway;
    this.pitch += (this.targetPitch - this.pitch) * sway;

    const yaw = this.yaw - this.swayCurrent.x * 0.06;
    const pitch = this.pitch - this.swayCurrent.y * 0.04;
    const dir = new Vector3().subVectors(this.lookPos, this.camPos);
    dir.applyAxisAngle(UP, yaw);
    const right = new Vector3().crossVectors(dir, UP).normalize();
    dir.applyAxisAngle(right, pitch);

    if (this.warp) {
      const t = Math.min(this.warp.elapsed / WARP_DURATION, 1);
      const rollAngle = Math.sin(Math.PI * t) * 0.1 * this.warp.bankingSign;
      this.camera.up.copy(UP).applyAxisAngle(dir.clone().normalize(), rollAngle);
    } else {
      this.camera.up.set(0, 1, 0);
    }

    this.shake = Math.max(0, this.shake - dt * 1.2);
    const jitter = this.shake * 12;
    this.camera.position.copy(this.camPos).add(
      new Vector3((Math.random() - 0.5) * jitter, (Math.random() - 0.5) * jitter, 0),
    );
    this.camera.lookAt(this.camera.position.clone().add(dir));
    this.camera.fov = REST_FOV + WARP_FOV_BOOST * Math.pow(this.warpIntensity, 1.3);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }

  private sectorWeight(index: number): number {
    if (this.warp) {
      const t = Math.min(this.warp.elapsed / WARP_DURATION, 1);
      if (this.warp.target === index) {
        return easeInOutCubic(t);
      }
      if (this.currentSector === index) {
        return 1 - easeInOutCubic(t);
      }
      return 0;
    }
    return this.currentSector === index ? 1 : 0;
  }

  private updateScene(dt: number) {
    const tail = this.motionDir.clone().multiplyScalar(this.warpIntensity * TAIL_LENGTH);
    this.starfield.update(this.time, this.warpIntensity, tail);

    const w0 = this.sectorWeight(0);
    this.aldebaran.group.visible = w0 > 0.001;
    if (w0 > 0.001) {
      this.aldebaran.update(this.time, this.camera, w0, SECTORS[0].camera[2] * this.framing);
    }

    const w1 = this.sectorWeight(1);
    this.planets.group.visible = w1 > 0.001;
    if (w1 > 0.001) {
      this.planets.update(this.time, this.hoverIndex, this.focusIndex, w1, this.camera, this.framing);
    }

    const w2 = this.sectorWeight(2);
    this.starClusters.group.visible = w2 > 0.001;
    if (w2 > 0.001) {
      this.starClusters.update(this.time, this.camera, w2, this.framing);
    }

    const w3 = this.sectorWeight(3);
    this.horizon.group.visible = w3 > 0.001;
    if (w3 > 0.001) {
      this.horizon.update(this.time, this.camera, w3, this.framing);
    }

    this.updateShockwaves(dt);
  }

  private updateShockwaves(dt: number) {
    this.shockwaves = this.shockwaves.filter((wave) => {
      wave.age += dt;
      const t = wave.age / SHOCKWAVE_DURATION;
      if (t >= 1) {
        this.scene.remove(wave.mesh);
        wave.mesh.geometry.dispose();
        (wave.mesh.material as Material).dispose();
        return false;
      }
      wave.mesh.scale.setScalar(60 + 1100 * (1 - Math.pow(1 - t, 3)));
      (wave.mesh.material as MeshBasicMaterial).opacity = 0.9 * (1 - t);
      wave.mesh.lookAt(this.camera.position);
      return true;
    });
  }

  private warmupGPU() {
    try {
      // 1. Pre-compile shader programs for each sector viewpoint
      for (let i = 0; i < SECTORS.length; i++) {
        this.camera.position.copy(this.cameraFor(i));
        this.camera.lookAt(sectorCenter(i));
        this.camera.updateMatrixWorld();
        this.renderer.compile(this.scene, this.camera);
      }

      // 2. Perform 1 warmup render pass for each sector through composer
      // This forces the GPU driver to compile & link all shader programs, textures,
      // and post-processing buffers (UnrealBloomPass, OutputPass, ACESFilmic)
      for (let i = 0; i < SECTORS.length; i++) {
        const cam = this.cameraFor(i);
        const look = sectorCenter(i);
        this.camera.position.copy(cam);
        this.camera.lookAt(look);
        this.camera.updateMatrixWorld();

        this.aldebaran.update(0, this.camera, i === 0 ? 1 : 0.05, SECTORS[0].camera[2] * this.framing);
        this.planets.update(0, null, null, i === 1 ? 1 : 0.05, this.camera, this.framing);
        this.starClusters.update(0, this.camera, i === 2 ? 1 : 0.05, this.framing);
        this.horizon.update(0, this.camera, i === 3 ? 1 : 0.05, this.framing);

        this.composer.render();
      }

      // 3. Reset cleanly back to this.currentSector initial state
      this.camPos.copy(this.cameraFor(this.currentSector));
      this.lookPos.copy(sectorCenter(this.currentSector));
      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.lookPos);
      this.camera.updateProjectionMatrix();

      this.aldebaran.update(0, this.camera, this.currentSector === 0 ? 1.0 : 0.0, SECTORS[0].camera[2] * this.framing);
      this.planets.update(0, null, null, this.currentSector === 1 ? 1.0 : 0.0, this.camera, this.framing);
      this.starClusters.update(0, this.camera, this.currentSector === 2 ? 1.0 : 0.0, this.framing);
      this.horizon.update(0, this.camera, this.currentSector === 3 ? 1.0 : 0.0, this.framing);

      this.composer.render();
      if (this.currentSector === 0) {
        this.aldebaran.renderOverlay(this.renderer);
      }
    } catch (e) {
      console.warn('GPU Warmup skipped:', e);
    }
  }
}

