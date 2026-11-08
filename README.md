# Aldebaran

Interactive 3D portfolio and spatial web application built with React, TypeScript, and Three.js.

Rather than scrolling through static sections, the application runs a continuous WebGL scene graph divided into four spatial sectors, pairing custom procedural GLSL shaders and 3D geometry with synchronized 60fps DOM overlays.

## Architecture & Scenes

| Sector | Scene | Implementation Summary |
| :--- | :--- | :--- |
| `00` | **Origin** | Procedural solar photosphere and corona driven by multi-octave 3D fractional Brownian motion (FBM), double domain-warping, limb darkening, and filmic exposure compression. |
| `01` | **Orbital Systems** | Tilted ringed gas giant with spherical atmospheric band advection, inclined 3D lunar orbits, depth-occluded 3D display planes, and live world-to-screen coordinate projection for HUD leader lines. |
| `02` | **The Forge** | Multi-shell volumetric nebula shaders combined with a procedurally generated, faceted metallic armillary astrolabe (`BufferGeometry` with split normals and anisotropic tangents) and telemetry panels. |
| `03` | **Quantum Uplink** | Raymarched black hole and Keplerian accretion disk with gravitational lensing, relativistic Doppler beaming, split foreground/background depth occlusion, and an asynchronous contact console. |

## Tech Stack

- **UI & State:** React 18, TypeScript 5, Tailwind CSS
- **3D & Shaders:** Three.js (`WebGLRenderer`, custom GLSL vertex/fragment `ShaderMaterial`, procedural `BufferGeometry`, canvas-backed high-DPI 3D typography planes)
- **Audio:** Procedural Web Audio API ambient synthesis and interaction cues (`src/space/audio.ts`)
- **Backend (Optional):** Supabase (`@supabase/supabase-js`) for storing contact form submissions; runs standalone without credentials when `.env` is omitted
- **Tooling:** Vite 7, ESLint 9

## Project Structure

```text
├── public/
│   └── favicon.svg
├── src/
│   ├── components/space/       # Sector HUD overlays, navigation, cursor, and boot loader
│   │   ├── ArtifactsPanel.tsx
│   │   ├── CosmicBootLoader.tsx
│   │   ├── CosmicCursor.tsx
│   │   ├── Experience.tsx
│   │   ├── HorizonPanel.tsx
│   │   ├── SectorNav.tsx
│   │   ├── SystemsPanel.tsx
│   │   └── TransmissionPanel.tsx
│   ├── lib/
│   │   └── supabase.ts         # Optional Supabase client initialization
│   ├── space/                  # Three.js scene graph, procedural geometry, and GLSL shaders
│   │   ├── audio.ts
│   │   ├── blackHole.ts
│   │   ├── blackHoleShaders.ts
│   │   ├── constants.ts
│   │   ├── content.ts
│   │   ├── forgeAstrolabe.ts
│   │   ├── forgeNebulaShaders.ts
│   │   ├── mainStar.ts
│   │   ├── planetShaders.ts
│   │   ├── planetSystem.ts
│   │   ├── sceneBuilders.ts
│   │   ├── shaders.ts
│   │   ├── skyDome.ts
│   │   ├── starClusters.ts
│   │   ├── starField.ts
│   │   ├── starPoints.ts
│   │   └── universe.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
└── supabase/migrations/        # SQL schema for optional contact form persistence
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation & Local Development

```bash
npm install
npm run dev
```

The application starts locally via Vite with hot module replacement. No environment variables are required to run the 3D scenes and UI locally.

### Optional Database Setup

To persist messages submitted through the Sector `03` contact form:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project.
3. Apply the SQL migration in `supabase/migrations/20261030163348_create_transmissions_table.sql`.

## Scripts

- `npm run dev` — Start the local development server
- `npm run build` — Build optimized production assets
- `npm run preview` — Preview the production build locally
- `npm run typecheck` — Run TypeScript type checking (`tsc --noEmit`)
- `npm run lint` — Run ESLint across the codebase
