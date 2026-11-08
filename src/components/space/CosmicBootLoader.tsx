import { useEffect, useState } from 'react';

interface CosmicBootLoaderProps {
  onComplete?: () => void;
}

const TELEMETRY_LOGS = [
  'INITIALIZING QUANTUM GRAVITY CORE',
  'COMPILING 26,000 STELLAR BODIES [ALDEBARAN α-TAU]',
  'ALIGNING RELATIVISTIC ACCRETION DISCS',
  'SYNCHRONIZING KEPLER ORBITAL SYSTEMS',
  'SPATIAL CONTINUUM STABILIZED',
];

export default function CosmicBootLoader({ onComplete }: CosmicBootLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [ignited, setIgnited] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1800; // 1.8 seconds cinematic calibration

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease out quad for rapid initial progress then smooth arrival
      const current = Math.floor(t * (2 - t) * 100);
      setProgress(current);

      const logIdx = Math.min(Math.floor(t * TELEMETRY_LOGS.length), TELEMETRY_LOGS.length - 1);
      setLogIndex(logIdx);

      if (t >= 1) {
        clearInterval(interval);
        // Trigger Big Bang shockwave
        setIgnited(true);
        setTimeout(() => {
          onComplete?.();
          setTimeout(() => {
            setUnmounted(true);
          }, 800);
        }, 650);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (unmounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#030407] transition-opacity duration-700 select-none ${
        ignited ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Fine Star Dust Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,242,213,0.06)_0%,transparent_70%)]" />

      {/* Big Bang Expansion Shockwave */}
      {ignited && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-[#FBF2D5] animate-ping opacity-90 scale-[40] duration-700 ease-out" />
          <div className="absolute h-8 w-8 rounded-full border border-[#FBF2D5] animate-ping scale-[80] opacity-60 duration-1000 ease-out" />
        </div>
      )}

      {/* Central Quantum Singularity Chamber */}
      <div className="relative flex flex-col items-center">
        {/* Rotating Outer Reticle Rings */}
        <div className="relative flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#FBF2D5]/20 animate-spin [animation-duration:18s]" />
          <div className="absolute inset-3 rounded-full border border-dashed border-[#FBF2D5]/30 animate-spin [animation-duration:12s] [animation-direction:reverse]" />
          <div className="absolute inset-8 rounded-full border border-[#ECE8E1]/15 animate-ping [animation-duration:3s]" />

          {/* Golden Primordial Seed */}
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute h-full w-full rounded-full bg-[#FBF2D5] animate-ping opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-[#FBF2D5] shadow-[0_0_15px_#FBF2D5,0_0_35px_rgba(251,242,213,0.8)]" />
          </div>

          {/* Crosshair Ticks */}
          <div className="absolute -left-3 h-[1px] w-3 bg-[#FBF2D5]/40" />
          <div className="absolute -right-3 h-[1px] w-3 bg-[#FBF2D5]/40" />
          <div className="absolute -top-3 h-3 w-[1px] bg-[#FBF2D5]/40" />
          <div className="absolute -bottom-3 h-3 w-[1px] bg-[#FBF2D5]/40" />
        </div>

        {/* Telemetry Block */}
        <div className="mt-8 flex flex-col items-center text-center">
          <p className="font-mono-ui text-[9px] uppercase tracking-[0.35em] text-[#FBF2D5]/70">
            // STELLAR IGNITION SEQUENCE
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-light tracking-wider text-[#ECE8E1]">
              {progress.toString().padStart(3, '0')}
            </span>
            <span className="font-mono-ui text-xs text-[#FBF2D5]/60">%</span>
          </div>

          {/* Dynamic Calibration Status Line */}
          <p className="font-mono-ui mt-3 text-[10px] tracking-[0.2em] text-[#ECE8E1]/60 max-w-sm h-4 transition-all duration-200">
            {TELEMETRY_LOGS[logIndex]}
          </p>

          {/* Architectural Spec Badges */}
          <div className="mt-6 flex items-center gap-4 border-t border-[#ECE8E1]/10 pt-4">
            <span className="font-mono-ui text-[9px] uppercase tracking-widest text-[#FBF2D5]/80">
              RA 04h 35m 55s
            </span>
            <span className="h-1 w-1 rounded-full bg-[#FBF2D5]/40" />
            <span className="font-mono-ui text-[9px] uppercase tracking-widest text-[#FBF2D5]/80">
              DEC +16° 30′ 33″
            </span>
            <span className="h-1 w-1 rounded-full bg-[#FBF2D5]/40" />
            <span className="font-mono-ui text-[9px] uppercase tracking-widest text-[#FBF2D5]/80">
              439 L☉
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
