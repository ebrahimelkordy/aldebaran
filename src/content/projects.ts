export type Vec3 = [number, number, number];

export interface OrbitDef {
  radius: number;
  eccentricity: number;
  period: number;
  phase: number;
  inclination: number;
  node: number;
}

export interface BodyDef {
  size: number;
  bands: boolean;
  rings: boolean;
  glow: number;
  palette: { dark: Vec3; mid: Vec3; light: Vec3 };
  atmosphere: Vec3;
  orbit: OrbitDef | null;
}

export interface ProjectDef {
  code: string;
  name: string;
  subtitle: string;
  detail: string;
  metrics: { label: string; value: string }[];
  body: BodyDef;
}

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

export const PROJECTS: readonly ProjectDef[] = [
  {
    code: 'P-00',
    name: 'NOVA PLATFORM',
    subtitle: 'Enterprise analytics for real-time decisions',
    detail:
      'Our flagship product. A live analytics platform that turns millions of events into clear, instant decisions for operations teams.',
    metrics: [
      { label: 'Latency', value: 'Under 40 ms' },
      { label: 'Scale', value: '2M events / min' },
    ],
    body: {
      size: 150,
      bands: true,
      rings: true,
      glow: 1.0,
      palette: { dark: [0.5, 0.38, 0.24], mid: [0.8, 0.68, 0.5], light: [0.94, 0.89, 0.79] },
      atmosphere: [0.62, 0.72, 0.82],
      orbit: null,
    },
  },
  {
    code: 'P-01',
    name: 'LYRA CRM',
    subtitle: 'Client relationship suite',
    detail:
      'A focused workspace where sales teams track pipelines, contacts, and follow-ups in one calm interface.',
    metrics: [
      { label: 'Active users', value: '12,000+' },
      { label: 'Uptime', value: '99.99%' },
    ],
    body: {
      size: 30,
      bands: false,
      rings: false,
      glow: 0,
      palette: { dark: [0.22, 0.21, 0.2], mid: [0.5, 0.48, 0.45], light: [0.72, 0.7, 0.66] },
      atmosphere: [0.7, 0.75, 0.8],
      orbit: { radius: 330, eccentricity: 0.03, period: 170, phase: 0.4, inclination: 0.22, node: 0.4 },
    },
  },
  {
    code: 'P-02',
    name: 'HALO VAULT',
    subtitle: 'Secure document workspace',
    detail:
      'End-to-end encrypted storage with granular sharing, full audit trails, and passkey sign-in.',
    metrics: [
      { label: 'Encryption', value: 'AES-256 at rest' },
      { label: 'Sign-in', value: 'Passkeys' },
    ],
    body: {
      size: 24,
      bands: false,
      rings: false,
      glow: 0,
      palette: { dark: [0.12, 0.1, 0.09], mid: [0.33, 0.28, 0.24], light: [0.55, 0.5, 0.45] },
      atmosphere: [0.5, 0.46, 0.42],
      orbit: { radius: 410, eccentricity: 0.06, period: 230, phase: 2.1, inclination: 0.61, node: 2.2 },
    },
  },
  {
    code: 'P-03',
    name: 'ORBIT STUDIO',
    subtitle: '3D product configurator',
    detail:
      'An interactive configurator that lets customers explore, customize, and preview products in real time, right in the browser.',
    metrics: [
      { label: 'Rendering', value: 'WebGL' },
      { label: 'Load time', value: 'Under 2 s' },
    ],
    body: {
      size: 34,
      bands: false,
      rings: false,
      glow: 0,
      palette: { dark: [0.22, 0.1, 0.06], mid: [0.52, 0.27, 0.17], light: [0.76, 0.5, 0.36] },
      atmosphere: [0.7, 0.45, 0.3],
      orbit: { radius: 490, eccentricity: 0.01, period: 300, phase: 3.6, inclination: 0.09, node: 4.1 },
    },
  },
  {
    code: 'P-04',
    name: 'VERA COMMERCE',
    subtitle: 'Headless storefront',
    detail:
      'A fast, editorial storefront for a heritage brand, built to load instantly on any connection.',
    metrics: [
      { label: 'Architecture', value: 'Headless' },
      { label: 'Largest paint', value: 'Under 1 s' },
    ],
    body: {
      size: 28,
      bands: false,
      rings: false,
      glow: 0,
      palette: { dark: [0.5, 0.5, 0.52], mid: [0.78, 0.78, 0.8], light: [0.92, 0.92, 0.94] },
      atmosphere: [0.8, 0.85, 0.95],
      orbit: { radius: 570, eccentricity: 0.08, period: 380, phase: 5.0, inclination: 0.82, node: 5.3 },
    },
  },
];

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
