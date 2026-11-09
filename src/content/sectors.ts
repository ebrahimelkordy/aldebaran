export type Vec3 = [number, number, number];

export interface SectorDef {
  code: string;
  name: string;
  slug: string;
  position: Vec3;
  camera: Vec3;
  degree: number;
}

export const SECTORS: readonly SectorDef[] = [
  { code: '00', name: 'ORIGIN', slug: 'origin', position: [0, 0, 0], camera: [0, 0, 920], degree: 0 },
  { code: '01', name: 'ORBITAL SYSTEMS', slug: 'orbital', position: [1700, 280, -2600], camera: [0, 0, 700], degree: 90 },
  { code: '02', name: 'THE FORGE', slug: 'forge', position: [-2200, -100, -5500], camera: [0, 40, 900], degree: 180 },
  { code: '03', name: 'QUANTUM UPLINK', slug: 'uplink', position: [2400, 300, -8200], camera: [0, 0, 1120], degree: 270 },
] as const;

export const SECTOR_SLUGS = SECTORS.map((s) => s.slug);

export const SECTOR_CENTERS: readonly Vec3[] = [
  [0, 0, 0],
  [1700, 280, -2600],
  [-2200, -100, -5500],
  [2400, 300, -8200],
];

