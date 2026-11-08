export type Vec3 = [number, number, number];

export const PALETTE = {
  void: '#030407',
  champagne: '#FBF2D5',
  cream: '#ECE8E1',
} as const;

export const LOW_END_DEVICE = (navigator.hardwareConcurrency ?? 8) <= 4;
export const MAX_PIXEL_RATIO = LOW_END_DEVICE ? 1.25 : 2;

export const REST_FOV = 60;
export const WARP_FOV_BOOST = 35;
export const WARP_DURATION = 2.8;
export const FOCUS_OFFSET: Vec3 = [0, 30, 440];

export interface SectorDef {
  code: string;
  name: string;
  position: Vec3;
  camera: Vec3;
  degree: number;
}

export const GALAXY_BAND_NORMAL: Vec3 = [0.28, 0.93, 0.19];
export const STAR_LIGHT_COLOR: Vec3 = [1.0, 0.86, 0.7];

export const SECTORS: readonly SectorDef[] = [
  { code: '00', name: 'ORIGIN', position: [0, 0, 0], camera: [0, 0, 920], degree: 0 },
  { code: '01', name: 'ORBITAL SYSTEMS', position: [1700, 280, -2600], camera: [0, 0, 700], degree: 90 },
  { code: '02', name: 'THE FORGE', position: [-2200, -100, -5500], camera: [0, 40, 900], degree: 180 },
  { code: '03', name: 'QUANTUM UPLINK', position: [2400, 300, -8200], camera: [0, 0, 1120], degree: 270 },
];
