export interface DisciplineDef {
  id: number;
  code: string;
  badge: string;
  title: string;
  tagline: string;
  detail: string;
  specs: string[];
  metrics: { label: string; value: string }[];
}

export const FORGE_DISCIPLINES: readonly DisciplineDef[] = [
  {
    id: 0,
    code: '01',
    badge: 'CORE ARCHITECTURE',
    title: 'High-Compute Engines',
    tagline: 'Scalable back-end runtimes & distributed pipelines',
    detail:
      'Scalable back-end runtimes, WebGL render pipelines, and real-time distributed telemetry built for critical latency budgets.',
    specs: ['Sub-15ms Latency', 'Zero-Downtime Replication', 'Realtime Pipelines'],
    metrics: [
      { label: 'THROUGHPUT', value: '48.2 GB/S' },
      { label: 'JITTER', value: '0.04 MS' },
      { label: 'ACCURACY', value: '99.98%' },
    ],
  },
  {
    id: 1,
    code: '02',
    badge: 'SPATIAL & DIGITAL UI',
    title: 'Cinematic Interfaces',
    tagline: 'Fluid HUD grids, sensory haptics & design tokens',
    detail:
      'Spatial design systems, fluid HUD architectures, and micro-interactions calibrated to leave an indelible impression.',
    specs: ['Fluid HUD Grids', 'Sensory Haptics', 'Design Tokens'],
    metrics: [
      { label: 'REFRESH', value: '120 HZ' },
      { label: 'LATENCY', value: '8.4 MS' },
      { label: 'SCALE', value: 'RETINA 4K' },
    ],
  },
  {
    id: 2,
    code: '03',
    badge: 'SENSORY IDENTITY',
    title: 'Sensory Identity',
    tagline: 'Procedural typography, motion direction & sonic branding',
    detail:
      'Distinctive typography systems, generative 3D brand marks, and sonic branding for industry leaders refusing compromise.',
    specs: ['Procedural Typography', 'Motion Direction', 'Sonic Branding'],
    metrics: [
      { label: 'GLSL OPTICS', value: 'RAYMARCH' },
      { label: 'SOUND ENGINE', value: 'WEB AUDIO' },
      { label: 'TYPOGRAPHY', value: 'VARIABLE' },
    ],
  },
];
