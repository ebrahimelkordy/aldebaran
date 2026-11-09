import { useEffect, useRef } from 'react';
import { LiveReadout } from '@/components/primitives/LiveReadout';

interface AstrolabeClusterProps {
  onHoverDiscipline?: (index: number | null) => void;
}

const STREAM_FIBERS = [6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66] as const;

export function AstrolabeCluster({ onHoverDiscipline }: AstrolabeClusterProps) {
  const s1BarRef = useRef<HTMLDivElement>(null);
  const s1DotRef = useRef<HTMLSpanElement>(null);
  const s2BarRef = useRef<HTMLDivElement>(null);
  const s2DotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now() * 0.001;
      const s1 = Math.round(64 + Math.sin(t * 0.7) * 14);
      const s2 = Math.round(40 + Math.cos(t * 0.9) * 14);

      if (s1BarRef.current) s1BarRef.current.style.width = `${s1}%`;
      if (s1DotRef.current) s1DotRef.current.style.left = `${s1}%`;
      if (s2BarRef.current) s2BarRef.current.style.width = `${s2}%`;
      if (s2DotRef.current) s2DotRef.current.style.left = `${s2}%`;
    }, 750);

    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      {/* 6A. Left Architectural Pod: 01 / Spatial Computing */}
      <div
        onMouseEnter={() => onHoverDiscipline?.(0)}
        onMouseLeave={() => onHoverDiscipline?.(null)}
        className="pointer-events-auto absolute top-[46.5%] left-[3.4%] hidden lg:block w-[196px] forge-card p-3 z-20"
        style={{ '--glow-x': '100%', '--glow-y': '50%', '--rim-angle': '120deg' } as React.CSSProperties}
      >
        <span
          className="pointer-events-none absolute top-0 left-4 right-6 h-[1px] bg-gradient-to-r from-amber-200/50 via-white/25 to-transparent"
          aria-hidden="true"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] tracking-[0.2em] text-amber-200/85 uppercase">
            01 // ENGINE CORE
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBF2D5]" />
        </div>

        <h3 className="font-serif text-[18.5px] leading-[1.08] text-[#FAF8F4] mt-1.5">
          High-Compute
          <br />
          Engines
        </h3>
        <p className="font-sans font-light text-[11px] leading-[1.46] text-[#D2CEC6] mt-1.5">
          TypeScript, React &amp; Three.js spatial architectures backed by distributed realtime
          telemetry.
        </p>

        {/* Recessed GPU Frame-Budget Gauge */}
        <div className="forge-well mt-2 px-2.5 py-1.5">
          <div className="flex items-center justify-between font-mono text-[7px] tracking-[0.1em] text-white/55 mb-1">
            <span>FRAME BUDGET</span>
            <span className="text-amber-200">
              <LiveReadout
                initial="16.1"
                getValue={(t) => (16.1 + Math.sin(t * 1.1) * 0.2).toFixed(1)}
              />{' '}
              / 16.6ms
            </span>
          </div>
          <div className="w-full h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C89B54] via-[#F5D99B] to-[#FFFDF7] transition-all duration-700"
              style={{ width: '84%' }}
            />
          </div>
        </div>
      </div>

      {/* 6B. Bottom-Left Optical Laser Multiplexer Pod: Data Streams */}
      <div
        onMouseEnter={() => onHoverDiscipline?.(1)}
        onMouseLeave={() => onHoverDiscipline?.(null)}
        className="pointer-events-auto absolute bottom-[8.4%] left-[9.4%] hidden lg:block w-[184px] forge-card p-2.5 z-30"
        style={{ '--glow-x': '100%', '--glow-y': '0%', '--rim-angle': '45deg' } as React.CSSProperties}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <div className="font-serif text-[15.5px] text-[#FAF8F4] leading-none">Data Streams</div>
            <div className="font-mono text-[7px] tracking-[0.16em] text-white/45 uppercase mt-1">
              EVENT MULTIPLEXER
            </div>
          </div>
          <span className="font-mono text-[7px] tracking-[0.1em] text-amber-200/85">LIVE</span>
        </div>

        {/* Recessed Dark Optical Convergence Chamber with Focal Bloom */}
        <div className="forge-well p-1.5">
          <svg viewBox="0 0 164 72" className="w-full h-[58px] overflow-visible">
            <defs>
              <linearGradient id="fiberCool" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(164,132,232,0.12)" />
                <stop offset="52%" stopColor="rgba(196,172,252,0.68)" />
                <stop offset="100%" stopColor="rgba(255,250,238,0.95)" />
              </linearGradient>
              <linearGradient id="fiberWarm" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(234,178,108,0.12)" />
                <stop offset="52%" stopColor="rgba(246,208,148,0.72)" />
                <stop offset="100%" stopColor="rgba(255,250,238,0.95)" />
              </linearGradient>
              <radialGradient id="nexusBloom" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,252,242,0.95)" />
                <stop offset="38%" stopColor="rgba(244,206,138,0.42)" />
                <stop offset="100%" stopColor="rgba(244,206,138,0)" />
              </radialGradient>
            </defs>

            {STREAM_FIBERS.map((y0, idx) => {
              const yEnd = 36 + (idx - 6) * 0.55;
              const d = `M 0 ${y0} C 48 ${y0}, 68 36, 164 ${yEnd}`;
              const isWarm = idx % 2 === 1;
              return (
                <g key={y0}>
                  <path
                    d={d}
                    fill="none"
                    stroke={isWarm ? 'url(#fiberWarm)' : 'url(#fiberCool)'}
                    strokeWidth="0.75"
                  />
                  {idx % 3 === 0 && (
                    <path
                      d={d}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.05"
                      strokeDasharray="10 46"
                      className="animate-stream-dash"
                      style={{ animationDuration: `${2.6 + idx * 0.2}s` }}
                    />
                  )}
                </g>
              );
            })}

            {/* Focal Nexus Glow & Coherent Output Beam */}
            <circle cx="84" cy="36" r="14" fill="url(#nexusBloom)" />
            <line x1="78" y1="36" x2="164" y2="36" stroke="#FFFDF7" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="flex items-center justify-between font-mono text-[7px] tracking-[0.12em] text-[#D8D4CC] uppercase mt-1.5 px-0.5">
          <span>RESEND &bull; EDGE</span>
          <span className="text-amber-200/90">99.99%</span>
        </div>
      </div>

      {/* 6C. Bottom Astrolabe Gimbal Synchronizer Pod */}
      <div
        onMouseEnter={() => onHoverDiscipline?.(2)}
        onMouseLeave={() => onHoverDiscipline?.(null)}
        className="pointer-events-auto absolute bottom-[9.6%] left-[23.8%] hidden lg:flex items-stretch gap-2 w-[228px] forge-card p-2.5 z-20"
        style={{ '--glow-x': '40%', '--glow-y': '0%', '--rim-angle': '15deg' } as React.CSSProperties}
      >
        <span
          className="pointer-events-none absolute top-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-amber-200/50 to-transparent"
          aria-hidden="true"
        />

        <div className="forge-well px-2.5 py-1.5 font-mono text-[8px] leading-[1.52] tracking-[0.06em] text-[#D4D0C8] shrink-0 flex flex-col justify-between">
          <div>
            <div className="text-[7px] tracking-[0.16em] text-amber-200/85 mb-0.5">GIMBAL LOCK</div>
            <div>
              X:{' '}
              <LiveReadout
                initial="+23.4"
                getValue={(t) => `+${(23.4 + Math.sin(t * 0.65) * 1.1).toFixed(1)}`}
              />
              °
            </div>
            <div>
              Y:{' '}
              <LiveReadout
                initial="-14.8"
                getValue={(t) => (-(14.8 + Math.cos(t * 0.8) * 1.2)).toFixed(1)}
              />
              °
            </div>
            <div>
              Z:{' '}
              <LiveReadout
                initial="+08.2"
                getValue={(t) => `+${(8.2 + Math.sin(t * 0.9 + 1.1) * 0.8).toFixed(1)}`}
              />
              °
            </div>
          </div>
          <div className="pt-1 mt-1 border-t border-white/[0.08] text-[#FAF8F4] text-[7px]">
            CNC // TITANIUM
          </div>
        </div>

        <div className="forge-well flex-1 px-2.5 py-1.5 flex flex-col justify-between font-mono text-[7px] text-white/55">
          <div>
            <div className="flex justify-between mb-1">
              <span>PRECESSION</span>
              <span className="text-[#ECE8E1]">360°</span>
            </div>
            <div className="w-full h-[2px] rounded-full bg-white/12 relative">
              <div
                ref={s1BarRef}
                className="h-full rounded-full bg-amber-200/70 transition-all duration-700"
                style={{ width: '68%' }}
              />
              <span
                ref={s1DotRef}
                className="absolute -top-[2.5px] -ml-[3px] w-[7px] h-[7px] rounded-full bg-[#FFFDF7] shadow-[0_0_8px_rgba(251,242,213,0.9)] transition-all duration-700"
                style={{ left: '68%' }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>TORQUE</span>
              <span className="text-[#ECE8E1]">NOMINAL</span>
            </div>
            <div className="w-full h-[2px] rounded-full bg-white/12 relative">
              <div
                ref={s2BarRef}
                className="h-full rounded-full bg-white/55 transition-all duration-700"
                style={{ width: '42%' }}
              />
              <span
                ref={s2DotRef}
                className="absolute -top-[2px] -ml-[2.5px] w-[6px] h-[6px] rounded-full bg-[#ECE8E1] transition-all duration-700"
                style={{ left: '42%' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5 border-t border-white/[0.06]">
            <span className="inline-flex items-center gap-1 text-emerald-300/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse-soft" />
              SYNC
            </span>
            <span className="text-[#ECE8E1]">60.0 HZ</span>
          </div>
        </div>
      </div>
    </>
  );
}

