import type { Vec3 } from '@/space/constants';

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

export interface ServiceDef {
  code: string;
  badge: string;
  title: string;
  detail: string;
  specs: string[];
}

export const SERVICES: readonly ServiceDef[] = [
  {
    code: '01',
    badge: 'CORE ARCHITECTURE',
    title: 'High-Compute Engines',
    detail: 'Scalable back-end runtimes, WebGL render pipelines, and real-time distributed telemetry built for critical latency budgets.',
    specs: ['Sub-15ms Latency', 'Zero-Downtime Replication', 'Realtime Pipelines'],
  },
  {
    code: '02',
    badge: 'SPATIAL & DIGITAL UI',
    title: 'Cinematic Interfaces',
    detail: 'Spatial design systems, fluid HUD architectures, and micro-interactions calibrated to leave an indelible impression.',
    specs: ['Fluid HUD Grids', 'Sensory Haptics', 'Design Tokens'],
  },
  {
    code: '03',
    badge: 'SENSORY IDENTITY',
    title: 'Brand & Motion Direction',
    detail: 'Distinctive typography systems, generative 3D brand marks, and sonic branding for industry leaders refusing compromise.',
    specs: ['Procedural Typography', 'Motion Direction', 'Sonic Branding'],
  },
];

export const SCOPE_OPTIONS = [
  { value: 'software', label: 'Software' },
  { value: 'uiux', label: 'Product interface' },
  { value: 'identity', label: 'Visual identity' },
  { value: 'other', label: 'Other' },
] as const;

export type ScopeValue = (typeof SCOPE_OPTIONS)[number]['value'];
