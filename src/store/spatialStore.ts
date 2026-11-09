import { useSyncExternalStore } from 'react';

export const SECTOR_SLUGS = ['origin', 'orbital', 'forge', 'uplink'] as const;
export type SectorSlug = (typeof SECTOR_SLUGS)[number];

export interface SpatialState {
  sector: number;
  warpTarget: number | null;
  selectedProject: number | null;
  activeDiscipline: number | null;
  contextLost: boolean;
  engineReady: boolean;
  archiveOpen: boolean;
  selectedArchiveProject: string | null;
}

export function readSectorFromHash(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.location.hash.replace(/^#/, '').trim().toLowerCase();
  const idx = SECTOR_SLUGS.indexOf(raw as SectorSlug);
  return idx >= 0 ? idx : 0;
}

function writeSectorToHash(sector: number): void {
  if (typeof window === 'undefined') return;
  const slug = SECTOR_SLUGS[sector] ?? SECTOR_SLUGS[0];
  const nextHash = `#${slug}`;
  if (window.location.hash !== nextHash) {
    window.history.replaceState(null, '', nextHash);
  }
}

let state: SpatialState = {
  sector: readSectorFromHash(),
  warpTarget: null,
  selectedProject: null,
  activeDiscipline: null,
  contextLost: false,
  engineReady: false,
  archiveOpen: false,
  selectedArchiveProject: null,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    const nextSector = readSectorFromHash();
    if (nextSector !== state.sector) {
      spatialStore.syncInstant(nextSector);
    }
  });
}

export const spatialStore = {
  getState(): SpatialState {
    return state;
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  startWarp(target: number): void {
    if (target < 0 || target >= SECTOR_SLUGS.length) return;
    state = {
      ...state,
      warpTarget: target,
      selectedProject: null,
      activeDiscipline: null,
      archiveOpen: false,
      selectedArchiveProject: null,
    };
    writeSectorToHash(target);
    emit();
  },
  arriveSector(sector: number): void {
    state = { ...state, sector, warpTarget: null };
    writeSectorToHash(sector);
    emit();
  },
  syncInstant(sector: number): void {
    state = {
      ...state,
      sector,
      warpTarget: null,
      selectedProject: null,
      activeDiscipline: null,
      archiveOpen: false,
      selectedArchiveProject: null,
    };
    writeSectorToHash(sector);
    emit();
  },
  setSelectedProject(selectedProject: number | null): void {
    if (state.selectedProject === selectedProject) return;
    state = { ...state, selectedProject };
    emit();
  },
  setActiveDiscipline(activeDiscipline: number | null): void {
    if (state.activeDiscipline === activeDiscipline) return;
    state = { ...state, activeDiscipline };
    emit();
  },
  setContextLost(contextLost: boolean): void {
    if (state.contextLost === contextLost) return;
    state = { ...state, contextLost };
    emit();
  },
  setEngineReady(engineReady: boolean): void {
    if (state.engineReady === engineReady) return;
    state = { ...state, engineReady };
    emit();
  },
  setArchiveOpen(archiveOpen: boolean): void {
    if (state.archiveOpen === archiveOpen) return;
    state = { ...state, archiveOpen, selectedArchiveProject: archiveOpen ? state.selectedArchiveProject : null };
    emit();
  },
  setSelectedArchiveProject(selectedArchiveProject: string | null): void {
    if (state.selectedArchiveProject === selectedArchiveProject) return;
    state = { ...state, selectedArchiveProject };
    emit();
  },
};

export function useSpatialStore<T>(selector: (s: SpatialState) => T): T {
  return useSyncExternalStore(
    spatialStore.subscribe,
    () => selector(spatialStore.getState()),
    () => selector(spatialStore.getState()),
  );
}
