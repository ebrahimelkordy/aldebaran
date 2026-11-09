import { useCallback, useEffect, useRef, useState } from 'react';
import { Power, X } from 'lucide-react';
import SectorNav from '@/components/space/SectorNav';
import HorizonPanel from '@/components/space/HorizonPanel';
import ArtifactsPanel from '@/components/space/ArtifactsPanel';
import SystemsPanel from '@/components/space/SystemsPanel';
import TransmissionPanel from '@/components/space/TransmissionPanel';
import { playClick, playWarp, startAmbientDrone, toggleAudio } from '@/space/audio';
import CosmicCursor from '@/components/space/CosmicCursor';
import CosmicBootLoader from '@/components/space/CosmicBootLoader';
import { SECTORS } from '@/space/constants';
import { Universe } from '@/space/universe';
import { readSectorFromHash, spatialStore, useSpatialStore } from '@/store/spatialStore';
import { useViewportMode } from '@/hooks/useViewportMode';

export default function Experience() {
  const { isMobile } = useViewportMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const universeRef = useRef<Universe | null>(null);
  const sector = useSpatialStore((s) => s.sector);
  const warpTarget = useSpatialStore((s) => s.warpTarget);
  const selectedProject = useSpatialStore((s) => s.selectedProject);
  const contextLost = useSpatialStore((s) => s.contextLost);
  const [muted, setMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const initialSector = readSectorFromHash();
    const universe = new Universe(
      container,
      {
        onWarpStart: (target) => {
          playWarp();
          spatialStore.startWarp(target);
          setMenuOpen(false);
        },
        onArrive: (index) => {
          spatialStore.arriveSector(index);
        },
        onProjectClick: (index) => {
          playClick();
          spatialStore.setSelectedProject(index);
        },
      },
      initialSector,
    );
    universeRef.current = universe;
    return () => {
      try {
        universe.dispose();
      } catch (err) {
        console.warn('Universe disposal error caught:', err);
      }
      universeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onHash = () => {
      const targetSector = readSectorFromHash();
      if (universeRef.current) {
        universeRef.current.jumpInstant(targetSector);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    universeRef.current?.focusProject(selectedProject);
  }, [selectedProject]);

  const handleNavigate = useCallback((index: number) => {
    startAmbientDrone();
    playClick();
    setMenuOpen(false);
    universeRef.current?.goTo(index);
  }, []);

  const selectProject = useCallback((index: number | null) => {
    startAmbientDrone();
    if (index !== null) playClick();
    spatialStore.setSelectedProject(index);
  }, []);

  const broadcast = useCallback(() => {
    startAmbientDrone();
    universeRef.current?.emitShockwave();
  }, []);

  const getSector1Anchors = useCallback(
    () => universeRef.current?.getSector1ScreenAnchors() ?? null,
    [],
  );

  const getSector2Anchors = useCallback(
    () => universeRef.current?.getSector2ScreenAnchors() ?? null,
    [],
  );

  const handleForgeDiscipline = useCallback((index: number | null) => {
    spatialStore.setActiveDiscipline(index);
    universeRef.current?.setForgeDiscipline(index);
  }, []);

  const handleAudioToggle = () => {
    startAmbientDrone();
    playClick();
    const next = toggleAudio();
    setMuted(next);
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (event.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const moved = universeRef.current?.step(event.key === 'ArrowRight' ? 1 : -1);
        if (moved) playClick();
        return;
      }
      const digit = Number(event.key);
      if (digit >= 1 && digit <= SECTORS.length) handleNavigate(digit - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleNavigate]);

  const activeSector = warpTarget ?? sector;
  const warping = warpTarget !== null;
  const sectorReadout = String(activeSector + 1).padStart(3, '0');

  return (
    <div
      className="relative h-dvh w-full select-none overflow-hidden bg-[#030407] text-[#ECE8E1] cursor-none"
      onPointerDown={() => startAmbientDrone()}
    >
      <CosmicBootLoader />
      <CosmicCursor />
      {contextLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 font-mono text-xs tracking-widest text-[#E2A64C] select-none pointer-events-none">
          <div className="flex items-center gap-3 border border-[#E2A64C]/30 bg-[#06080D]/95 px-6 py-4 rounded shadow-2xl">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#E2A64C] animate-ping" />
            RECALIBRATING GPU SPATIAL CONTEXT...
          </div>
        </div>
      )}
      <div ref={containerRef} className="absolute inset-0 touch-none cursor-none" />
      <div className="pointer-events-none absolute inset-0 z-[5] cinematic-vignette" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 z-10">
        {/* UNIFIED PERSISTENT HOMEPAGE NAVBAR ACROSS ALL SECTORS (No star logo, zero jump) */}
        <header className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-5 pt-5 md:px-9 md:pt-6 select-none">
          {/* Top-Left Clean Brand Wordmark */}
          <div
            onClick={() => handleNavigate(0)}
            className="pointer-events-auto flex items-start gap-4 group cursor-pointer"
            data-purpose="brand-logo"
          >
            <div className="leading-none">
              <span className="font-geometric text-[17px] md:text-[20px] tracking-[0.06em] font-normal uppercase text-[#F2EFE9] transition group-hover:text-white block">
                ALDEBARAN
              </span>
              <span className="font-geometric text-[9px] md:text-[10px] tracking-[0.15em] text-[#BDB9B0] uppercase block mt-1">
                SPATIAL STUDIO
              </span>
            </div>
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-[0.25em] text-white/25 mt-1">
              ····
            </span>
          </div>

          {/* Top-Center Persistent Scroll Telemetry Indicator */}
          <div className="pointer-events-none hidden md:flex items-center gap-5 font-mono text-[10px] tracking-[0.22em] text-[#D8D4CC] pt-1">
            <span className="text-white/35">--</span>
            <span>
              SCROLL <span className="text-white/50">//</span> {sectorReadout}{' '}
              <span className="text-white/50">//</span> ----
            </span>
            <span className="text-white/35">--</span>
          </div>

          {/* Top-Right Persistent Controls */}
          <div className="pointer-events-auto flex items-center gap-3.5">
            <button
              onClick={handleAudioToggle}
              aria-label={muted ? 'Unmute ambience' : 'Mute ambience'}
              title={muted ? 'Ambience Off' : 'Ambience On'}
              type="button"
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition cursor-pointer ${
                muted
                  ? 'border-white/15 bg-white/[0.03] text-white/40 hover:text-white/80'
                  : 'border-white/25 bg-white/[0.07] text-[#ECE8E1] hover:border-amber-300/60'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                playClick();
                setMenuOpen((prev) => !prev);
              }}
              aria-label="Open sector navigation"
              type="button"
              className="w-7 h-7 flex flex-col justify-center items-center gap-[4.5px] group cursor-pointer"
            >
              {menuOpen ? (
                <X className="w-4 h-4 text-[#ECE8E1]" />
              ) : (
                <>
                  <span className="w-4 h-[1.5px] bg-[#ECE8E1] transition group-hover:bg-amber-300" />
                  <span className="w-4 h-[1.5px] bg-[#ECE8E1] transition group-hover:bg-amber-300" />
                  <span className="w-4 h-[1.5px] bg-[#ECE8E1] transition group-hover:bg-amber-300" />
                </>
              )}
            </button>
          </div>
        </header>

        {/* Sleek Top-Right Sector Quick-Jump Drawer */}
        {menuOpen && (
          <nav
            aria-label="Sector Directory"
            className="pointer-events-auto fixed top-16 right-5 md:right-9 z-50 w-64 rounded-xl border border-white/20 bg-[#060912]/90 backdrop-blur-2xl p-3 shadow-2xl"
          >
            <div className="px-2.5 py-1.5 font-mono text-[9px] tracking-[0.22em] text-white/45 uppercase border-b border-white/10 mb-1.5">
              SPATIAL SECTORS
            </div>
            {SECTORS.map((item, idx) => {
              const active = idx === activeSector;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleNavigate(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-mono text-[11px] tracking-[0.14em] uppercase transition cursor-pointer ${
                    active
                      ? 'bg-white/[0.12] text-amber-200 border border-amber-300/30'
                      : 'text-[#ECE8E1]/80 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span>
                    <span className="text-white/45 mr-2">{item.code} //</span>
                    {item.name}
                  </span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
                </button>
              );
            })}
          </nav>
        )}

        {!warping && (
          <div key={sector} className="pointer-events-none absolute inset-0">
            {sector === 0 && <HorizonPanel onEngage={() => handleNavigate(1)} />}
            {sector === 1 && (
              <ArtifactsPanel
                selectedIndex={selectedProject}
                onSelect={selectProject}
                getAnchors={getSector1Anchors}
              />
            )}
            {sector === 2 && (
              <SystemsPanel
                getAnchors={getSector2Anchors}
                onDisciplineChange={handleForgeDiscipline}
              />
            )}
            {sector === 3 && <TransmissionPanel onBroadcast={broadcast} />}
          </div>
        )}

        {(activeSector === 2 || isMobile) && (
          <SectorNav activeIndex={activeSector} warping={warping} onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
}
