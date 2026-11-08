import { BufferGeometry, Float32BufferAttribute, Points, ShaderMaterial } from 'three';
import { MAX_PIXEL_RATIO, type Vec3 } from '@/space/constants';
import { starPointFragmentShader, starPointVertexShader } from '@/space/shaders';

export interface StarSample {
  position: Vec3;
  color: Vec3;
  size: number;
  bright: number;
}

export function createStarPoints(samples: readonly StarSample[]) {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(samples.flatMap((s) => s.position), 3));
  geometry.setAttribute('aColor', new Float32BufferAttribute(samples.flatMap((s) => s.color), 3));
  geometry.setAttribute('aSize', new Float32BufferAttribute(samples.map((s) => s.size), 1));
  geometry.setAttribute('aBright', new Float32BufferAttribute(samples.map((s) => s.bright), 1));
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1.0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO) },
    },
    vertexShader: starPointVertexShader,
    fragmentShader: starPointFragmentShader,
    transparent: true,
    depthWrite: false,
  });
  return { object: new Points(geometry, material), material };
}
