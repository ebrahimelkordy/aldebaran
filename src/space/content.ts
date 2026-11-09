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

export interface TechTag {
  category: 'Frontend' | 'Backend' | 'Spatial & 3D' | 'Cloud & Infra' | 'Security';
  name: string;
}

export interface ScreenshotSpec {
  title: string;
  type: string;
  description: string;
}

export interface ProjectDef {
  code: string;
  name: string;
  subtitle: string;
  detail: string;
  architectureNarrative: string;
  engineeringChallenges: string[];
  techStack: TechTag[];
  metrics: { label: string; value: string }[];
  liveUrl?: string;
  repoUrl?: string;
  orbitalStats?: {
    orbitName: string;
    radius: string;
    velocity: string;
    inclination: string;
    period: string;
  };
  screenshots: ScreenshotSpec[];
  body: BodyDef;
}

export interface ArchiveProjectDef {
  id: string;
  code: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  architecture: string;
  highlights: string[];
  techStack: TechTag[];
  metrics: { label: string; value: string }[];
  liveUrl?: string;
  repoUrl?: string;
  status: 'PRODUCTION' | 'RELEASED' | 'MAINTAINED';
}

export const PROJECTS: readonly ProjectDef[] = [
  {
    code: 'P-00',
    name: 'NOVA PLATFORM',
    subtitle: 'High-Throughput Enterprise Telemetry & Real-Time Decision Mesh',
    detail:
      'Our flagship spatial intelligence platform. Ingests, processes, and maps millions of continuous telemetry events into immediate tactical decisions for operations teams.',
    architectureNarrative:
      'Architected to eliminate high-frequency ingestion bottlenecks across multi-region edge clusters. Features an in-memory lock-free event ring buffer, distributed consensus via Raft, and real-time WebGL spatial heatmaps rendering 100,000 vectors with zero GC pauses.',
    engineeringChallenges: [
      'Sustaining 2,400,000 continuous event streams per minute without garbage collection freezes.',
      'Achieving sub-40ms end-to-end propagation using custom binary WebSocket framing and delta compression.',
      'Hardware-accelerated geospatial projection on low-power mobile devices via WebGL 2.0 compute shaders.',
    ],
    techStack: [
      { category: 'Frontend', name: 'React 18' },
      { category: 'Frontend', name: 'TypeScript' },
      { category: 'Spatial & 3D', name: 'WebGL 2.0' },
      { category: 'Backend', name: 'Go (Golang)' },
      { category: 'Backend', name: 'gRPC & Protobuf' },
      { category: 'Cloud & Infra', name: 'Apache Kafka' },
      { category: 'Cloud & Infra', name: 'Redis Cluster' },
      { category: 'Cloud & Infra', name: 'Kubernetes' },
      { category: 'Security', name: 'mTLS & RBAC' },
    ],
    metrics: [
      { label: 'Latency', value: 'Under 40 ms' },
      { label: 'Throughput', value: '2.4M evt / min' },
      { label: 'Global PoPs', value: '48 Edge Nodes' },
      { label: 'Uptime SLA', value: '99.999%' },
    ],
    liveUrl: 'https://github.com/ebrahimelkordy',
    repoUrl: 'https://github.com/ebrahimelkordy/aldebran',
    orbitalStats: {
      orbitName: 'STATIONARY SOLAR CORE',
      radius: '0.00 AU (Barycenter)',
      velocity: '0.00 km/s (Anchor)',
      inclination: '0.0° Equatorial',
      period: 'Synchronous Stationary',
    },
    screenshots: [
      {
        title: 'Geospatial Telemetry Matrix',
        type: 'Real-Time Vector HUD',
        description: 'Multi-threaded spatial projection mapping global cluster latency and event throughput.',
      },
      {
        title: 'Distributed Stream Topology',
        type: 'Pipeline Architecture',
        description: 'Interactive node graph demonstrating lock-free ring buffer fanout across 48 edge PoPs.',
      },
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
    subtitle: 'Autonomous Sales Orchestration & Pipeline Intelligence Suite',
    detail:
      'A focused workspace where sales teams track pipelines, contacts, and automated follow-up vectors in one calm, distraction-free spatial interface.',
    architectureNarrative:
      'Eliminates the friction of bloated legacy CRMs through an instant keyboard-driven command palette, predictive lead scoring utilizing pgvector vector search, and optimistic offline-first local replication with conflict-free replicated data types (CRDTs).',
    engineeringChallenges: [
      'Multi-user collaborative pipeline boards synchronizing instantaneously across sessions with CRDTs.',
      'Sub-second semantic search indexing over 500,000 customer interactions using embedded vectors.',
      'Instantaneous offline capability with automatic background resolution upon network reconnection.',
    ],
    techStack: [
      { category: 'Frontend', name: 'Next.js 14' },
      { category: 'Frontend', name: 'React 18' },
      { category: 'Frontend', name: 'TypeScript' },
      { category: 'Frontend', name: 'Tailwind CSS' },
      { category: 'Backend', name: 'Node.js' },
      { category: 'Backend', name: 'GraphQL' },
      { category: 'Backend', name: 'PostgreSQL' },
      { category: 'Cloud & Infra', name: 'Cloudflare Workers' },
      { category: 'Security', name: 'Row-Level Security' },
    ],
    metrics: [
      { label: 'Active Users', value: '14,200+' },
      { label: 'Search Latency', value: '12 ms' },
      { label: 'Sync Model', value: 'Instant CRDT' },
      { label: 'Uptime', value: '99.99%' },
    ],
    liveUrl: 'https://github.com/ebrahimelkordy',
    repoUrl: 'https://github.com/ebrahimelkordy',
    orbitalStats: {
      orbitName: 'KEPLER ELLIPTIC ORBIT 1',
      radius: '452 km',
      velocity: '28.4 km/s',
      inclination: '21.8° Retrograde',
      period: '170 h Orbit Cycle',
    },
    screenshots: [
      {
        title: 'Dynamic Pipeline Board',
        type: 'CRDT Kanban View',
        description: 'Multi-tenant pipeline organizer updating instantaneously across collaborative teams.',
      },
      {
        title: 'Customer Vector Dossier',
        type: 'Semantic Intelligence',
        description: 'Automated timeline summarizing customer sentiment and deal probability scores.',
      },
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
    subtitle: 'Zero-Knowledge Cryptographic Vault & Passkey Secure Storage',
    detail:
      'End-to-end encrypted storage with hardware passkey authentication, cryptographically verifiable audit trails, and zero-knowledge client-side encryption.',
    architectureNarrative:
      'Designed under a zero-trust model where host infrastructure is assumed untrusted. Data is encrypted entirely in the client browser using WebCrypto AES-256-GCM before transmission; server nodes hold only cryptographically blinded ciphertexts and Merkle audit trees.',
    engineeringChallenges: [
      'Hardware WebAuthn / Passkey signature verification without transmitting secrets or passwords.',
      'Client-side chunked streaming encryption for multi-gigabyte files inside browser memory limits.',
      'Tamper-proof append-only cryptographic ledger verifying file access integrity with SHA-512.',
    ],
    techStack: [
      { category: 'Frontend', name: 'React 18' },
      { category: 'Frontend', name: 'WebCrypto API' },
      { category: 'Frontend', name: 'TypeScript' },
      { category: 'Backend', name: 'Rust' },
      { category: 'Backend', name: 'Tokio Async' },
      { category: 'Security', name: 'AES-256-GCM' },
      { category: 'Security', name: 'FIDO2 Passkeys' },
      { category: 'Cloud & Infra', name: 'Fly.io' },
    ],
    metrics: [
      { label: 'Encryption', value: 'AES-256-GCM' },
      { label: 'Auth Standard', value: 'FIDO2 Passkeys' },
      { label: 'Zero Knowledge', value: '100% Client-Side' },
      { label: 'Integrity', value: 'SHA-512 Merkle' },
    ],
    liveUrl: 'https://github.com/ebrahimelkordy',
    repoUrl: 'https://github.com/ebrahimelkordy',
    orbitalStats: {
      orbitName: 'POLAR OBLIQUE ORBIT 2',
      radius: '518 km',
      velocity: '24.1 km/s',
      inclination: '49.3° Oblique',
      period: '230 h Orbit Cycle',
    },
    screenshots: [
      {
        title: 'Client-Side Key Derivation',
        type: 'Cryptographic Protocol',
        description: 'Argon2id and WebAuthn hardware binding generating ephemeral session credentials.',
      },
      {
        title: 'Verifiable Audit Ledger',
        type: 'Integrity Verification',
        description: 'Real-time Merkle tree proof confirming zero data tampering across distributed storage nodes.',
      },
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
    subtitle: 'High-Fidelity 3D WebGL Configurator & Spatial Product Studio',
    detail:
      'An interactive 60fps configurator that lets customers explore, customize physical materials, and preview products in real time directly in the browser.',
    architectureNarrative:
      'Bridges high-end industrial CAD visualization and ultra-fast mobile browser performance. Implements custom physically based rendering (PBR) shaders, Draco geometry compression, and progressive texture streaming with Web Workers.',
    engineeringChallenges: [
      'Streaming 1,200,000 triangle industrial meshes with Draco compression in under 1.8 seconds.',
      'Real-time environment map PBR reflections and contact ambient occlusion on mobile GPUs.',
      'Custom glTF material variant switcher operating with zero texture re-allocation jank.',
    ],
    techStack: [
      { category: 'Spatial & 3D', name: 'Three.js' },
      { category: 'Spatial & 3D', name: 'WebGL 2.0' },
      { category: 'Spatial & 3D', name: 'GLSL Shaders' },
      { category: 'Spatial & 3D', name: 'Draco Compression' },
      { category: 'Frontend', name: 'React 18' },
      { category: 'Frontend', name: 'TypeScript' },
      { category: 'Frontend', name: 'Zustand' },
      { category: 'Cloud & Infra', name: 'CloudFront CDN' },
    ],
    metrics: [
      { label: 'Render Target', value: '60 FPS Solid' },
      { label: 'Cold Load', value: 'Under 1.8 s' },
      { label: 'Polycount Scale', value: '1.2M Polygons' },
      { label: 'VRAM Usage', value: '< 90 MB' },
    ],
    liveUrl: 'https://github.com/ebrahimelkordy',
    repoUrl: 'https://github.com/ebrahimelkordy',
    orbitalStats: {
      orbitName: 'RESONANT ORBIT 3',
      radius: '486 km',
      velocity: '26.7 km/s',
      inclination: '35.5° Prograde',
      period: '300 h Orbit Cycle',
    },
    screenshots: [
      {
        title: 'PBR Material Customizer',
        type: 'Interactive Viewport',
        description: 'Real-time metallic, roughness, and clearcoat adjustments with physically accurate lighting.',
      },
      {
        title: 'Exploded Assembly View',
        type: 'Kinematic Breakdown',
        description: 'Smooth spatial disassembly of multi-part mechanical components along kinematic axes.',
      },
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
    subtitle: 'Ultra-Low-Latency Headless Luxury Commerce Architecture',
    detail:
      'A fast, editorial storefront for a heritage brand, built to load instantly on any connection with sub-second largest contentful paint.',
    architectureNarrative:
      'Eliminates monolithic ecommerce performance degradation by deploying storefront edge workers in 275+ global cities. Features optimistic cart operations, sub-second LCP, and seamless Stripe Payment Element integration.',
    engineeringChallenges: [
      'Consistently achieving 99+ Google Lighthouse performance scores across both mobile and desktop.',
      'Edge caching with stale-while-revalidate for real-time inventory counts with zero overselling risk.',
      'Micro-interaction physics and smooth layout transitions without browser layout thrashing.',
    ],
    techStack: [
      { category: 'Frontend', name: 'Next.js 14' },
      { category: 'Frontend', name: 'TypeScript' },
      { category: 'Frontend', name: 'Tailwind CSS' },
      { category: 'Backend', name: 'Shopify Storefront' },
      { category: 'Backend', name: 'PostgreSQL' },
      { category: 'Cloud & Infra', name: 'Cloudflare Workers' },
      { category: 'Cloud & Infra', name: 'Vercel Edge' },
      { category: 'Security', name: 'PCI-DSS Level 1' },
    ],
    metrics: [
      { label: 'Largest Paint', value: 'Under 0.85 s' },
      { label: 'Lighthouse', value: '99 / 100 Perf' },
      { label: 'Abandonment', value: '-34% Reduced' },
      { label: 'Global Edge', value: '275+ Cities' },
    ],
    liveUrl: 'https://github.com/ebrahimelkordy',
    repoUrl: 'https://github.com/ebrahimelkordy',
    orbitalStats: {
      orbitName: 'OUTER EQUATORIAL ORBIT 4',
      radius: '582 km',
      velocity: '19.8 km/s',
      inclination: '16.0° Equatorial',
      period: '380 h Orbit Cycle',
    },
    screenshots: [
      {
        title: 'Editorial Visual Catalog',
        type: 'Dynamic Grid Layout',
        description: 'Fluid luxury showcase with staggered image reveals and instant responsive transitions.',
      },
      {
        title: 'Edge-Rendered Checkout',
        type: 'Zero-Friction Funnel',
        description: 'Pre-computed one-click payment flows optimized for global localized payment methods.',
      },
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

// Tier B: Deep Outer Asteroid Belt Portfolio Archive
export const ARCHIVE_PROJECTS: readonly ArchiveProjectDef[] = [
  {
    id: 'aether-kernel',
    code: 'ARC-01',
    name: 'AETHER KERNEL',
    category: 'DISTRIBUTED SYSTEMS // STREAMING',
    tagline: 'Ultra-low-latency distributed event broker & message queue',
    description:
      'A distributed log-structured event broker engineered in Go, utilizing custom Raft consensus for deterministic multi-node replication and zero-copy ring buffers.',
    architecture:
      'Log-structured merge trees with memory-mapped files and epoll network polling delivering 1.8M sustained messages/second per broker node with strict FIFO ordering guarantees.',
    highlights: [
      'Zero-copy memory mapped ring buffers bypassing OS kernel copy overhead.',
      'Deterministic Raft leader election with sub-50ms heartbeat failover.',
      'Prometheus exporter telemetry with nanosecond-resolution latency histograms.',
    ],
    techStack: [
      { category: 'Backend', name: 'Go (Golang)' },
      { category: 'Backend', name: 'gRPC' },
      { category: 'Cloud & Infra', name: 'Raft Consensus' },
      { category: 'Cloud & Infra', name: 'Kubernetes' },
      { category: 'Cloud & Infra', name: 'Docker' },
      { category: 'Cloud & Infra', name: 'Prometheus' },
    ],
    metrics: [
      { label: 'Throughput', value: '1.8M msg / sec' },
      { label: 'P99 Latency', value: '< 0.95 ms' },
      { label: 'Replication', value: '3-Node Raft' },
      { label: 'Data Loss', value: 'Zero (Fsync)' },
    ],
    liveUrl: 'https://github.com/ebrahimelkordy',
    repoUrl: 'https://github.com/ebrahimelkordy',
    status: 'PRODUCTION',
  },
  {
    id: 'chronos-shader-lab',
    code: 'ARC-02',
    name: 'CHRONOS SHADER LAB',
    category: 'CREATIVE TECH // GRAPHICS',
    tagline: 'Procedural volumetric raymarching & astrophysical simulation engine',
    description:
      'Browser-based real-time shader laboratory implementing Schwarzschild gravitational lensing, relativistic Doppler beaming, and volumetric raymarched stellar nebulae.',
    architecture:
      'Custom GLSL / WGSL compute kernels calculating geodesic ray paths around spinning Kerr metrics with adaptive step sizing and temporal anti-aliasing.',
    highlights: [
      'Real-time curved light ray geodesic integration around spinning singularities.',
      'Volumetric raymarching with 3D simplex noise fractional brownian motion.',
      'Dynamic downsampling and temporal upscaling maintaining 60 FPS on integrated GPUs.',
    ],
    techStack: [
      { category: 'Spatial & 3D', name: 'WebGL 2.0' },
      { category: 'Spatial & 3D', name: 'WebGPU' },
      { category: 'Spatial & 3D', name: 'GLSL' },
      { category: 'Spatial & 3D', name: 'Three.js' },
      { category: 'Frontend', name: 'TypeScript' },
    ],
    metrics: [
      { label: 'Framerate', value: '60 FPS Solid' },
      { label: 'Ray Steps', value: '128 / Pixel' },
      { label: 'Precision', value: 'FP32 Geodesics' },
      { label: 'Shaders', value: '14 Procedural' },
    ],
    liveUrl: 'https://github.com/ebrahimelkordy',
    repoUrl: 'https://github.com/ebrahimelkordy',
    status: 'PRODUCTION',
  },
  {
    id: 'synapse-ai-gateway',
    code: 'ARC-03',
    name: 'SYNAPSE AI GATEWAY',
    category: 'CLOUD EDGE // AI INFRASTRUCTURE',
    tagline: 'Sub-10ms semantic cache & load balancer for LLM inference streams',
    description:
      'High-throughput edge reverse-proxy that analyzes LLM prompt embeddings in real-time, deduplicating repetitive calls via vector caching and dynamically routing across fallback providers.',
    architecture:
      'Rust compiled to WebAssembly running across Cloudflare Workers edge nodes with in-memory approximate nearest neighbor (ANN) vector indexing and token-rate-limiting buckets.',
    highlights: [
      'Sub-10ms vector cache hit turnaround drastically reducing upstream inference costs.',
      'Seamless Server-Sent Events (SSE) streaming proxy with on-the-fly token accounting.',
      'Automatic failover across multiple model providers with latency-weighted balancing.',
    ],
    techStack: [
      { category: 'Backend', name: 'Rust' },
      { category: 'Cloud & Infra', name: 'WebAssembly' },
      { category: 'Cloud & Infra', name: 'Cloudflare Workers' },
      { category: 'Backend', name: 'Upstash Vector' },
      { category: 'Frontend', name: 'TypeScript' },
    ],
    metrics: [
      { label: 'Cache Latency', value: '8.4 ms' },
      { label: 'Cost Reduction', value: '68% Saved' },
      { label: 'Throughput', value: '45k req / sec' },
      { label: 'Protocols', value: 'SSE & gRPC' },
    ],
    liveUrl: 'https://github.com/ebrahimelkordy',
    repoUrl: 'https://github.com/ebrahimelkordy',
    status: 'PRODUCTION',
  },
  {
    id: 'titan-db-cluster',
    code: 'ARC-04',
    name: 'TITAN DB CLUSTER',
    category: 'DATABASE SYSTEMS // DEVOPS',
    tagline: 'Automated zero-downtime sharding orchestrator for PostgreSQL',
    description:
      'Kubernetes-native operator automating dynamic horizontal sharding, connection pooling, and failover elections for distributed PostgreSQL database clusters.',
    architecture:
      'Go controller leveraging Kubernetes Custom Resource Definitions (CRDs), HAProxy dynamic reconfiguration, and Patroni quorum consensus with etcd backed topology.',
    highlights: [
      'Online database re-sharding with zero write pauses using change-data-capture logical streams.',
      'Automated standby promotion in under 2.8 seconds during hardware node failures.',
      'Connection multiplexing reducing idle database socket consumption by 85%.',
    ],
    techStack: [
      { category: 'Backend', name: 'Go (Golang)' },
      { category: 'Backend', name: 'PostgreSQL' },
      { category: 'Cloud & Infra', name: 'Kubernetes CRD' },
      { category: 'Cloud & Infra', name: 'Docker' },
      { category: 'Cloud & Infra', name: 'Terraform' },
      { category: 'Security', name: 'TLS Encryption' },
    ],
    metrics: [
      { label: 'Sharding Scale', value: '16 Shards' },
      { label: 'Failover Time', value: '< 2.8 s' },
      { label: 'Socket Saving', value: '85% Reduced' },
      { label: 'Migration SLA', value: 'Zero Downtime' },
    ],
    liveUrl: 'https://github.com/ebrahimelkordy',
    repoUrl: 'https://github.com/ebrahimelkordy',
    status: 'RELEASED',
  },
  {
    id: 'valence-protocol',
    code: 'ARC-05',
    name: 'VALENCE PROTOCOL',
    category: 'CRYPTOGRAPHY // DECENTRALIZED IDENTITY',
    tagline: 'Decentralized zero-knowledge credential verification protocol',
    description:
      'Privacy-preserving identity verification protocol enabling users to prove cryptographic credentials (accreditation, age, residency) without revealing personal identifiers.',
    architecture:
      'Circom zero-knowledge circuit compilation verified via Groth16 zk-SNARK verifier smart contracts deployed on Ethereum L2 rollups with client-side WebAssembly proof generation.',
    highlights: [
      'Client-side zero-knowledge proof generation in under 1.2 seconds inside mobile browsers.',
      'Gas-optimized Solidity verifier contracts consuming under 210,000 gas per proof verification.',
      'Zero personally identifiable information (PII) ever transmitted or stored on distributed ledgers.',
    ],
    techStack: [
      { category: 'Security', name: 'Circom' },
      { category: 'Security', name: 'zk-SNARKs (Groth16)' },
      { category: 'Backend', name: 'Solidity' },
      { category: 'Frontend', name: 'TypeScript' },
      { category: 'Frontend', name: 'Next.js 14' },
      { category: 'Frontend', name: 'Wagmi / Viem' },
    ],
    metrics: [
      { label: 'Proof Time', value: '1.2 s (Browser)' },
      { label: 'Verifier Gas', value: '< 210k Gas' },
      { label: 'PII Exposure', value: '0% Guaranteed' },
      { label: 'Standard', value: 'ERC-4337' },
    ],
    liveUrl: 'https://github.com/ebrahimelkordy',
    repoUrl: 'https://github.com/ebrahimelkordy',
    status: 'RELEASED',
  },
  {
    id: 'spectra-viz',
    code: 'ARC-06',
    name: 'SPECTRA VIZ',
    category: 'FINANCIAL TECH // PERFORMANCE UI',
    tagline: 'High-throughput order-book visualizer & liquidity depth heatmap',
    description:
      'Ultra-dense financial visualization dashboard rendering live Level-2 market depth books and microsecond trade executions using HTML5 Canvas 2D and SharedArrayBuffers.',
    architecture:
      'Dedicated Web Worker ingestion thread deserializing binary WebSocket streams and updating shared memory buffers, completely bypassing React reconciliation for solid 60 FPS.',
    highlights: [
      'High-frequency WebSocket ingestion handling up to 100,000 order book updates per second.',
      'Lock-free atomic SharedArrayBuffer data exchange between Web Worker and Canvas render thread.',
      'Dynamic color-graded liquidity depth bands with sub-pixel crispness on Retina displays.',
    ],
    techStack: [
      { category: 'Frontend', name: 'React 18' },
      { category: 'Frontend', name: 'TypeScript' },
      { category: 'Frontend', name: 'HTML5 Canvas 2D' },
      { category: 'Cloud & Infra', name: 'Web Workers' },
      { category: 'Cloud & Infra', name: 'SharedArrayBuffer' },
    ],
    metrics: [
      { label: 'Event Capacity', value: '100k upd / sec' },
      { label: 'Render FPS', value: 'Solid 60 FPS' },
      { label: 'Main Thread Block', value: '0.0 ms' },
      { label: 'Latency', value: '< 5 ms' },
    ],
    liveUrl: 'https://github.com/ebrahimelkordy',
    repoUrl: 'https://github.com/ebrahimelkordy',
    status: 'PRODUCTION',
  },
];
