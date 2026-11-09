import { LiveReadout } from '@/components/primitives/LiveReadout';

interface HighComputePodProps {
  onHover?: (active: boolean) => void;
}

export function HighComputePod({ onHover }: HighComputePodProps) {
  return (
    <div
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className="pointer-events-auto absolute top-[9.8%] right-[11.0%] hidden lg:block w-[252px] forge-card p-3 z-20"
      style={{ '--glow-x': '0%', '--glow-y': '100%', '--rim-angle': '215deg' } as React.CSSProperties}
    >
      {/* Top specular edge highlight + left telemetry bar */}
      <span
        className="pointer-events-none absolute top-0 left-5 right-8 h-[1px] bg-gradient-to-r from-amber-200/55 via-white/35 to-transparent"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -left-[1.5px] bottom-6 h-8 w-[2.5px] rounded-full bg-amber-200/75 shadow-[0_0_12px_rgba(234,192,120,0.7)]"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between mb-1.5">
        <div>
          <div className="font-mono text-[7.5px] tracking-[0.2em] text-amber-200/80 uppercase">
            01 // CORE PIPELINE
          </div>
          <h3 className="font-serif text-[17.5px] text-[#FAF8F4] leading-tight mt-0.5">
            High-Compute Engines
          </h3>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.85)] animate-pulse-soft" />
      </div>

      {/* Recessed Dark Observatory Orrery & Harmonic Wave Chamber */}
      <div className="forge-well p-2">
        <svg viewBox="0 0 210 56" className="w-full h-[44px] overflow-visible">
          <defs>
            <radialGradient id="hcSolarCorona" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#FBE5B6" />
              <stop offset="70%" stopColor="rgba(234,178,96,0.32)" />
              <stop offset="100%" stopColor="rgba(234,178,96,0)" />
            </radialGradient>
            <path id="hcOrbOuter" d="M 10,28 a 95,17 0 1,0 190,0 a 95,17 0 1,0 -190,0" />
            <path id="hcOrbMid" d="M 35,28 a 70,12 0 1,1 140,0 a 70,12 0 1,1 -140,0" />
            <path id="hcOrbInner" d="M 62,28 a 43,7.2 0 1,0 86,0 a 43,7.2 0 1,0 -86,0" />
          </defs>

          <use href="#hcOrbOuter" fill="none" stroke="rgba(236,232,225,0.18)" strokeWidth="0.75" />
          <use
            href="#hcOrbMid"
            fill="none"
            stroke="rgba(251,242,213,0.28)"
            strokeWidth="0.75"
            strokeDasharray="3 3"
          />
          <use href="#hcOrbInner" fill="none" stroke="rgba(251,242,213,0.42)" strokeWidth="0.85" />

          <circle cx="105" cy="28" r="15" fill="url(#hcSolarCorona)" />
          <circle cx="105" cy="28" r="6" fill="#FFFDF8" />

          <circle r="2.3" fill="#FFFFFF">
            <animateMotion dur="13s" repeatCount="indefinite">
              <mpath href="#hcOrbOuter" />
            </animateMotion>
          </circle>
          <circle r="2" fill="#F4D38A">
            <animateMotion dur="8.8s" repeatCount="indefinite">
              <mpath href="#hcOrbMid" />
            </animateMotion>
          </circle>
          <circle r="1.6" fill="#FFFFFF">
            <animateMotion dur="5.8s" repeatCount="indefinite">
              <mpath href="#hcOrbInner" />
            </animateMotion>
          </circle>
        </svg>

        {/* Harmonic Standing-Wave Interference Envelope */}
        <svg viewBox="0 0 210 30" className="w-full h-6 mt-1 pt-1 border-t border-white/[0.06] overflow-visible">
          <defs>
            <linearGradient id="waveGradGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(234,192,120,0.08)" />
              <stop offset="32%" stopColor="rgba(251,242,213,0.75)" />
              <stop offset="68%" stopColor="rgba(234,192,120,0.85)" />
              <stop offset="100%" stopColor="rgba(234,192,120,0.08)" />
            </linearGradient>
          </defs>
          {[-3, -1, 1, 3].map((amp, idx) => (
            <path
              key={idx}
              d={`M 0 16 C 35 ${16 - amp * 3.2}, 70 ${16 + amp * 3.2}, 105 16 C 140 ${16 - amp * 3.2}, 175 ${16 + amp * 3.2}, 210 16`}
              fill="none"
              stroke="url(#waveGradGold)"
              strokeWidth={Math.abs(amp) === 1 ? '0.95' : '0.6'}
              opacity={Math.abs(amp) === 1 ? 0.9 : 0.42}
            />
          ))}
          <path
            d="M 0 16 C 35 6, 70 26, 105 16 C 140 6, 175 26, 210 16"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeDasharray="16 52"
            className="animate-stream-dash"
            style={{ animationDuration: '3.8s' }}
          />
          <circle cx="52" cy="16" r="2" fill="#FFFDF7" className="animate-pulse-soft" />
          <circle cx="105" cy="16" r="2.3" fill="#EAC078" />
          <circle cx="158" cy="16" r="2" fill="#FFFDF7" className="animate-pulse-soft" />
        </svg>
      </div>

      {/* Crisp 3-Column Engineering Benchmark Footer */}
      <div className="grid grid-cols-3 gap-2 mt-2 px-0.5 font-mono">
        <div>
          <div className="text-[7px] tracking-[0.14em] text-white/45 uppercase">RENDER</div>
          <div className="text-[10px] tracking-[0.04em] text-[#FAF8F4] mt-0.5">60.0 FPS</div>
        </div>
        <div>
          <div className="text-[7px] tracking-[0.14em] text-white/45 uppercase">LATENCY</div>
          <div className="text-[10px] tracking-[0.04em] text-amber-200 mt-0.5">
            <LiveReadout
              initial="14.2"
              getValue={(t) => (14.2 + Math.cos(t * 0.85) * 0.4).toFixed(1)}
            />{' '}
            ms
          </div>
        </div>
        <div className="text-right">
          <div className="text-[7px] tracking-[0.14em] text-white/45 uppercase">EVENTS</div>
          <div className="text-[10px] tracking-[0.04em] text-[#FAF8F4] mt-0.5">2.4M/m</div>
        </div>
      </div>
    </div>
  );
}

