import {
  CanvasTexture,
  DoubleSide,
  Group,
  LinearFilter,
  Mesh,
  type PerspectiveCamera,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from 'three';
import { REST_FOV, SECTORS } from '@/space/constants';
import { blackHoleFragmentShader, blackHoleVertexShader } from '@/space/blackHoleShaders';

const RS = 115;
const DISK_TILT_X = 1.22;
const DISK_ROLL_Z = 0.42; // +24 deg diagonal sweep (lower-left 7:45 to upper-right 1:45)
const DISK_INNER = 2.85;
const DISK_OUTER = 9.2;
const LENS_PLANE_SIZE = 5200;

// Position Black Hole shadow slightly upper-right of center (x ~ 58%, y ~ 41.5%)
// so 'T U M' of QUANTUM pass behind the upper accretion disk & event horizon while 'UPLINK' sits in front
const BH_OFFSET = new Vector3(175, 95, 0);

function createSplitHeadlinePlanes() {
  const W = 4096;
  const H = 1024;

  const qCanvas = document.createElement('canvas');
  qCanvas.width = W;
  qCanvas.height = H;
  const qCtx = qCanvas.getContext('2d');

  const uCanvas = document.createElement('canvas');
  uCanvas.width = W;
  uCanvas.height = H;
  const uCtx = uCanvas.getContext('2d');

  const qTex = new CanvasTexture(qCanvas);
  qTex.minFilter = LinearFilter;
  qTex.magFilter = LinearFilter;
  qTex.generateMipmaps = false;

  const uTex = new CanvasTexture(uCanvas);
  uTex.minFilter = LinearFilter;
  uTex.magFilter = LinearFilter;
  uTex.generateMipmaps = false;

  const draw = () => {
    if (!qCtx || !uCtx) return;
    qCtx.clearRect(0, 0, W, H);
    uCtx.clearRect(0, 0, W, H);

    const fontSpec = '400 760px "Anton", "Antonio", sans-serif';
    qCtx.font = fontSpec;
    uCtx.font = fontSpec;
    qCtx.textBaseline = 'alphabetic';
    uCtx.textBaseline = 'alphabetic';

    const fullText = 'QUANTUM UPLINK';
    const prefixText = 'QUANTUM ';
    const fullWidth = Math.max(qCtx.measureText(fullText).width, 1);
    const prefixWidth = qCtx.measureText(prefixText).width;

    const targetWidth = W * 0.992;
    const scaleX = targetWidth / fullWidth;
    const baselineY = 760; // Leaves bottom 264px for Anton's signature 'Q' descender tail!

    qCtx.save();
    qCtx.scale(scaleX, 1.04);
    qCtx.fillStyle = '#FFFFFF';
    qCtx.fillText('QUANTUM', 8 / scaleX, baselineY);
    qCtx.restore();

    uCtx.save();
    uCtx.scale(scaleX, 1.04);
    uCtx.fillStyle = '#FFFFFF';
    uCtx.fillText('UPLINK', 8 / scaleX + prefixWidth, baselineY);
    uCtx.restore();

    qTex.needsUpdate = true;
    uTex.needsUpdate = true;
  };

  draw();
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      draw();
    });
  }

  const makeMat = (tex: CanvasTexture) =>
    new ShaderMaterial({
      uniforms: {
        uMap: { value: tex },
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
      depthTest: false,
    });

  const qMat = makeMat(qTex);
  const uMat = makeMat(uTex);

  const qMesh = new Mesh(new PlaneGeometry(1, 1), qMat);
  qMesh.renderOrder = 1; // Behind Black Hole (2)

  const uMesh = new Mesh(new PlaneGeometry(1, 1), uMat);
  uMesh.renderOrder = 3; // In front of Black Hole (2)

  return { qMesh, qMat, uMesh, uMat };
}

export function buildBlackHole() {
  const group = new Group();
  group.position.set(...SECTORS[3].position);

  const bhWorldCenter = new Vector3(...SECTORS[3].position).add(BH_OFFSET);
  const diskNormal = new Vector3(0, Math.sin(DISK_TILT_X), Math.cos(DISK_TILT_X))
    .applyAxisAngle(new Vector3(0, 0, 1), DISK_ROLL_Z)
    .normalize();

  const uniforms = {
    uCam: { value: new Vector3() },
    uCenter: { value: bhWorldCenter },
    uDiskNormal: { value: diskNormal },
    uRs: { value: RS },
    uInner: { value: DISK_INNER },
    uOuter: { value: DISK_OUTER },
    uTime: { value: 0 },
    uOpacity: { value: 0 },
  };

  const lensPlane = new Mesh(
    new PlaneGeometry(LENS_PLANE_SIZE, LENS_PLANE_SIZE),
    new ShaderMaterial({
      uniforms,
      vertexShader: blackHoleVertexShader,
      fragmentShader: blackHoleFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: DoubleSide,
    }),
  );
  lensPlane.position.copy(BH_OFFSET);
  lensPlane.renderOrder = 2;

  const { qMesh, qMat, uMesh, uMat } = createSplitHeadlinePlanes();
  const BACK_Z = -110;
  const FRONT_Z = 110;

  group.add(qMesh, lensPlane, uMesh);

  const fitScreenBox = (
    mesh: Mesh,
    planeZ: number,
    baseCamZ: number,
    aspect: number,
  ) => {
    const dist = baseCamZ - planeZ;
    const fH = 2 * dist * Math.tan((REST_FOV * Math.PI) / 360);
    const fW = fH * aspect;
    // Spanning left: 3.4% -> right: 2.2%, top: 14.0% -> bottom: 45.2% (including Q tail)
    const xL = (-0.5 + 0.034) * fW;
    const xR = (-0.5 + 0.978) * fW;
    const yT = (0.5 - 0.140) * fH;
    const yB = (0.5 - 0.452) * fH;
    mesh.position.set((xL + xR) * 0.5, (yT + yB) * 0.5, planeZ);
    mesh.scale.set(xR - xL, yT - yB, 1);
  };

  return {
    group,
    update(time: number, camera: PerspectiveCamera, opacity = 1.0, framing = 1.0) {
      uniforms.uTime.value = time;
      uniforms.uCam.value.copy(camera.position);
      uniforms.uOpacity.value = opacity;
      group.visible = opacity > 0.005;
      if (!group.visible) return;

      lensPlane.quaternion.copy(camera.quaternion);

      const aspect = camera.aspect || 16 / 9;
      const baseCamZ = SECTORS[3].camera[2] * framing;
      fitScreenBox(qMesh, BACK_Z, baseCamZ, aspect);
      fitScreenBox(uMesh, FRONT_Z, baseCamZ, aspect);
      qMat.uniforms.uOpacity.value = opacity;
      uMat.uniforms.uOpacity.value = opacity;
    },
  };
}
