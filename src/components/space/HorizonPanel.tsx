import { LiveReadout } from '@/components/primitives/LiveReadout';

interface HorizonPanelProps {
  onEngage: () => void;
}

export default function HorizonPanel({ onEngage }: HorizonPanelProps) {
  return (
    <section
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-20"
      data-purpose="hero-section"
      id="hero"
    >
      {/* Subtle Center Astrolabe Reticle framing the Sun */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[62vh] h-[62vh] opacity-45 hidden sm:block"
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
          <circle
            cx="200"
            cy="200"
            r="172"
            fill="none"
            stroke="rgba(236,232,225,0.14)"
            strokeWidth="0.6"
            strokeDasharray="1.5 5"
          />
          <path
            d="M 78 78 A 172 172 0 0 1 180 29"
            fill="none"
            stroke="rgba(236,232,225,0.22)"
            strokeWidth="0.75"
          />
          <path
            d="M 358 135 A 172 172 0 0 1 352 275"
            fill="none"
            stroke="rgba(236,232,225,0.2)"
            strokeWidth="0.75"
          />
          {/* Cardinal micro-chevrons around center */}
          <g transform="translate(200, 48)">
            <circle r="9" fill="rgba(5,8,15,0.45)" stroke="rgba(236,232,225,0.22)" strokeWidth="0.7" />
            <path d="M-2.5 1 L0 -2 L2.5 1" fill="none" stroke="rgba(236,232,225,0.65)" strokeWidth="1" />
          </g>
          <g transform="translate(200, 352)">
            <circle r="9" fill="rgba(5,8,15,0.45)" stroke="rgba(236,232,225,0.22)" strokeWidth="0.7" />
            <path d="M-2.5 -1.5 L0 1.5 L2.5 -1.5 M-2.5 1.5 L0 4.5 L2.5 1.5" fill="none" stroke="rgba(236,232,225,0.65)" strokeWidth="0.9" />
          </g>
          <g transform="translate(36, 200)">
            <circle r="7.5" fill="rgba(5,8,15,0.45)" stroke="rgba(236,232,225,0.2)" strokeWidth="0.7" />
            <path d="M1.5 -2.5 L-1.5 0 L1.5 2.5" fill="none" stroke="rgba(236,232,225,0.6)" strokeWidth="0.9" />
          </g>
          <g transform="translate(364, 200)">
            <circle r="7.5" fill="rgba(5,8,15,0.45)" stroke="rgba(236,232,225,0.2)" strokeWidth="0.7" />
            <path d="M-1.5 -2.5 L1.5 0 L-1.5 2.5" fill="none" stroke="rgba(236,232,225,0.6)" strokeWidth="0.9" />
          </g>
        </svg>
      </div>

      {/* Single Steeply Tilted (-69deg) Bold Geometric ALDEBARAN + SPATIAL STUDIO */}
      <div
        className="pointer-events-none absolute left-[13.8%] bottom-[4.5%] origin-bottom-left z-10 hidden sm:block"
        style={{ transform: 'rotate(-69deg)' }}
      >
        <div className="flex flex-col items-start">
          <h1
            className="font-geometric font-bold uppercase leading-[0.82] tracking-[-0.025em] whitespace-nowrap bg-clip-text text-transparent select-none"
            style={{
              fontSize: 'clamp(4.2rem, 13.8vh, 9.5rem)',
              backgroundImage:
                'linear-gradient(90deg, #ECE8E0 0%, #ECE8E0 50%, #7B7D82 67%, #ECE8E0 83%, #ECE8E0 100%)',
            }}
          >
            ALDEBARAN
          </h1>
          <span
            className="font-geometric font-normal uppercase text-[#E2DED6] tracking-[0.38em] mt-[1.1vh] pl-[0.4vh] whitespace-nowrap"
            style={{ fontSize: 'clamp(0.75rem, 2.25vh, 1.45rem)' }}
          >
            SPATIAL STUDIO
          </span>
        </div>
      </div>

      {/* Mobile fallback title */}
      <div className="pointer-events-none absolute top-20 left-5 sm:hidden z-10">
        <h1 className="font-geometric font-bold text-5xl tracking-[-0.02em] text-[#ECE8E0] uppercase leading-none">
          ALDEBARAN
        </h1>
        <p className="font-geometric text-xs tracking-[0.36em] text-[#E2DED6] uppercase mt-1.5">
          SPATIAL STUDIO
        </p>
      </div>

      {/* LEFT TELEMETRY HUD STACK */}
      {/* 1. Upper Circular Radar Dial (Animated Rotating Golden & Outer Arcs) */}
      <div
        className="pointer-events-none absolute top-[16.5%] left-[11.2%] hidden md:flex items-center justify-center w-[12vh] h-[12vh] min-w-[84px] min-h-[84px]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="47" fill="rgba(6,8,14,0.45)" stroke="rgba(236,232,225,0.12)" strokeWidth="0.8" />
          <g className="svg-origin-center animate-orbit-ccw">
            <path d="M 50 3 A 47 47 0 0 1 97 50" fill="none" stroke="rgba(236,232,225,0.42)" strokeWidth="1.1" />
            <path d="M 50 97 A 47 47 0 0 1 12 77" fill="none" stroke="rgba(229,186,115,0.35)" strokeWidth="0.9" />
          </g>
          <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(236,232,225,0.18)" strokeWidth="0.8" strokeDasharray="2 3" />
          <g className="svg-origin-center animate-orbit-fast">
            <path
              d="M 56 22 A 28 28 0 0 1 78 58"
              fill="none"
              stroke="#E5BA73"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <circle cx="77" cy="58" r="1.6" fill="#FFF2CE" />
          </g>
          <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(236,232,225,0.18)" strokeWidth="0.8" />
          <line x1="20" y1="50" x2="32" y2="50" stroke="rgba(236,232,225,0.3)" strokeWidth="0.8" />
          <line x1="80" y1="50" x2="95" y2="50" stroke="rgba(236,232,225,0.3)" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="1.8" fill="#E5BA73" className="animate-pulse-soft" />
        </svg>
      </div>

      {/* 2. Spatial Axes Ring Gauge + Velocity Pill + SYS/LOC Box */}
      <div className="pointer-events-none absolute top-[28.5%] left-[5.4%] hidden md:flex flex-col items-start z-20">
        {/* Circular X/Y/Z Readout */}
        <div className="relative w-[13.6vh] h-[13.6vh] min-w-[98px] min-h-[98px] flex items-center justify-center ml-1">
          <svg viewBox="0 0 110 110" className="absolute inset-0 w-full h-full">
            <circle cx="55" cy="55" r="50" fill="rgba(6,9,15,0.55)" stroke="rgba(236,232,225,0.12)" strokeWidth="0.9" />
            {/* Left & Right luminous arcs matching reference */}
            <path
              d="M 22 18 A 50 50 0 0 0 22 92"
              fill="none"
              stroke="#EDE4D3"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 88 18 A 50 50 0 0 1 88 92"
              fill="none"
              stroke="#EDE4D3"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="55" cy="55" r="43" fill="none" stroke="rgba(236,232,225,0.1)" strokeWidth="0.6" />
          </svg>
          <div className="relative z-10 font-mono text-[9.5px] leading-[1.45] tracking-[0.04em] text-[#EAE6DE] text-left">
            <div>
              X:{' '}
              <LiveReadout
                initial="+45.13"
                intervalMs={500}
                getValue={(t) => `+${(45.13 + Math.sin(t) * 0.04).toFixed(2)}`}
              />
              °
            </div>
            <div>
              Y:{' '}
              <LiveReadout
                initial="-18.20"
                intervalMs={500}
                getValue={(t) => (-18.2 + Math.cos(t * 1.15) * 0.04).toFixed(2)}
              />
              °
            </div>
            <div>
              Z:{' '}
              <LiveReadout
                initial="+8.70"
                intervalMs={500}
                getValue={(t) => `+${(8.7 + Math.sin(t * 0.85) * 0.03).toFixed(2)}`}
              />
              °
            </div>
          </div>
        </div>

        {/* VEL Pill */}
        <div className="mt-2.5 ml-1 rounded-full border border-white/15 bg-[#070a12]/75 backdrop-blur-md px-3.5 py-1 font-mono text-[9.5px] tracking-[0.08em] text-[#EAE6DE]">
          VEL:{' '}
          <LiveReadout
            initial="14.5"
            intervalMs={500}
            getValue={(t) => (14.5 + Math.sin(t * 1.6) * 0.1).toFixed(1)}
          />{' '}
          KM/S
        </div>

        {/* SYS / LOC Rounded Frame */}
        <div className="mt-2.5 w-[156px] rounded-2xl border border-white/10 bg-[#060810]/55 backdrop-blur-sm px-3.5 py-3 font-mono text-[9.5px] tracking-[0.06em] text-[#DCD8D0]">
          <div className="py-1">
            SYS: <span className="text-[#F2EFE9]">ACTIVE</span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/[0.08] text-[#D4D0C8]">
            LOC: 045.19 / -89.11
          </div>
        </div>
      </div>

      {/* 3. Bottom-Left EXPLORE Golden Orb Button (z-30 in front of bottom-left corner of A) */}
      <div className="pointer-events-auto absolute bottom-[3.8%] left-[4.8%] z-30 flex items-center justify-center">
        <button
          type="button"
          onClick={onEngage}
          aria-label="Explore Sector 01 Projects"
          className="group relative w-[18.5vh] h-[18.5vh] min-w-[132px] min-h-[132px] flex items-center justify-center rounded-full cursor-pointer focus:outline-none"
        >
          {/* Outer subtle ring + curved VIEW PROJECT // 01 text */}
          <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full">
            <circle
              cx="80"
              cy="80"
              r="74"
              fill="rgba(8,10,15,0.38)"
              stroke="rgba(236,232,225,0.14)"
              strokeWidth="0.9"
            />
            <defs>
              <path id="exploreBottomArc" d="M 24,88 A 58,58 0 0,0 136,88" />
            </defs>
            <text
              fill="rgba(226,222,214,0.78)"
              fontSize="7.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="1.6"
            >
              <textPath href="#exploreBottomArc" startOffset="50%" textAnchor="middle">
                VIEW PROJECT // 01
              </textPath>
            </text>
          </svg>

          {/* Inner Golden-Lit Orb */}
          <div
            className="relative w-[12.4vh] h-[12.4vh] min-w-[88px] min-h-[88px] rounded-full border border-[#E8C984]/65 flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-[0_0_30px_rgba(232,201,132,0.18)]"
            style={{
              background:
                'radial-gradient(circle at 50% 16%, rgba(248,220,152,0.42) 0%, rgba(76,62,38,0.48) 38%, rgba(12,13,18,0.94) 78%)',
            }}
          >
            {/* Swirl / Spiral Emblem */}
            <svg
              viewBox="0 0 32 32"
              className="w-6 h-6 text-[#F5E3B8] mb-1.5 transition-transform duration-700 group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="16" cy="16" r="10.5" strokeOpacity="0.45" />
              <path d="M16 7.5c4.5 0 8 3.5 8 8 0 3.2-2.2 5.5-5 5.5-2.2 0-3.8-1.5-3.8-3.4 0-1.5 1.2-2.6 2.6-2.6" strokeLinecap="round" />
              <path d="M16 24.5c-4.5 0-8-3.5-8-8 0-3.2 2.2-5.5 5-5.5 2.2 0 3.8 1.5 3.8 3.4" strokeLinecap="round" strokeOpacity="0.75" />
            </svg>
            <span className="font-geometric font-semibold text-[9.5px] tracking-[0.14em] text-[#F4F0E6] uppercase">
              EXPLORE
            </span>
          </div>
        </button>
      </div>

      {/* RIGHT TELEMETRY: Circular PROJECT SPECTRUM Ring + COORDINATES */}
      <div className="pointer-events-auto absolute top-[15.5%] right-[6.8%] hidden lg:flex flex-col items-center z-20">
        <div className="relative w-[27vh] h-[27vh] min-w-[196px] min-h-[196px] flex items-center justify-center">
          <svg viewBox="0 0 220 220" className="absolute inset-0 w-full h-full">
            {/* Outer subtle dashed boundary */}
            <g className="svg-origin-center animate-spin-slow">
              <circle
                cx="110"
                cy="110"
                r="104"
                fill="none"
                stroke="rgba(236,232,225,0.14)"
                strokeWidth="0.8"
                strokeDasharray="2 3"
              />
            </g>
            {/* Secondary ring */}
            <circle
              cx="110"
              cy="110"
              r="90"
              fill="rgba(6,9,16,0.42)"
              stroke="rgba(236,232,225,0.18)"
              strokeWidth="0.9"
            />
            {/* Inner ring */}
            <circle
              cx="110"
              cy="110"
              r="78"
              fill="none"
              stroke="rgba(236,232,225,0.14)"
              strokeWidth="0.8"
            />
            {/* Inner Golden Arc — Animated Clockwise */}
            <g className="svg-origin-center animate-orbit-cw">
              <path
                d="M 118 20 A 90 90 0 0 1 199 102"
                fill="none"
                stroke="#F3D48B"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <circle cx="110" cy="200" r="2.2" fill="#F3D48B" />
            </g>
            {/* Outer Golden Arc — Animated Counter-Clockwise */}
            <g className="svg-origin-center animate-orbit-ccw">
              <path
                d="M 132 13 A 99 99 0 0 1 208 106"
                fill="none"
                stroke="#E5B968"
                strokeWidth="1.5"
                strokeOpacity="0.88"
                strokeLinecap="round"
              />
              <path
                d="M 88 207 A 99 99 0 0 1 22 152"
                fill="none"
                stroke="#E5B968"
                strokeWidth="1.1"
                strokeOpacity="0.45"
                strokeLinecap="round"
              />
            </g>
          </svg>

          {/* Center Spectrum Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            <div className="font-geometric font-normal text-[11.5px] leading-[1.18] tracking-[0.08em] text-[#EFECE4] uppercase">
              PROJECT
              <br />
              SPECTRUM
            </div>

            {/* Golden Foil / Dust Swatch */}
            <div
              className="my-2.5 w-[74px] h-[40px] border border-[#E8C984]/35 shadow-inner"
              style={{
                background:
                  'radial-gradient(circle at 28% 24%, #FFF6D1 0%, #DFB15B 38%, #6D4919 78%, #1C1308 100%)',
              }}
            />

            <div className="font-mono text-[8px] leading-[1.38] tracking-[0.1em] text-[#D8D4CC] uppercase">
              INNOVATION // 07
              <br />
              <span className="text-[#BDB8AE]">// 2034</span>
            </div>
          </div>
        </div>

        {/* COORDINATES Block directly beneath ring */}
        <div className="mt-5 self-end mr-4 font-mono text-[9.5px] leading-[1.48] tracking-[0.08em] text-[#DCD8D0] text-left">
          <div className="text-[#C8C4BC]">COORDINATES</div>
          <div>42° 58&apos; N</div>
          <div>76° 52&apos; W</div>
        </div>
      </div>

      {/* BOTTOM-RIGHT CENTERED 4-LINE HERO STATEMENT */}
      <div className="pointer-events-none absolute bottom-[4.2%] right-[3.6%] z-20 text-center">
        <h2
          className="font-geometric font-bold uppercase leading-[0.91] tracking-[-0.028em]"
          style={{ fontSize: 'clamp(2.1rem, 5.1vw, 4.75rem)' }}
        >
          <span className="block text-[#EBE7DF]">EXPLORE</span>
          <span className="block text-[#EBE7DF]">THE COSMOS</span>
          <span className="block text-[#7A7C80]">REDEFINING</span>
          <span className="block text-[#7A7C80]">SPATIAL REALITY</span>
        </h2>
      </div>

      {/* BOTTOM-CENTER VERTICAL SCROLL INDICATOR */}
      <div className="pointer-events-none absolute bottom-[2.8%] left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center z-20">
        <div className="w-[1px] h-9 bg-gradient-to-b from-transparent via-white/35 to-white/80 mb-2.5" />
        <div className="font-mono text-[9.5px] tracking-[0.2em] text-[#D2CEC6] uppercase whitespace-nowrap">
          SCROLL <span className="text-white/45">//</span> 001 <span className="text-white/45">//</span> ---
        </div>
      </div>
    </section>
  );
}
