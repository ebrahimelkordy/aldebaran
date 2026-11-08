import { BackSide, Mesh, ShaderMaterial, SphereGeometry } from 'three';
import { skyDomeFragmentShader, skyDomeVertexShader } from '@/space/shaders';

const DOME_RADIUS = 45000;

export function buildSkyDome(): Mesh {
  const mesh = new Mesh(
    new SphereGeometry(DOME_RADIUS, 48, 32),
    new ShaderMaterial({
      vertexShader: skyDomeVertexShader,
      fragmentShader: skyDomeFragmentShader,
      side: BackSide,
      depthWrite: false,
    }),
  );
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  return mesh;
}
