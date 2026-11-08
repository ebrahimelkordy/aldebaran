import { Color, DoubleSide, Mesh, MeshBasicMaterial, NormalBlending, RingGeometry, Vector3 } from 'three';
import { PALETTE, SECTORS } from '@/space/constants';

const CHAMPAGNE = new Color(PALETTE.champagne);

export function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sectorCenter(index: number): Vector3 {
  return new Vector3(...SECTORS[index].position);
}

export function createShockwaveRing(): Mesh {
  return new Mesh(
    new RingGeometry(0.92, 1, 128),
    new MeshBasicMaterial({
      color: CHAMPAGNE,
      transparent: true,
      opacity: 0.9,
      blending: NormalBlending,
      depthWrite: false,
      side: DoubleSide,
    }),
  );
}
