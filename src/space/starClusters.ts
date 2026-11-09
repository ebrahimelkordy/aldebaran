import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Group,
  LinearFilter,
  Mesh,
  NormalBlending,
  type PerspectiveCamera,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three';
import { LOW_END_DEVICE, REST_FOV, SECTORS } from '@/space/constants';
import { buildForgeAstrolabe } from '@/space/forgeAstrolabe';
import {
  foregroundVeilFragmentShader,
  forgeNebulaFragmentShader,
  forgeNebulaVertexShader,
  forgeProtoStarFragmentShader,
  forgeProtoStarVertexShader,
} from '@/space/forgeNebulaShaders';
import { createRandom } from '@/space/sceneBuilders';
import { createStarPoints, type StarSample } from '@/space/starPoints';

export interface Sector2ScreenAnchors {
  centerX: number;
  centerY: number;
  ring0X: number;
  ring0Y: number;
  ring1X: number;
  ring1Y: number;
  ring2X: number;
  ring2Y: number;
}

const SECTOR_POS = new Vector3(...SECTORS[2].position);
// Boiling Stellar Nebula centered slightly right of midline (matching ref_sector_02.jpeg)
const NEBULA_OFFSET = new Vector3(95, 10, -160);
// Sleek Oblique 3D Metallic Armillary Astrolabe in lower-left quadrant (x ~ 26.2%, y ~ 63.8%)
const ASTROLABE_OFFSET = new Vector3(-378, -118, 115);
const PORTRAIT_ASTROLABE_OFFSET = new Vector3(0, -92, 165);

function createMonumentalForgeTitlePlane() {
  const W = 4096;
  const H = 2048;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;

  const drawText = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Subtle soft shadow for crisp separation over bright golden plasma veins
    ctx.shadowColor = 'rgba(3, 4, 8, 0.55)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 10;

    ctx.fillStyle = '#FAF8F4';
    ctx.font = '500 680px "Cormorant Garamond", "Cinzel", Georgia, serif';
    ctx.fillText('THE', W * 0.5, 720);

    ctx.font = '500 760px "Cormorant Garamond", "Cinzel", Georgia, serif';
    ctx.fillText('FORGE', W * 0.5, 1410);

    // Subtitle: CREATING COSMIC ARCHITECTURES
    ctx.shadowBlur = 18;
    ctx.font = '400 108px "Inter", "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ECE8E1';
    const sub = 'CREATING COSMIC ARCHITECTURES';
    const chars = sub.split('');
    const tracking = 13;
    let totalW = 0;
    for (const ch of chars) {
      totalW += ctx.measureText(ch).width + tracking;
    }
    totalW -= tracking;

    ctx.textAlign = 'left';
    let curX = (W - totalW) * 0.5;
    for (const ch of chars) {
      ctx.fillText(ch, curX, 1625);
      curX += ctx.measureText(ch).width + tracking;
    }

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
        if (tex.a < 0.008) discard;
        vec3 ivory = vec3(0.91, 0.90, 0.88);
        gl_FragColor = vec4(ivory * tex.rgb, tex.a * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
  });

  const mesh = new Mesh(new PlaneGeometry(1, 1), material);
  mesh.renderOrder = 3;
  return { mesh, material, texture };
}

export function buildStarClusters() {
  const group = new Group();
  group.position.copy(SECTOR_POS);

  // 1. Sun-Grade Boiling Stellar Nebula (RenderOrder 1)
  const nebulaWorldCenter = SECTOR_POS.clone().add(NEBULA_OFFSET);
  const nebulaUniforms = {
    uCam: { value: new Vector3() },
    uCenter: { value: nebulaWorldCenter },
    uTime: { value: 0 },
    uOpacity: { value: 0 },
  };

  const nebulaGeom = new PlaneGeometry(1980, 1760);
  const nebulaMat = new ShaderMaterial({
    uniforms: nebulaUniforms,
    vertexShader: forgeNebulaVertexShader,
    fragmentShader: forgeNebulaFragmentShader,
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: NormalBlending,
  });
  const nebulaMesh = new Mesh(nebulaGeom, nebulaMat);
  nebulaMesh.position.copy(NEBULA_OFFSET);
  nebulaMesh.renderOrder = 1;
  group.add(nebulaMesh);

  // 2. Background & Summit 8-Ray Photographic Protostars (RenderOrder 2, matching ref_sector_02.jpeg)
  const bgStarDefs: [number, number, number, [number, number, number], number][] = [
    [52, 338, -110, [1.22, 1.16, 1.04], 122],   // Bright summit beacon star
    [225, 315, -125, [1.08, 1.10, 1.18], 84],   // Upper-right summit companion
    [138, 240, -105, [1.15, 1.12, 1.08], 92],   // Mid-summit diamond star above 'THE'
    [292, 185, -115, [1.34, 0.92, 0.52], 106],  // Warm golden-amber star in right ionization arch
    [-255, 285, -130, [1.05, 1.06, 1.12], 48],  // Subtle upper-left star near macro-telemetry
  ];

  const makeStarPoints = (
    defs: [number, number, number, [number, number, number], number][],
    order: number,
  ) => {
    const pos = new Float32Array(defs.length * 3);
    const col = new Float32Array(defs.length * 3);
    const sz = new Float32Array(defs.length);
    defs.forEach(([x, y, z, c, s], i) => {
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
      sz[i] = s;
    });
    const geom = new BufferGeometry();
    geom.setAttribute('position', new BufferAttribute(pos, 3));
    geom.setAttribute('aColor', new BufferAttribute(col, 3));
    geom.setAttribute('aSize', new BufferAttribute(sz, 1));

    const mat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
      },
      vertexShader: forgeProtoStarVertexShader,
      fragmentShader: forgeProtoStarFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    });
    const pts = new Points(geom, mat);
    pts.renderOrder = order;
    return { pts, geom, mat };
  };

  const bgStars = makeStarPoints(bgStarDefs, 2);
  group.add(bgStars.pts);

  // Subtle cosmic stardust motes
  const random = createRandom(2049);
  const dustCount = LOW_END_DEVICE ? 480 : 900;
  const stardustSamples: StarSample[] = Array.from({ length: dustCount }, (): StarSample => {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const r = 540 * Math.pow(random(), 0.68);
    return {
      position: [
        NEBULA_OFFSET.x + r * Math.sin(phi) * Math.cos(theta) * 1.1,
        NEBULA_OFFSET.y + r * Math.sin(phi) * Math.sin(theta) * 0.95,
        NEBULA_OFFSET.z + r * Math.cos(phi) * 0.7,
      ],
      color: random() < 0.55 ? [1.0, 0.86, 0.64] : [0.86, 0.88, 0.96],
      size: 0.65 + random() * 1.4,
      bright: 0.28 + random() * 0.55,
    };
  });
  const stardust = createStarPoints(stardustSamples);
  stardust.object.renderOrder = 2;
  group.add(stardust.object);

  // 3. Monumental Centered 3D Serif 'THE / FORGE' + 'CREATING COSMIC ARCHITECTURES' (RenderOrder 3, z = -25)
  const theForgeTitle = createMonumentalForgeTitlePlane();
  group.add(theForgeTitle.mesh);

  // 4. Foreground Atmospheric Nebula Wisp + Foreground Star right at top-right of 'E' in FORGE (RenderOrder 4, z = +45)
  const veilGeom = new PlaneGeometry(560, 420);
  const veilMat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader: forgeNebulaVertexShader,
    fragmentShader: foregroundVeilFragmentShader,
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: NormalBlending,
  });
  const veilMesh = new Mesh(veilGeom, veilMat);
  veilMesh.renderOrder = 4;
  group.add(veilMesh);

  const fgStars = makeStarPoints(
    [
      [298, 22, 52, [1.14, 1.14, 1.18], 88], // Foreground star kissing right edge of 'FORGE' just like ref_sector_02.jpeg!
    ],
    4,
  );
  group.add(fgStars.pts);

  // 5. Real 3D Sleek Oblique Metallic Armillary Astrolabe (RenderOrder 5, z = +115)
  const astrolabe = buildForgeAstrolabe(ASTROLABE_OFFSET);
  group.add(astrolabe.group);

  let activeDiscipline: number | null = null;

  const vCenter = new Vector3();
  const vRing0 = new Vector3();
  const vRing1 = new Vector3();
  const vRing2 = new Vector3();

  return {
    group,
    setActiveDiscipline(index: number | null) {
      activeDiscipline = index;
    },
    getScreenAnchors(camera: PerspectiveCamera): Sector2ScreenAnchors {
      astrolabe.getAnchorWorldPositions(vCenter, vRing0, vRing1, vRing2);
      vCenter.project(camera);
      vRing0.project(camera);
      vRing1.project(camera);
      vRing2.project(camera);

      return {
        centerX: (vCenter.x + 1) * 0.5,
        centerY: (1 - vCenter.y) * 0.5,
        ring0X: (vRing0.x + 1) * 0.5,
        ring0Y: (1 - vRing0.y) * 0.5,
        ring1X: (vRing1.x + 1) * 0.5,
        ring1Y: (1 - vRing1.y) * 0.5,
        ring2X: (vRing2.x + 1) * 0.5,
        ring2Y: (1 - vRing2.y) * 0.5,
      };
    },
    update(time: number, camera?: PerspectiveCamera, opacity = 1.0, framing = 1.0) {
      group.visible = opacity > 0.005;
      if (!group.visible) return;

      nebulaUniforms.uTime.value = time;
      nebulaUniforms.uOpacity.value = opacity;
      if (camera) {
        nebulaUniforms.uCam.value.copy(camera.position);
        nebulaMesh.quaternion.copy(camera.quaternion);
      }

      bgStars.mat.uniforms.uTime.value = time;
      bgStars.mat.uniforms.uOpacity.value = opacity;
      fgStars.mat.uniforms.uTime.value = time;
      fgStars.mat.uniforms.uOpacity.value = opacity;

      if (stardust.material.uniforms.uOpacity) {
        stardust.material.uniforms.uOpacity.value = opacity * 0.8;
      }
      stardust.material.uniforms.uTime.value = time;
      stardust.object.rotation.y = Math.sin(time * 0.02) * 0.03;

      // Fit Monumental 3D 'THE / FORGE' + 'CREATING COSMIC ARCHITECTURES' in center (x: 31%..70.5%, y: 34.5%..65.5%)
      const aspect = camera?.aspect ?? 16 / 9;
      const portraitLerp = Math.max(0, Math.min(1, (0.95 - aspect) / 0.35));

      const baseCamY = SECTORS[2].camera[1] * framing;
      const baseCamZ = SECTORS[2].camera[2] * framing;
      const camDist = Math.hypot(baseCamY, baseCamZ);
      const planeZ = -25;
      const distToPlane = camDist - planeZ;
      const frustumH = 2 * distToPlane * Math.tan((REST_FOV * Math.PI) / 360);
      const frustumW = frustumH * aspect;

      const xLeft = (-0.5 + 0.312) * frustumW;
      const xRight = (-0.5 + 0.704) * frustumW;
      const yTop = (0.5 - 0.342) * frustumH;
      const yBottom = (0.5 - 0.662) * frustumH;

      const pLeft = (-0.5 + 0.08) * frustumW;
      const pRight = (-0.5 + 0.92) * frustumW;
      const pTop = (0.5 - 0.22) * frustumH;
      const pBottom = (0.5 - 0.43) * frustumH;

      const curLeft = xLeft * (1 - portraitLerp) + pLeft * portraitLerp;
      const curRight = xRight * (1 - portraitLerp) + pRight * portraitLerp;
      const curTop = yTop * (1 - portraitLerp) + pTop * portraitLerp;
      const curBottom = yBottom * (1 - portraitLerp) + pBottom * portraitLerp;

      const pitchRest = Math.atan2(baseCamY, baseCamZ);
      const axisCenterY = baseCamY * (planeZ / Math.max(baseCamZ, 1));
      const yMidLocal = (curTop + curBottom) * 0.5;

      theForgeTitle.mesh.position.set(
        (curLeft + curRight) * 0.5,
        axisCenterY + yMidLocal * Math.cos(pitchRest),
        planeZ - yMidLocal * Math.sin(pitchRest),
      );
      theForgeTitle.mesh.rotation.set(-pitchRest, 0, 0);
      theForgeTitle.mesh.scale.set(curRight - curLeft, curTop - curBottom, 1);
      theForgeTitle.material.uniforms.uOpacity.value = opacity;

      // Foreground nebula dust/gold wisp gently overlapping right edge of 'FORGE' in 3D depth
      veilMesh.position.set(
        curRight - 65,
        axisCenterY + yMidLocal * Math.cos(pitchRest) - 25,
        45,
      );
      veilMesh.rotation.set(-pitchRest, 0, 0);
      veilMat.uniforms.uTime.value = time;
      veilMat.uniforms.uOpacity.value = opacity;

      const desktopAstrolabeX = ASTROLABE_OFFSET.x * Math.min(1.06, Math.max(0.76, aspect / (16 / 9)));
      astrolabe.group.position.set(
        desktopAstrolabeX * (1 - portraitLerp) + PORTRAIT_ASTROLABE_OFFSET.x * portraitLerp,
        ASTROLABE_OFFSET.y * (1 - portraitLerp) + PORTRAIT_ASTROLABE_OFFSET.y * portraitLerp,
        ASTROLABE_OFFSET.z * (1 - portraitLerp) + PORTRAIT_ASTROLABE_OFFSET.z * portraitLerp,
      );
      astrolabe.group.scale.setScalar(1.0 * (1 - portraitLerp) + 0.76 * portraitLerp);
      astrolabe.update(time, opacity, activeDiscipline);
    },
    refreshTextures() {
      if (theForgeTitle.texture) {
        theForgeTitle.texture.needsUpdate = true;
      }
    },
    dispose() {
      nebulaGeom?.dispose();
      nebulaMat?.dispose();
      bgStars?.geom?.dispose();
      bgStars?.mat?.dispose();
      fgStars?.geom?.dispose();
      fgStars?.mat?.dispose();
      stardust?.object?.geometry?.dispose();
      stardust?.material?.dispose();
      theForgeTitle?.mesh?.geometry?.dispose();
      theForgeTitle?.material?.dispose();
      theForgeTitle?.texture?.dispose();
      veilGeom?.dispose();
      veilMat?.dispose();
      astrolabe?.dispose();
    },
  };
}
