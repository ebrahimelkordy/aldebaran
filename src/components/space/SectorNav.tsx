import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { SECTORS } from '@/space/constants';

interface SectorNavProps {
  activeIndex: number;
  warping: boolean;
  onNavigate: (index: number) => void;
}

export default function SectorNav({ activeIndex, warping, onNavigate }: SectorNavProps) {
  const [coords, setCoords] = useState<[number, number]>([682, 676]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      setCoords([Math.round(e.clientX), Math.round(e.clientY)]);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const prevIndex = activeIndex > 0 ? activeIndex - 1 : SECTORS.length - 1;
  const nextIndex = (activeIndex + 1) % SECTORS.length;

  return (
    <div className="pointer-events-auto absolute bottom-2.5 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1.5">
      <div className="flex items-center gap-3 rounded-full border border-white/20 bg-[#070910]/65 px-2.5 py-1.5 backdrop-blur-xl shadow-2xl">
        {/* Left Radar / Crosshair Previous Button (Matches ref_sector_02.jpeg) */}
        <button
          type="button"
          aria-label="Previous sector"
          disabled={warping}
          onClick={() => onNavigate(prevIndex)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/[0.06] text-[#ECE8E1] transition hover:border-white/75 hover:bg-white/[0.14] disabled:opacity-40 cursor-pointer"
        >
          <svg viewBox="0 0 36 36" className="h-8 w-8">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(236,232,225,0.45)" strokeWidth="0.9" />
            <circle cx="18" cy="18" r="8" fill="none" stroke="rgba(236,232,225,0.35)" strokeWidth="0.8" />
            <g transform="rotate(45 18 18)">
              <line x1="18" y1="3" x2="18" y2="9" stroke="rgba(236,232,225,0.5)" strokeWidth="0.8" />
              <line x1="18" y1="27" x2="18" y2="33" stroke="rgba(236,232,225,0.5)" strokeWidth="0.8" />
              <line x1="3" y1="18" x2="9" y2="18" stroke="rgba(236,232,225,0.5)" strokeWidth="0.8" />
              <line x1="27" y1="18" x2="33" y2="18" stroke="rgba(236,232,225,0.5)" strokeWidth="0.8" />
            </g>
            <circle cx="18" cy="18" r="2" fill="#FFFFFF" />
          </svg>
        </button>

        {/* 4 Sector Indicators */}
        <div className="flex items-center gap-3 px-2">
          {SECTORS.map((sector, index) => (
            <button
              key={sector.code}
              type="button"
              aria-label={`Warp to ${sector.name}`}
              onClick={() => onNavigate(index)}
              className="flex h-8 items-center justify-center px-1 cursor-pointer group"
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === activeIndex
                    ? 'w-7 bg-[#FFFFFF] shadow-[0_0_8px_rgba(255,255,255,0.75)]'
                    : 'w-1.5 bg-[#ECE8E1]/45 group-hover:bg-[#ECE8E1]/85'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Right Next Sector Chevron Circle */}
        <button
          type="button"
          aria-label="Next sector"
          disabled={warping}
          onClick={() => onNavigate(nextIndex)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/[0.03] text-[#ECE8E1] transition hover:border-white/60 hover:bg-white/[0.12] disabled:opacity-40 cursor-pointer mr-0.5"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Live Pointer Coordinates Readout beneath Pill */}
      <div className="font-mono text-[9.5px] tracking-[0.1em] text-[#ECE8E1]/90">
        [{coords[0]}, {coords[1]}]
      </div>
    </div>
  );
}
