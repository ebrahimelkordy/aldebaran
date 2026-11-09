import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { PROJECTS } from '@/space/content';
import { useAnchorSubscription } from '@/hooks/useAnchorSubscription';

interface Sector1Anchors {
  ringX: number;
  ringY: number;
  moonX: number;
  moonY: number;
  moonBehindPlanet: boolean;
}

interface ArtifactsPanelProps {
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  getAnchors?: () => Sector1Anchors | null;
}

const SPECTRUM_BARS = [
  { h: 7, dur: '0.95s', delay: '0.0s', red: true },
  { h: 11, dur: '1.25s', delay: '0.15s', red: true },
  { h: 16, dur: '0.85s', delay: '0.32s', red: true },
  { h: 12, dur: '1.4s', delay: '0.08s', red: true },
  { h: 20, dur: '1.05s', delay: '0.24s', red: true },
  { h: 14, dur: '1.3s', delay: '0.41s', red: true },
  { h: 22, dur: '0.9s', delay: '0.18s', red: true },
  { h: 13, dur: '1.15s', delay: '0.36s', red: true },
  { h: 18, dur: '1.0s', delay: '0.12s', red: true },
  { h: 10, dur: '1.35s', delay: '0.28s', red: false },
  { h: 24, dur: '0.88s', delay: '0.05s', red: false },
  { h: 11, dur: '1.2s', delay: '0.22s', red: false },
  { h: 8, dur: '1.45s', delay: '0.38s', red: false },
];

export default function ArtifactsPanel({ selectedIndex, onSelect, getAnchors }: ArtifactsPanelProps) {
  const selected = selectedIndex === null ? null : PROJECTS[selectedIndex];

  // Live DOM refs for 60fps tracking without React re-renders
  const ringPolyRef = useRef<SVGPolylineElement>(null);
  const ringDotRef = useRef<SVGCircleElement>(null);
  const moonPolyRef = useRef<SVGPolylineElement>(null);
  const moonDotRef = useRef<SVGCircleElement>(null);
  const reticleDivRef = useRef<HTMLDivElement>(null);

  const updateOrbitalSvg = (a: Sector1Anchors) => {
    // Fixed right-hand docks aligned with P-00 NOVA PLATFORM (x=54.3%, y=51.5%)
    // and P-01 LYRA CRM (x=61.8%, y=70.6%)
    const rx = Math.max(80, Math.min(510, a.ringX * 1000));
    const ry = Math.max(200, Math.min(760, a.ringY * 1000));
    const rDockX = 542;
    const rDockY = 515;
    const rElbowX = Math.min(rDockX - 28, Math.max(rx + 28, (rx + rDockX) * 0.56));

    if (ringPolyRef.current) {
      ringPolyRef.current.setAttribute('points', `${rx.toFixed(1)},${ry.toFixed(1)} ${rElbowX.toFixed(1)},${rDockY} ${rDockX},${rDockY}`);
    }
    if (ringDotRef.current) {
      ringDotRef.current.setAttribute('cx', rx.toFixed(1));
      ringDotRef.current.setAttribute('cy', ry.toFixed(1));
    }

    const mx = Math.max(30, Math.min(580, a.moonX * 1000));
    const my = Math.max(120, Math.min(890, a.moonY * 1000));
    const mDockX = 618;
    const mDockY = 706;
    const mElbowX = Math.min(mDockX - 28, Math.max(mx + 32, mDockX - Math.abs(mDockY - my) * 0.48));
    const op = a.moonBehindPlanet ? '0.22' : '0.72';

    if (moonPolyRef.current) {
      moonPolyRef.current.setAttribute('points', `${mx.toFixed(1)},${my.toFixed(1)} ${mElbowX.toFixed(1)},${mDockY} ${mDockX},${mDockY}`);
      moonPolyRef.current.setAttribute('stroke-opacity', op);
    }
    if (moonDotRef.current) {
      moonDotRef.current.setAttribute('cx', mx.toFixed(1));
      moonDotRef.current.setAttribute('cy', my.toFixed(1));
      moonDotRef.current.setAttribute('opacity', a.moonBehindPlanet ? '0.25' : '1');
    }
    if (reticleDivRef.current) {
      reticleDivRef.current.style.left = `${(a.moonX * 100).toFixed(2)}%`;
      reticleDivRef.current.style.top = `${(a.moonY * 100).toFixed(2)}%`;
      reticleDivRef.current.style.opacity = a.moonBehindPlanet ? '0.18' : '0.85';
    }
  };

  useAnchorSubscription('orbital', (anchors) => {
    updateOrbitalSvg(anchors as unknown as Sector1Anchors);
  });

  useEffect(() => {
    if (!getAnchors) return;
    let rafId = 0;

    const tick = () => {
      const a = getAnchors();
      if (a) updateOrbitalSvg(a);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [getAnchors]);

  return (
    <section
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-20"
      aria-label="Sector 01 Orbital Systems"
    >
      {/* Top-Left Sector Telemetry Header */}
      <div className="pointer-events-none absolute top-[13.2%] left-[4.4%] flex items-start gap-8 sm:gap-14 z-20">
        <div className="font-mono text-[10.5px] sm:text-[11.5px] leading-[1.35] tracking-[0.14em] text-[#ECE8E1] uppercase">
          <div>01 // ORBITAL</div>
          <div>SYSTEMS</div>
        </div>

        <div className="hidden sm:flex items-start gap-2.5 pt-0.5">
          <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#ECE8E1] shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse-soft" />
          <div className="font-mono text-[9px] sm:text-[10px] leading-[1.38] tracking-[0.14em] text-[#DCD8D0] uppercase">
            <div>8 BODIES &bull; KEPLER</div>
            <div>SYNCHRONIZED</div>
          </div>
        </div>
      </div>

      {/* Curved Orbital Ring Telemetry SVG Overlay */}
      <svg
        viewBox="0 0 1364 768"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 w-full h-full hidden lg:block z-10"
        aria-hidden="true"
      >
        <defs>
          <path id="ringArcInner" d="M 18,432 A 440,210 32 0,0 448,598" />
          <path id="ringArcOuter" d="M 65,535 A 455,235 32 0,0 412,672" />
          <path id="ringArcRight" d="M 555,590 A 280,145 -35 0,0 662,485" />
        </defs>

        <path
          d="M 8,415 A 448,215 32 0,0 645,512"
          fill="none"
          stroke="rgba(236,232,225,0.2)"
          strokeWidth="0.8"
        />
        <path
          d="M 42,508 A 465,240 32 0,0 465,676"
          fill="none"
          stroke="rgba(236,232,225,0.14)"
          strokeWidth="0.7"
        />
        <path
          d="M 215,165 A 360,165 32 0,1 555,295"
          fill="none"
          stroke="rgba(236,232,225,0.14)"
          strokeWidth="0.75"
        />

        <text
          fill="rgba(236,232,225,0.75)"
          fontSize="8.5"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="1.3"
        >
          <textPath href="#ringArcInner" startOffset="8%">
            RING MASS DENSITY: 1.5e19 kg &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; SYNC STATE: NOMINAL
          </textPath>
        </text>

        <text
          fill="rgba(210,206,198,0.62)"
          fontSize="8"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="1.2"
        >
          <textPath href="#ringArcOuter" startOffset="6%">
            ORBITAL INCLINATION: 26.73°
          </textPath>
        </text>

        <text
          fill="rgba(195,190,182,0.52)"
          fontSize="7.5"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="1.2"
        >
          <textPath href="#ringArcRight" startOffset="8%">
            ORBITAL DENSITY: 1.5e19 kg
          </textPath>
        </text>

        <circle cx="144" cy="654" r="2.2" fill="#E05248" />
        <circle cx="144" cy="654" r="6" fill="rgba(224,82,72,0.22)" className="animate-pulse-soft" />
      </svg>

      {/* Live Orbiting Moon Target Reticle (True Circular Aspect + Rotating Scanner Ring) */}
      <div
        ref={reticleDivRef}
        style={{ left: '36.9%', top: '73.5%' }}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-[112px] h-[112px] hidden lg:flex items-center justify-center transition-opacity duration-300 z-10"
        aria-hidden="true"
      >
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <g className="svg-origin-center animate-orbit-cw">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(236,232,225,0.32)"
              strokeWidth="0.9"
              strokeDasharray="2.5 4"
            />
          </g>
          <g className="svg-origin-center animate-orbit-ccw">
            <path
              d="M 60 12 A 48 48 0 0 1 106 48"
              fill="none"
              stroke="rgba(243,212,139,0.55)"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(236,232,225,0.14)" strokeWidth="0.7" />
          </g>
        </svg>
      </div>

      {/* Live 60fps Dynamic Dotted Tracking Lines Connecting Orbiting Bodies to Fixed Titles */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 w-full h-full hidden lg:block z-10"
        aria-hidden="true"
      >
        {/* Leader 1: Ring Beacon -> Fixed P-00 NOVA PLATFORM Dock */}
        <circle ref={ringDotRef} cx="342" cy="515" r="2.6" fill="#ECE8E1" />
        <polyline
          ref={ringPolyRef}
          points="342,515 460,515 542,515"
          fill="none"
          stroke="rgba(236,232,225,0.68)"
          strokeWidth="1.2"
          strokeDasharray="2 4"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="542" cy="515" r="2.6" fill="#ECE8E1" />

        {/* Leader 2: Live Orbiting Moon P-01 -> Fixed P-01 LYRA CRM Dock */}
        <circle ref={moonDotRef} cx="415" cy="706" r="2.6" fill="#F3D48B" />
        <polyline
          ref={moonPolyRef}
          points="415,706 530,706 618,706"
          fill="none"
          stroke="rgba(236,232,225,0.72)"
          strokeWidth="1.2"
          strokeDasharray="2 4"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="618" cy="706" r="2.6" fill="#ECE8E1" />
      </svg>

      {/* Bottom-Left Animated Signal Pill */}
      <div
        className="pointer-events-none absolute bottom-[6%] left-[4.5%] hidden lg:flex items-center gap-2.5 rounded-full border border-white/12 bg-[#070910]/70 px-3 py-1.5 z-20"
        aria-hidden="true"
      >
        <div className="flex items-end gap-[2.5px] h-3">
          <span className="w-[2px] h-2.5 bg-[#E05248] animate-eq-bar" style={{ animationDuration: '0.9s' }} />
          <span className="w-[2px] h-3 bg-[#E05248] animate-eq-bar" style={{ animationDuration: '1.2s', animationDelay: '0.2s' }} />
          <span className="w-[2px] h-2 bg-[#E05248]/80 animate-eq-bar" style={{ animationDuration: '1.05s', animationDelay: '0.35s' }} />
        </div>
        <div className="w-8 h-[1px] bg-white/25 relative">
          <span className="absolute right-0 -top-[2px] w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse-soft" />
        </div>
      </div>

      {/* DESKTOP FIXED CASCADING PROJECT TITLES */}
      <div className="hidden lg:block">
        {/* P-00 NOVA PLATFORM */}
        <button
          type="button"
          onClick={() => onSelect(0)}
          className="pointer-events-auto group absolute top-[44.2%] left-[51.5%] flex items-start gap-3 text-left cursor-pointer focus:outline-none z-20"
        >
          <span
            className="font-tall font-normal text-[#8E9095] group-hover:text-amber-300 transition leading-none mt-[0.5vh]"
            style={{ fontSize: 'clamp(1.1rem, 3.5vh, 2.1rem)' }}
          >
            P-00
          </span>
          <span
            className={`font-tall font-bold uppercase leading-[0.83] tracking-[-0.012em] whitespace-nowrap transition duration-300 ${
              selectedIndex === 0 ? 'text-amber-200' : 'text-[#F2F0EB] group-hover:text-white'
            }`}
            style={{ fontSize: 'clamp(3.2rem, 16.2vh, 9.4rem)' }}
          >
            NOVA PLATFORM
          </span>
        </button>

        {/* P-01 LYRA CRM */}
        <button
          type="button"
          onClick={() => onSelect(1)}
          className="pointer-events-auto group absolute top-[63.5%] left-[59.3%] flex items-start gap-3 text-left cursor-pointer focus:outline-none z-20"
        >
          <span
            className="font-tall font-normal text-[#8E9095] group-hover:text-amber-300 transition leading-none mt-[0.5vh]"
            style={{ fontSize: 'clamp(1.1rem, 3.5vh, 2.1rem)' }}
          >
            P-01
          </span>
          <span
            className={`font-tall font-bold uppercase leading-[0.83] tracking-[-0.012em] whitespace-nowrap transition duration-300 ${
              selectedIndex === 1 ? 'text-amber-200' : 'text-[#F2F0EB] group-hover:text-white'
            }`}
            style={{ fontSize: 'clamp(3.2rem, 16.2vh, 9.4rem)' }}
          >
            LYRA CRM
          </span>
        </button>

        {/* Right Animated Live Spectrum Analyzer + P-03 ORBIT STUDIO */}
        <div className="pointer-events-none absolute top-[63.2%] right-[2.6%] flex flex-col items-start z-20">
          <div className="flex items-end gap-[3px] h-6">
            {SPECTRUM_BARS.map((bar, i) => (
              <span
                key={i}
                className={`w-[1.8px] rounded-t-[1px] animate-eq-bar ${
                  bar.red ? 'bg-[#E25A4F]' : 'bg-[#ECE8E1]/85'
                }`}
                style={{
                  height: `${bar.h}px`,
                  animationDuration: bar.dur,
                  animationDelay: bar.delay,
                }}
              />
            ))}
            <span className="ml-1 font-mono text-[8px] text-white/35 tracking-widest">·······</span>
          </div>
          <span className="font-mono text-[7px] tracking-[0.18em] text-[#E25A4F] mt-1">LIVE // TELEMETRY</span>
        </div>

        <button
          type="button"
          onClick={() => onSelect(3)}
          className="pointer-events-auto group absolute top-[73.2%] right-[1.8%] flex flex-col items-start text-left cursor-pointer focus:outline-none z-20"
        >
          <span className="self-end mb-1 rounded bg-white/[0.08] border border-white/10 px-1.5 py-0.5 font-mono text-[7px] tracking-[0.14em] text-[#D8D4CC]">
            WEBGL 3D
          </span>
          <span className="font-tall text-[1.9vh] leading-none text-[#8E9095] group-hover:text-amber-300 transition">
            P-03
          </span>
          <span
            className={`font-tall font-bold uppercase leading-[0.88] tracking-[-0.01em] whitespace-nowrap mt-0.5 transition ${
              selectedIndex === 3 ? 'text-amber-200' : 'text-[#F2F0EB] group-hover:text-white'
            }`}
            style={{ fontSize: 'clamp(1.1rem, 3.1vh, 1.85rem)' }}
          >
            ORBIT STUDIO
          </span>
        </button>

        {/* P-02 HALO VAULT */}
        <button
          type="button"
          onClick={() => onSelect(2)}
          className="pointer-events-auto group absolute top-[81.8%] left-[52.4%] flex items-start gap-2 text-left cursor-pointer focus:outline-none z-20"
        >
          <span className="font-tall text-[2.4vh] leading-none text-[#8E9095] group-hover:text-amber-300 transition mt-0.5">
            P-02
          </span>
          <span
            className={`font-tall font-bold uppercase leading-[0.85] tracking-[-0.01em] whitespace-nowrap transition ${
              selectedIndex === 2 ? 'text-amber-200' : 'text-[#F2F0EB] group-hover:text-white'
            }`}
            style={{ fontSize: 'clamp(1.6rem, 6.2vh, 3.6rem)' }}
          >
            HALO VAULT
          </span>
          <span className="ml-1 rounded bg-white/[0.07] border border-white/10 px-1.5 py-0.5 font-mono text-[7px] tracking-[0.14em] text-[#C8C4BC] uppercase">
            MOON
          </span>
        </button>

        {/* Bottom Micro-Scale Tick between P-02 and P-04 */}
        <div
          className="pointer-events-none absolute bottom-[7.2%] left-[68.2%] flex flex-col gap-1 font-mono text-[7px] text-white/50 z-20"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between w-16">
            <span className="w-1 h-1 rounded-full bg-[#D9584E] animate-pulse-soft" />
            <span>P-03</span>
          </div>
          <div className="w-16 h-[1px] bg-white/25 relative">
            <span className="absolute left-0 -top-[2px] w-[1px] h-1.5 bg-white/60" />
            <span className="absolute right-4 -top-[2px] w-[1px] h-1.5 bg-white/60" />
          </div>
          <div className="flex items-center justify-between w-16 text-[6.5px] text-white/45">
            <span>0</span>
            <span>KEPLER</span>
          </div>
        </div>

        {/* P-04 VERA COMMERCE */}
        <button
          type="button"
          onClick={() => onSelect(4)}
          className="pointer-events-auto group absolute top-[84.8%] left-[77.0%] flex items-start gap-2 text-left cursor-pointer focus:outline-none z-20"
        >
          <span className="font-tall text-[2.5vh] leading-none text-[#8E9095] group-hover:text-amber-300 transition mt-0.5">
            P-04
          </span>
          <span
            className={`font-tall font-bold uppercase leading-[0.85] tracking-[-0.01em] whitespace-nowrap transition ${
              selectedIndex === 4 ? 'text-amber-200' : 'text-[#F2F0EB] group-hover:text-white'
            }`}
            style={{ fontSize: 'clamp(1.6rem, 6.3vh, 3.65rem)' }}
          >
            VERA COMMERCE
          </span>
        </button>
      </div>

      {/* MOBILE LUXURY SNAP CAROUSEL (< 1024px) - Hidden when project detail drawer is active */}
      <div
        className={`pointer-events-auto lg:hidden absolute inset-x-0 bottom-[68px] z-20 transition-all duration-300 ${
          selected ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex gap-3 px-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2">
          {PROJECTS.map((project, index) => {
            const isSelected = selectedIndex === index;
            return (
              <div
                key={project.code}
                onClick={() => onSelect(index)}
                className={`w-[84vw] max-w-[340px] shrink-0 snap-center forge-card p-3.5 cursor-pointer transition-all duration-300 ${
                  isSelected ? 'border-amber-300/60 shadow-[0_0_24px_rgba(234,192,120,0.22)]' : ''
                }`}
                style={{ '--glow-x': '50%', '--glow-y': '100%', '--rim-angle': '145deg' } as React.CSSProperties}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[8px] tracking-[0.2em] text-amber-200/90 uppercase">
                    {project.code} // {project.body.orbit ? 'ORBITAL MOON' : 'FLAGSHIP CORE'}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-amber-300 shadow-[0_0_8px_rgba(251,242,213,0.9)]' : 'bg-white/20'
                    }`}
                  />
                </div>

                <h3 className="font-serif text-[18px] text-[#FAF8F4] leading-tight">
                  {project.name}
                </h3>
                <p className="font-sans font-light text-[10.5px] leading-tight text-[#D4D0C8] mt-0.5 line-clamp-1">
                  {project.subtitle}
                </p>

                <div className="forge-well mt-2 px-2.5 py-1.5 flex items-center justify-between font-mono text-[7.5px] text-[#D8D4CC]">
                  {project.metrics.map((m, i) => (
                    <div key={i}>
                      <span className="text-white/45 uppercase mr-1">{m.label}:</span>
                      <span className="text-amber-200">{m.value}</span>
                    </div>
                  ))}
                  <span className="text-amber-200/90 font-semibold underline underline-offset-2 ml-2">
                    VIEW &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE PROJECT TELEMETRY DRAWER WHEN A PROJECT IS SELECTED */}
      {selected && selectedIndex !== null && (
        <aside
          key={selected.code}
          className="pointer-events-auto animate-fade-up hud-panel chamfer-clip absolute left-4 right-4 bottom-[68px] lg:left-[4.4%] lg:right-auto lg:bottom-[10%] lg:w-[430px] p-4 sm:p-6 lg:p-7 z-40 shadow-2xl max-h-[42dvh] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-amber-300/90">
                {selected.code} // {selected.body.orbit ? 'ORBITAL MODULE' : 'FLAGSHIP CORE'}
              </p>
              <h3 className="font-tall font-bold mt-1 text-2xl sm:text-3xl lg:text-5xl uppercase tracking-tight text-[#F5F2EB] leading-none">
                {selected.name}
              </h3>
              <p className="mt-1 font-mono text-[10px] sm:text-[11px] text-neutral-400">{selected.subtitle}</p>
            </div>
            <button
              type="button"
              aria-label="Close project details"
              onClick={() => onSelect(null)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-neutral-300 transition duration-300 hover:border-amber-300 hover:text-amber-200 hover:bg-amber-300/10 cursor-pointer active:scale-95"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-3 sm:mt-5 font-sans text-xs sm:text-sm leading-relaxed text-neutral-300">{selected.detail}</p>

          <dl className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-5 border-t border-white/10 pt-3 sm:pt-5">
            {selected.metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="font-mono text-[9px] sm:text-[9.5px] uppercase tracking-[0.18em] text-neutral-400">
                  {metric.label}
                </dt>
                <dd className="font-tall font-bold mt-0.5 sm:mt-1 text-xl sm:text-2xl text-amber-200 tracking-wide">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      )}
    </section>
  );
}
