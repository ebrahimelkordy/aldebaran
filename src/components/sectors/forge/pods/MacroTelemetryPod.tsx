import { LiveReadout } from '@/components/primitives/LiveReadout';

interface MacroTelemetryPodProps {
  onHover?: (active: boolean) => void;
}

export function MacroTelemetryPod({ onHover }: MacroTelemetryPodProps) {
  return (
    <div
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className="pointer-events-auto absolute top-[10.6%] left-[23.6%] hidden lg:block w-[238px] z-20"
    >
      <div className="flex items-center justify-between px-1 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EAC078] shadow-[0_0_8px_rgba(234,192,120,0.9)] animate-pulse-soft" />
          <span className="font-mono text-[8px] tracking-[0.2em] text-[#E6E2DA] uppercase">
            MACRO-TELEMETRY
          </span>
        </div>
        <span className="font-mono text-[7.5px] tracking-[0.14em] text-amber-200/75">GLSL // 60HZ</span>
      </div>

      <div
        className="forge-card p-2.5 flex items-stretch gap-2"
        style={{ '--glow-x': '100%', '--glow-y': '100%', '--rim-angle': '145deg' } as React.CSSProperties}
      >
        <span
          className="pointer-events-none absolute top-0 left-4 right-8 h-[1px] bg-gradient-to-r from-amber-200/50 via-white/30 to-transparent"
          aria-hidden="true"
        />

        {/* Left Recessed Readout Well */}
        <div className="forge-well px-2.5 py-2 font-mono text-[8px] leading-[1.52] tracking-[0.06em] text-[#D0CCC4] shrink-0 flex flex-col justify-between">
          <div>
            <div className="text-[#FAF8F4] font-medium">WEBGL2 CORE</div>
            <div>
              FRAME:{' '}
              <LiveReadout
                initial="16.1"
                getValue={(t) => (16.1 + Math.sin(t * 1.1) * 0.2).toFixed(1)}
              />
              ms
            </div>
            <div>CALLS: 14</div>
          </div>
          <div className="pt-1 mt-1 border-t border-white/[0.08] text-amber-200/90 text-[7.5px]">
            SYNC // LOCK
          </div>
        </div>

        {/* Right Recessed Celestial Radar Well */}
        <div className="forge-well flex-1 px-2 py-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-[7px] tracking-[0.1em] text-white/50">
            <span>ORBIT</span>
            <span className="text-[#ECE8E1]">02.A</span>
          </div>
          <svg viewBox="0 0 108 48" className="w-full h-10 overflow-visible">
            <defs>
              <radialGradient id="macroCoreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFDF7" />
                <stop offset="45%" stopColor="rgba(234,192,120,0.65)" />
                <stop offset="100%" stopColor="rgba(234,192,120,0)" />
              </radialGradient>
              <path id="macroTrack1" d="M 14,24 a 40,11 0 1,0 80,0 a 40,11 0 1,0 -80,0" />
              <path id="macroTrack2" d="M 32,24 a 22,6 0 1,1 44,0 a 22,6 0 1,1 -44,0" />
            </defs>
            <g transform="rotate(-16 54 24)">
              <use href="#macroTrack1" fill="none" stroke="rgba(251,242,213,0.32)" strokeWidth="0.8" />
              <use
                href="#macroTrack2"
                fill="none"
                stroke="rgba(236,232,225,0.2)"
                strokeWidth="0.7"
                strokeDasharray="2 2.5"
              />
              <circle cx="54" cy="24" r="7" fill="url(#macroCoreGlow)" />
              <circle cx="54" cy="24" r="2" fill="#FFFDF7" />
              <circle r="2" fill="#FFFFFF">
                <animateMotion dur="8s" repeatCount="indefinite">
                  <mpath href="#macroTrack1" />
                </animateMotion>
              </circle>
              <circle r="1.5" fill="#EAC078">
                <animateMotion dur="5.2s" repeatCount="indefinite">
                  <mpath href="#macroTrack2" />
                </animateMotion>
              </circle>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

