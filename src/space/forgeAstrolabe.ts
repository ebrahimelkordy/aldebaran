import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three';

export interface ForgeAstrolabe {
  group: Group;
  update(time: number, opacity: number, activeDiscipline: number | null): void;
  getAnchorWorldPositions(
    centerOut: Vector3,
    ring0Out: Vector3,
    ring1Out: Vector3,
    ring2Out: Vector3,
  ): void;
  dispose(): void;
}

interface FacetDef {
  r0: number;
  z0: number;
  r1: number;
  z1: number;
  surfaceType: number; // 0.0 = brushed titanium face, 0.35 = dark gunmetal wall, 1.0 = polished champagne-silver bevel
  radialT0: number;
  radialT1: number;
}

/**
 * Builds a wide, heavy CNC-machined concentric astrolabe ring with split facet normals,
 * circumferential anisotropic tangent vectors, and crisp diamond-cut 45° bevels.
 */
function createMachinedRingGeometry(
  rInner: number,
  rOuter: number,
  halfHeight: number,
  bevel: number,
  segments = 160,
): BufferGeometry {
  const facets: FacetDef[] = [
    { r0: rInner + bevel, z0: halfHeight, r1: rOuter - bevel, z1: halfHeight, surfaceType: 0.0, radialT0: 0.0, radialT1: 1.0 },
    { r0: rOuter - bevel, z0: halfHeight, r1: rOuter, z1: halfHeight - bevel, surfaceType: 1.0, radialT0: 0.0, radialT1: 1.0 },
    { r0: rOuter, z0: halfHeight - bevel, r1: rOuter, z1: -halfHeight + bevel, surfaceType: 0.35, radialT0: 0.0, radialT1: 1.0 },
    { r0: rOuter, z0: -halfHeight + bevel, r1: rOuter - bevel, z1: -halfHeight, surfaceType: 1.0, radialT0: 0.0, radialT1: 1.0 },
    { r0: rOuter - bevel, z0: -halfHeight, r1: rInner + bevel, z1: -halfHeight, surfaceType: 0.0, radialT0: 1.0, radialT1: 0.0 },
    { r0: rInner + bevel, z0: -halfHeight, r1: rInner, z1: -halfHeight + bevel, surfaceType: 1.0, radialT0: 0.0, radialT1: 1.0 },
    { r0: rInner, z0: -halfHeight + bevel, r1: rInner, z1: halfHeight - bevel, surfaceType: 0.35, radialT0: 0.0, radialT1: 1.0 },
    { r0: rInner, z0: halfHeight - bevel, r1: rInner + bevel, z1: halfHeight, surfaceType: 1.0, radialT0: 0.0, radialT1: 1.0 },
  ];

  const ringCols = segments + 1;
  const vertCount = facets.length * 2 * ringCols;

  const positions = new Float32Array(vertCount * 3);
  const normals = new Float32Array(vertCount * 3);
  const tangents = new Float32Array(vertCount * 3);
  const ringUvs = new Float32Array(vertCount * 2);
  const surfaceTypes = new Float32Array(vertCount);
  const indices: number[] = [];

  let vCursor = 0;

  for (let f = 0; f < facets.length; f++) {
    const facet = facets[f];
    const dr = facet.r1 - facet.r0;
    const dz = facet.z1 - facet.z0;
    const len = Math.hypot(dr, dz) || 1;
    const nrProfile = -dz / len;
    const nzProfile = dr / len;

    const baseVertex = vCursor;

    for (let s = 0; s <= segments; s++) {
      const u = s / segments;
      const theta = u * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const nx = nrProfile * cosT;
      const ny = nrProfile * sinT;
      const nz = nzProfile;

      const tx = -sinT;
      const ty = cosT;

      positions[vCursor * 3] = facet.r0 * cosT;
      positions[vCursor * 3 + 1] = facet.r0 * sinT;
      positions[vCursor * 3 + 2] = facet.z0;
      normals[vCursor * 3] = nx;
      normals[vCursor * 3 + 1] = ny;
      normals[vCursor * 3 + 2] = nz;
      tangents[vCursor * 3] = tx;
      tangents[vCursor * 3 + 1] = ty;
      tangents[vCursor * 3 + 2] = 0;
      ringUvs[vCursor * 2] = u;
      ringUvs[vCursor * 2 + 1] = facet.radialT0;
      surfaceTypes[vCursor] = facet.surfaceType;
      vCursor++;

      positions[vCursor * 3] = facet.r1 * cosT;
      positions[vCursor * 3 + 1] = facet.r1 * sinT;
      positions[vCursor * 3 + 2] = facet.z1;
      normals[vCursor * 3] = nx;
      normals[vCursor * 3 + 1] = ny;
      normals[vCursor * 3 + 2] = nz;
      tangents[vCursor * 3] = tx;
      tangents[vCursor * 3 + 1] = ty;
      tangents[vCursor * 3 + 2] = 0;
      ringUvs[vCursor * 2] = u;
      ringUvs[vCursor * 2 + 1] = facet.radialT1;
      surfaceTypes[vCursor] = facet.surfaceType;
      vCursor++;
    }

    for (let s = 0; s < segments; s++) {
      const i00 = baseVertex + s * 2;
      const i10 = i00 + 1;
      const i01 = i00 + 2;
      const i11 = i00 + 3;
      indices.push(i00, i10, i11, i00, i11, i01);
    }
  }

  const geom = new BufferGeometry();
  geom.setAttribute('position', new BufferAttribute(positions, 3));
  geom.setAttribute('normal', new BufferAttribute(normals, 3));
  geom.setAttribute('aTangent', new BufferAttribute(tangents, 3));
  geom.setAttribute('aRingUv', new BufferAttribute(ringUvs, 2));
  geom.setAttribute('aSurfaceType', new BufferAttribute(surfaceTypes, 1));
  geom.setIndex(indices);
  return geom;
}

function attachMetalAttributes(geom: BufferGeometry, surfaceType: number): BufferGeometry {
  const pos = geom.getAttribute('position');
  const count = pos.count;
  const tangents = new Float32Array(count * 3);
  const ringUvs = new Float32Array(count * 2);
  const surfaceTypes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const rXY = Math.hypot(x, y);
    if (rXY > 1e-4) {
      tangents[i * 3] = -y / rXY;
      tangents[i * 3 + 1] = x / rXY;
      tangents[i * 3 + 2] = 0;
    } else {
      tangents[i * 3] = 1;
      tangents[i * 3 + 1] = 0;
      tangents[i * 3 + 2] = 0;
    }
    const u = (Math.atan2(y, x) / (Math.PI * 2) + 1) % 1;
    ringUvs[i * 2] = u;
    ringUvs[i * 2 + 1] = 0.5 + 0.5 * Math.tanh(z * 0.05);
    surfaceTypes[i] = surfaceType;
  }

  geom.setAttribute('aTangent', new BufferAttribute(tangents, 3));
  geom.setAttribute('aRingUv', new BufferAttribute(ringUvs, 2));
  geom.setAttribute('aSurfaceType', new BufferAttribute(surfaceTypes, 1));
  return geom;
}

const astrolabeVertexShader = /* glsl */ `
  attribute vec3 aTangent;
  attribute vec2 aRingUv;
  attribute float aSurfaceType;

  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldTangent;
  varying vec2 vRingUv;
  varying float vSurfaceType;
  varying vec3 vLocalPos;

  void main() {
    vLocalPos = position;
    vRingUv = aRingUv;
    vSurfaceType = aSurfaceType;

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;

    mat3 normalMat = mat3(modelMatrix);
    vec3 wn = normalMat * normal;
    float wnLen = length(wn);
    vWorldNormal = wnLen > 1e-4 ? wn / wnLen : vec3(0.0, 0.0, 1.0);

    vec3 wt = normalMat * aTangent;
    float wtLen = length(wt);
    vWorldTangent = wtLen > 1e-4 ? wt / wtLen : vec3(1.0, 0.0, 0.0);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const astrolabeFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uHighlight;
  uniform float uIsCore;
  uniform float uTickDensity;

  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldTangent;
  varying vec2 vRingUv;
  varying float vSurfaceType;
  varying vec3 vLocalPos;

  // High-contrast studio & cosmic nebula reflection map (produces unmistakable heavy brushed metal sheen)
  vec3 sampleMetallicEnv(vec3 R) {
    float y = clamp(R.y, -1.0, 1.0);
    float az = atan(R.z, R.x);

    float dy1 = (y - 0.14) * 4.6;
    float dy2 = (y - 0.62) * 6.8;
    float dy3 = (y + 0.42) * 5.2;

    float mainStrip = exp(-dy1 * dy1) * (0.72 + 0.28 * cos(az * 2.0 - 0.6));
    float skyStrip  = exp(-dy2 * dy2) * (0.55 + 0.45 * sin(az * 3.0 + 1.1));
    float lowStrip  = exp(-dy3 * dy3) * 0.62;

    // Warm rose-amber & champagne bounce from the Forge Nebula to the right
    float nebulaDir = pow(max(dot(R, normalize(vec3(0.78, 0.22, 0.58))), 1e-4), 2.8);

    vec3 darkObsidian  = vec3(0.022, 0.026, 0.042);
    vec3 silverChrome  = vec3(0.88, 0.90, 0.96);
    vec3 warmBronze    = vec3(0.96, 0.74, 0.56);
    vec3 roseNebula    = vec3(0.82, 0.54, 0.58);

    vec3 env = darkObsidian;
    env += silverChrome * (mainStrip * 0.85 + skyStrip * 0.62);
    env += warmBronze * (lowStrip * 0.55 + nebulaDir * 0.72);
    env += roseNebula * pow(max(dot(R, normalize(vec3(0.65, -0.15, 0.74))), 1e-4), 5.0) * 0.48;
    return env;
  }

  void main() {
    if (uOpacity < 0.005) discard;

    vec3 N = normalize(vWorldNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 rawT = vWorldTangent - N * dot(vWorldTangent, N);
    float rawTLen = length(rawT);
    vec3 fallbackAxis = abs(N.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 T = rawTLen > 1e-4 ? rawT / rawTLen : normalize(cross(N, fallbackAxis));
    vec3 B = normalize(cross(N, T));

    // Heavy brushed platinum-titanium + dark recessed gunmetal walls + warm champagne-silver bevels
    vec3 titaniumF0 = vec3(0.56, 0.58, 0.63);
    vec3 gunmetalF0 = vec3(0.20, 0.22, 0.27);
    vec3 bevelAlloyF0 = vec3(0.95, 0.86, 0.70);

    float isBevel = smoothstep(0.75, 0.98, vSurfaceType);
    float isWall = smoothstep(0.15, 0.35, vSurfaceType) * (1.0 - isBevel);

    // Fine concentric lathe-machined grooves + subtle radial Track brushing
    float grooveFreq = uIsCore > 0.5 ? vLocalPos.z * 0.65 : vRingUv.y * 38.0;
    float latheGroove = 0.5 + 0.5 * sin(grooveFreq * 6.28318);
    // Machined dark concentric inlay channel down the middle of each wide ring face (matches ref_sector_02!)
    float faceInlay = 0.0;
    if (uIsCore < 0.5 && vSurfaceType < 0.15) {
      faceInlay = smoothstep(0.38, 0.45, vRingUv.y) * (1.0 - smoothstep(0.55, 0.62, vRingUv.y));
    }

    // Core sphere ribbed metallic bands (like ref_sector_02's central sphere!)
    float coreRibs = 1.0;
    if (uIsCore > 0.5) {
      float lpLen = max(length(vLocalPos), 1e-4);
      float lat = vLocalPos.z / lpLen;
      coreRibs = 0.78 + 0.22 * cos(lat * 28.0);
      float eqGold = 1.0 - smoothstep(0.02, 0.055, abs(lat));
      isBevel = max(isBevel, eqGold);
    }

    // Engraved astronomical degree ticks along the ring edges
    float vernierTicks = 0.0;
    if (uIsCore < 0.5 && vSurfaceType < 0.15) {
      float pMinor = fract(vRingUv.x * uTickDensity);
      float tMinor = 1.0 - smoothstep(0.0, 0.07, abs(pMinor - 0.5));
      float pMajor = fract(vRingUv.x * (uTickDensity / 6.0));
      float tMajor = 1.0 - smoothstep(0.0, 0.025, abs(pMajor - 0.5));
      float rimZone = (1.0 - smoothstep(0.0, 0.24, vRingUv.y)) + smoothstep(0.76, 1.0, vRingUv.y);
      vernierTicks = clamp(tMinor * rimZone * 0.45 + tMajor * rimZone * 0.9, 0.0, 1.0);
    }

    float brushMod = mix(0.86, 1.12, latheGroove) * coreRibs * (1.0 - faceInlay * 0.55);
    vec3 faceMetal = mix(titaniumF0 * brushMod, gunmetalF0, isWall);
    float alloyMix = clamp(isBevel + vernierTicks * 0.75 + uHighlight * 0.25, 0.0, 1.0);
    vec3 F0 = mix(faceMetal, bevelAlloyF0, alloyMix);

    vec3 N_refl = normalize(N + B * ((latheGroove - 0.5) * 0.07 * (1.0 - isBevel)));
    vec3 R = reflect(-V, N_refl);

    float NdotV = clamp(dot(N, V), 0.001, 0.9999);
    vec3 fresnel = F0 + (vec3(0.98) - F0) * pow(1.0 - NdotV, 4.2);

    vec3 envColor = sampleMetallicEnv(R) * fresnel;

    // Key Light 1: Crisp Overhead-Left Silver Studio Key (lights upper-left arc like ref_sector_02!)
    vec3 L1 = normalize(vec3(-0.48, 0.56, 0.67));
    vec3 H1 = normalize(L1 + V);
    float NdotL1 = max(dot(N, L1), 0.0);
    float TdotH1 = dot(T, H1);
    float BdotH1 = dot(B, H1);
    float NdotH1 = max(dot(N, H1), 0.0);

    float ax = mix(0.38, 0.08, isBevel);
    float ay = mix(0.08, 0.08, isBevel);
    float aniso1 = -((TdotH1 * TdotH1) / (ax * ax) + (BdotH1 * BdotH1) / (ay * ay)) / max(NdotH1 * NdotH1, 0.045);
    float spec1 = exp(max(aniso1, -20.0)) * NdotL1 * mix(0.85, 1.45, isBevel);

    // Key Light 2: Warm Amber-Rose Nebula Rim from Right-Lower-Front (lights lower-right arc like ref_sector_02!)
    vec3 L2 = normalize(vec3(0.76, -0.22, 0.61));
    vec3 H2 = normalize(L2 + V);
    float NdotL2 = max(dot(N, L2), 0.0);
    float TdotH2 = dot(T, H2);
    float BdotH2 = dot(B, H2);
    float NdotH2 = max(dot(N, H2), 0.0);
    float aniso2 = -((TdotH2 * TdotH2) / (ax * ax) + (BdotH2 * BdotH2) / (ay * ay)) / max(NdotH2 * NdotH2, 0.045);
    float spec2 = exp(max(aniso2, -20.0)) * NdotL2 * mix(0.80, 1.35, isBevel);

    vec3 body = F0 * (0.16 + 0.24 * NdotL1 + 0.20 * NdotL2);
    float rim = pow(1.0 - NdotV, 3.0) * (0.32 + 0.30 * uHighlight);

    vec3 col = body + envColor * 0.95;
    col += F0 * vec3(0.95, 0.97, 1.04) * spec1;
    col += F0 * vec3(1.12, 0.80, 0.58) * spec2;
    col += mix(vec3(0.78, 0.82, 0.90), vec3(1.08, 0.88, 0.62), alloyMix) * rim;

    gl_FragColor = vec4(col, uOpacity);
  }
`;

export function buildForgeAstrolabe(offset: Vector3): ForgeAstrolabe {
  const group = new Group();
  group.position.copy(offset);
  // Exact sleek oblique perspective from `ref_sector_02.jpeg`:
  // Tilted ~64° back in X and rolled -25° in Z so the concentric metallic rings sweep upper-left to lower-right!
  group.rotation.set(-1.10, 0.16, -0.44);

  const disposables: { dispose(): void }[] = [];
  const allMaterials: ShaderMaterial[] = [];

  const createMetalMaterial = (isCore: boolean, tickDensity = 72) => {
    const mat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uHighlight: { value: 0 },
        uIsCore: { value: isCore ? 1.0 : 0.0 },
        uTickDensity: { value: tickDensity },
      },
      vertexShader: astrolabeVertexShader,
      fragmentShader: astrolabeFragmentShader,
      side: DoubleSide,
      transparent: true,
      depthTest: true,
      depthWrite: true,
    });
    allMaterials.push(mat);
    disposables.push(mat);
    return mat;
  };

  // Machined radial index clamps & pivot pins so rotation around Z is unmistakably visible!
  const bossGeom = attachMetalAttributes(new BoxGeometry(9, 5.5, 13.5), 1.0);
  const pinGeom = attachMetalAttributes(new CylinderGeometry(2.6, 2.6, 16, 18), 1.0);
  disposables.push(bossGeom, pinGeom);
  const accentMat = createMetalMaterial(true);

  const addRingHardware = (ringGroup: Group, rMid: number, pinRadius: number, pinAxis: 'x' | 'y') => {
    // Two opposite machined index clamps riding on the ring
    const b1 = new Mesh(bossGeom, accentMat);
    const b2 = new Mesh(bossGeom, accentMat);
    b1.position.set(rMid, 0, 0);
    b2.position.set(-rMid, 0, 0);
    b1.renderOrder = 5;
    b2.renderOrder = 5;
    ringGroup.add(b1, b2);

    // Gimbal trunnion pins bridging into the next inner ring
    if (pinRadius > 0) {
      const p1 = new Mesh(pinGeom, accentMat);
      const p2 = new Mesh(pinGeom, accentMat);
      p1.renderOrder = 5;
      p2.renderOrder = 5;
      if (pinAxis === 'x') {
        p1.rotation.z = Math.PI / 2;
        p2.rotation.z = Math.PI / 2;
        p1.position.set(pinRadius, 0, 0);
        p2.position.set(-pinRadius, 0, 0);
      } else {
        p1.position.set(0, pinRadius, 0);
        p2.position.set(0, -pinRadius, 0);
      }
      ringGroup.add(p1, p2);
    }
  };

  // --- RING 0: Wide Outer Brushed-Titanium Cradle Ring (166..198) ---
  const gimbal0 = new Group();
  const ring0Geom = createMachinedRingGeometry(166, 198, 7.5, 2.6, 168);
  disposables.push(ring0Geom);
  const ring0Mat = createMetalMaterial(false, 96);
  const ring0Mesh = new Mesh(ring0Geom, ring0Mat);
  ring0Mesh.renderOrder = 5;
  gimbal0.add(ring0Mesh);
  addRingHardware(gimbal0, 182, 160, 'x');
  group.add(gimbal0);

  const anchor0 = new Group();
  anchor0.position.set(140, -138, 0); // Bottom-right rim anchor matching ref_sector_02 tick line
  gimbal0.add(anchor0);

  // --- RING 1: Second Concentric Ecliptic Platter (126..154) ---
  const gimbal1 = new Group();
  const ring1Geom = createMachinedRingGeometry(126, 154, 6.8, 2.4, 152);
  disposables.push(ring1Geom);
  const ring1Mat = createMetalMaterial(false, 72);
  const ring1Mesh = new Mesh(ring1Geom, ring1Mat);
  ring1Mesh.renderOrder = 5;
  gimbal1.add(ring1Mesh);
  addRingHardware(gimbal1, 140, 120, 'y');
  group.add(gimbal1);

  const anchor1 = new Group();
  anchor1.position.set(150, 18, 0);
  gimbal1.add(anchor1);

  // --- RING 2: Third Concentric Equatorial Platter (88..114) ---
  const gimbal2 = new Group();
  const ring2Geom = createMachinedRingGeometry(88, 114, 6.0, 2.1, 136);
  disposables.push(ring2Geom);
  const ring2Mat = createMetalMaterial(false, 60);
  const ring2Mesh = new Mesh(ring2Geom, ring2Mat);
  ring2Mesh.renderOrder = 5;
  gimbal2.add(ring2Mesh);
  addRingHardware(gimbal2, 101, 82, 'x');
  group.add(gimbal2);

  const anchor2 = new Group();
  anchor2.position.set(108, -20, 0);
  gimbal2.add(anchor2);

  // --- RING 3: Innermost Inclined Vernier Collar (54..74) ---
  const gimbal3 = new Group();
  const ring3Geom = createMachinedRingGeometry(54, 74, 5.2, 1.8, 120);
  disposables.push(ring3Geom);
  const ring3Mat = createMetalMaterial(false, 48);
  const ring3Mesh = new Mesh(ring3Geom, ring3Mat);
  ring3Mesh.renderOrder = 5;
  gimbal3.add(ring3Mesh);
  group.add(gimbal3);

  // --- CENTRAL RIBBED METALLIC SPHERE + MINIATURE TILTED SATURN COLLAR (Exact ref_sector_02 centerpiece!) ---
  const coreGroup = new Group();
  const coreGeom = attachMetalAttributes(new SphereGeometry(33, 64, 48), 0.0);
  const miniRingGeom = createMachinedRingGeometry(39, 48, 2.2, 0.9, 96);
  disposables.push(coreGeom, miniRingGeom);
  const coreMat = createMetalMaterial(true);
  const coreMesh = new Mesh(coreGeom, coreMat);
  const miniRingMesh = new Mesh(miniRingGeom, accentMat);
  miniRingMesh.rotation.set(0.55, 0.25, 0.0);
  coreMesh.renderOrder = 5;
  miniRingMesh.renderOrder = 5;
  coreGroup.add(coreMesh, miniRingMesh);
  group.add(coreGroup);

  // --- OUTER FINE CELESTIAL WIRE ORBIT + 3 METALLIC PEARL SATELLITES (Matches ref_sector_02!) ---
  const wireRig = new Group();
  wireRig.rotation.set(0.08, -0.06, 0.0);
  const wireSegments = 160;
  const wireRadius = 228;
  const wirePoints = Array.from({ length: wireSegments }, (_, i) => {
    const a = (i / wireSegments) * Math.PI * 2;
    return new Vector3(Math.cos(a) * wireRadius, Math.sin(a) * wireRadius, 0);
  });
  const wireGeom = new BufferGeometry().setFromPoints(wirePoints);
  const wireMat = new LineBasicMaterial({
    color: 0xece8e1,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  disposables.push(wireGeom, wireMat);
  const wireLoop = new LineLoop(wireGeom, wireMat);
  wireLoop.renderOrder = 4;
  wireRig.add(wireLoop);

  const sat1Geom = attachMetalAttributes(new SphereGeometry(10.5, 32, 24), 1.0); // Upper-right pearl satellite
  const sat2Geom = attachMetalAttributes(new SphereGeometry(5.8, 24, 18), 0.0);
  const sat3Geom = attachMetalAttributes(new SphereGeometry(4.2, 20, 16), 1.0);
  disposables.push(sat1Geom, sat2Geom, sat3Geom);
  const sat1 = new Mesh(sat1Geom, accentMat);
  const sat2 = new Mesh(sat2Geom, coreMat);
  const sat3 = new Mesh(sat3Geom, accentMat);
  sat1.renderOrder = 5;
  sat2.renderOrder = 5;
  sat3.renderOrder = 5;
  wireRig.add(sat1, sat2, sat3);
  group.add(wireRig);

  const ringMats = [ring0Mat, ring1Mat, ring2Mat];
  const ringHighlights = [0, 0, 0];

  return {
    group,
    update(time: number, opacity: number, activeDiscipline: number | null) {
      group.visible = opacity > 0.005;
      if (!group.visible) return;

      // Subtle zero-gravity breathing float
      group.position.y = offset.y + Math.sin(time * 0.5) * 4.5;

      // Authentic astrolabe choreography:
      // Smooth counter-rotating azimuthal spin around Z + poised harmonic gimbal precession (±8°..16°)
      // so the nested sleek sculptural profile from ref_sector_02 is ALWAYS preserved!
      gimbal0.rotation.z = time * 0.16;
      gimbal0.rotation.x = Math.sin(time * 0.32) * 0.10;
      gimbal0.rotation.y = Math.cos(time * 0.27) * 0.08;

      gimbal1.rotation.z = -time * 0.26 + 0.8;
      gimbal1.rotation.x = Math.sin(time * 0.44 + 1.1) * 0.17;
      gimbal1.rotation.y = Math.cos(time * 0.38 + 0.6) * 0.14;

      gimbal2.rotation.z = time * 0.38 + 2.1;
      gimbal2.rotation.x = Math.cos(time * 0.52 + 2.0) * 0.22;
      gimbal2.rotation.y = Math.sin(time * 0.46 + 1.4) * 0.18;

      gimbal3.rotation.z = -time * 0.52 + 0.4;
      gimbal3.rotation.x = 0.26 + Math.sin(time * 0.62) * 0.24;
      gimbal3.rotation.y = Math.cos(time * 0.55) * 0.20;

      coreGroup.rotation.z = time * 0.42;
      coreGroup.rotation.x = Math.sin(time * 0.4) * 0.18;
      miniRingMesh.rotation.z = -time * 0.65;

      // Orbiting metallic calibration moons along outer wire loop
      const a1 = time * 0.24 + 0.85;
      sat1.position.set(Math.cos(a1) * wireRadius, Math.sin(a1) * wireRadius, 0);
      const a2 = -time * 0.19 + 2.75;
      sat2.position.set(Math.cos(a2) * wireRadius, Math.sin(a2) * wireRadius, 0);
      const a3 = time * 0.31 + 4.85;
      sat3.position.set(Math.cos(a3) * wireRadius, Math.sin(a3) * wireRadius, 0);

      wireMat.opacity = 0.28 * opacity;

      for (let i = 0; i < 3; i++) {
        const target = activeDiscipline === i ? 1.0 : 0.0;
        ringHighlights[i] += (target - ringHighlights[i]) * 0.1;
        ringMats[i].uniforms.uHighlight.value = ringHighlights[i];
      }

      for (const mat of allMaterials) {
        mat.uniforms.uTime.value = time;
        mat.uniforms.uOpacity.value = opacity;
      }
    },
    getAnchorWorldPositions(centerOut, ring0Out, ring1Out, ring2Out) {
      coreGroup.getWorldPosition(centerOut);
      anchor0.getWorldPosition(ring0Out);
      anchor1.getWorldPosition(ring1Out);
      anchor2.getWorldPosition(ring2Out);
    },
    dispose() {
      for (const item of disposables) {
        item.dispose();
      }
    },
  };
}
