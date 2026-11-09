export * from '@/space/content';

export type Vec3 = [number, number, number];

export interface DistinctMoonOrbit {
  semiMajor: number;
  semiMinor: number;
  planeTiltX: number;
  planeRollZ: number;
  planeNodeY: number;
  speed: number;
  phase: number;
  spinSpeed: number;
  size: number;
  palette: { dark: Vec3; mid: Vec3; light: Vec3 };
}

export const MOON_ORBITS: Record<number, DistinctMoonOrbit> = {
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
