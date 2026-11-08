import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Sector2ScreenAnchors } from '@/space/starClusters';

interface SystemsPanelProps {
  getAnchors?: () => Sector2ScreenAnchors | null;
  onDisciplineChange?: (index: number | null) => void;
}

const STREAM_FIBERS = [6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66] as const;

type GlowStyle = CSSProperties & {
  '--glow-x'?: string;
  '--glow-y'?: string;
  '--rim-angle'?: string;
};

export default function SystemsPanel({ getAnchors, onDisciplineChange }: SystemsPanelProps) {
  const [perf, setPerf] = useState({
    frameMs: '16.1',
    latency: '14.2',
    s1: 68,
    s2: 42,
    s3: 74,
    axX: '+23.4',
    axY: '-14.8',
    axZ: '+08.2',
  });

  const astrolabeTickRef = useRef<SVGLineElement>(null);
  const astrolabeDotRef = useRef<SVGCircleElement>(null);
  const astrolabeCalloutRef = useRef<SVGPolylineElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now() * 0.001;
      setPerf({
        frameMs: (16.1 + Math.sin(t * 1.1) * 0.2).toFixed(1),
        latency: (14.2 + Math.cos(t * 0.85) * 0.4).toFixed(1),
        s1: Math.round(64 + Math.sin(t * 0.7) * 14),
        s2: Math.round(40 + Math.cos(t * 0.9) * 14),
        s3: Math.round(70 + Math.sin(t * 0.6 + 1.2) * 12),
        axX: `+${(23.4 + Math.sin(t * 0.65) * 1.1).toFixed(1)}`,
        axY: (-(14.8 + Math.cos(t * 0.8) * 1.2)).toFixed(1),
        axZ: `+${(8.2 + Math.sin(t * 0.9 + 1.1) * 0.8).toFixed(1)}`,
      });
    }, 750);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!getAnchors) return;
    let rafId = 0;

    const tick = () => {
      const a = getAnchors();
      if (a) {
        const rx = Math.max(250, Math.min(480, a.ring0X * 1364));
        const ry = Math.max(430, Math.min(585, a.ring0Y * 768));

        if (astrolabeTickRef.current) {
          astrolabeTickRef.current.setAttribute('x1', rx.toFixed(1));
          astrolabeTickRef.current.setAttribute('y1', ry.toFixed(1));
          astrolabeTickRef.current.setAttribute('x2', '356');
          astrolabeTickRef.current.setAttribute('y2', '602');
        }
        if (astrolabeDotRef.current) {
          astrolabeDotRef.current.setAttribute('cx', rx.toFixed(1));
          astrolabeDotRef.current.setAttribute('cy', ry.toFixed(1));
        }

        const cx = Math.max(310, Math.min(490, (a.centerX + 0.055) * 1364));
        const cy = Math.max(390, Math.min(510, (a.centerY - 0.085) * 768));
        if (astrolabeCalloutRef.current) {
          astrolabeCalloutRef.current.setAttribute(
            'points',
            `${cx.toFixed(1)},${cy.toFixed(1)} 414,364 472,364`,
          );
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [getAnchors]);

  return (
    <section
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-20"
      aria-label="Sector 02 The Forge"
    >
      {/* FAR-RIGHT PARTIAL ASTROLABE LIMB & '03' NODE */}
      <div
        className="pointer-events-none absolute top-[5.2%] -right-[74px] w-[192px] h-[192px] hidden xl:flex items-center justify-start z-10"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle
            cx="116"
            cy="100"
            r="84"
            fill="none"
            stroke="rgba(236,232,225,0.18)"
            strokeWidth="0.75"
          />
          <g className="svg-origin-center animate-spin-slow">
            <circle
              cx="116"
              cy="100"
              r="76"
              fill="none"
              stroke="rgba(234,192,120,0.28)"
              strokeWidth="0.8"
              strokeDasharray="2.5 5"
            />
          </g>
          <line x1="32" y1="100" x2="21" y2="100" stroke="rgba(236,232,225,0.3)" strokeWidth="0.75" />
          <line x1="47" y1="52" x2="38" y2="45" stroke="rgba(236,232,225,0.28)" strokeWidth="0.75" />
          <line x1="47" y1="148" x2="38" y2="155" stroke="rgba(236,232,225,0.28)" strokeWidth="0.75" />
        </svg>
        <div className="absolute left-[3px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-amber-200/35 bg-[#06080f]/90 backdrop-blur-md flex items-center justify-center font-mono text-[10px] text-[#ECE8E1] shadow-[0_0_16px_rgba(234,192,120,0.15)]">
          03
        </div>
        <div className="absolute -bottom-9 left-2 font-mono text-[9.5px] tracking-[0.2em] text-[#ECE8E1]/80 whitespace-nowrap">
          [ OR
        </div>
      </div>

      {/* PRECISION ARCHITECTURAL HAIRLINE CONNECTORS */}
      <svg
        viewBox="0 0 1364 768"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 w-full h-full hidden lg:block z-10"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="forgeLineRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(251,242,213,0.08)" />
            <stop offset="100%" stopColor="rgba(251,242,213,0.42)" />
          </linearGradient>
          <linearGradient id="forgeLineLeft" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(251,242,213,0.08)" />
            <stop offset="100%" stopColor="rgba(251,242,213,0.38)" />
          </linearGradient>
        </defs>

        {/* Macro-Telemetry -> Nebula Summit */}
        <line x1="560" y1="138" x2="604" y2="224" stroke="url(#forgeLineLeft)" strokeWidth="0.85" />
        <circle cx="560" cy="138" r="1.8" fill="#FBF2D5" />

        {/* Nebula Summit -> High-Compute Engines Top-Right Pod */}
        <line x1="912" y1="114" x2="962" y2="114" stroke="url(#forgeLineRight)" strokeWidth="0.85" />
        <circle cx="962" cy="114" r="1.8" fill="#FBF2D5" />

        {/* 3D Astrolabe Upper-Right Elbow Callout */}
        <polyline
          ref={astrolabeCalloutRef}
          points="402,422 414,364 472,364"
          fill="none"
          stroke="rgba(236,232,225,0.2)"
          strokeWidth="0.75"
        />

        {/* Live 60fps Tick from 3D Astrolabe Rim -> Bottom Gimbal Synchronizer Pod */}
        <line
          ref={astrolabeTickRef}
          x1="348"
          y1="560"
          x2="356"
          y2="602"
          stroke="rgba(251,242,213,0.45)"
          strokeWidth="0.9"
          strokeDasharray="2 3"
        />
        <circle ref={astrolabeDotRef} cx="348" cy="560" r="2.2" fill="#FBF2D5" />

        {/* Nebula Lower-Right -> Sensory Identity Pod Converging Hairlines */}
        <line x1="1012" y1="434" x2="1074" y2="486" stroke="url(#forgeLineRight)" strokeWidth="0.8" />
        <line x1="1012" y1="434" x2="1074" y2="528" stroke="rgba(236,232,225,0.16)" strokeWidth="0.75" />
      </svg>

      {/* 1. UPPER-LEFT INSTRUMENT POD: MACRO-TELEMETRY */}
      <div
        onMouseEnter={() => onDisciplineChange?.(0)}
        onMouseLeave={() => onDisciplineChange?.(null)}
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
          style={{ '--glow-x': '100%', '--glow-y': '100%', '--rim-angle': '145deg' } as GlowStyle}
        >
          <span
            className="pointer-events-none absolute top-0 left-4 right-8 h-[1px] bg-gradient-to-r from-amber-200/50 via-white/30 to-transparent"
            aria-hidden="true"
          />

          {/* Left Recessed Readout Well */}
          <div className="forge-well px-2.5 py-2 font-mono text-[8px] leading-[1.52] tracking-[0.06em] text-[#D0CCC4] shrink-0 flex flex-col justify-between">
            <div>
              <div className="text-[#FAF8F4] font-medium">WEBGL2 CORE</div>
              <div>FRAME: {perf.frameMs}ms</div>
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

      {/* 2. TOP-LEFT EDITORIAL STATEMENT */}
      <div className="pointer-events-none absolute top-[23.2%] left-[3.6%] max-w-[92vw] lg:max-w-[560px] z-20">
        <p className="font-mono text-[10.5px] sm:text-[11px] tracking-[0.22em] text-[#E6E2DA] uppercase">
          02 // THE FORGE
        </p>
        <h2
          className="font-serif font-normal text-[#F7F5F0] leading-[1.04] tracking-[-0.012em] mt-2"
          style={{ fontSize: 'clamp(1.9rem, 3.0vw, 2.9rem)' }}
        >
          Engineering at astronomical scale.
        </h2>
        <p className="font-sans font-light text-[12.5px] sm:text-[13px] leading-[1.5] text-[#D4D0C8] mt-2.5 max-w-[420px]">
          Disciplines calibrated for mission-critical software, WebGL spatial computing,
          <br className="hidden sm:inline" /> bespoke digital aesthetics.
        </p>
      </div>

      {/* Mobile-only fallback title */}
      <div className="pointer-events-none sm:hidden absolute top-[39%] inset-x-4 text-center z-20">
        <h1 className="font-serif font-medium uppercase text-6xl leading-[0.84] text-[#FAF8F4]">
          <span className="block">THE</span>
          <span className="block">FORGE</span>
        </h1>
        <p className="font-sans text-[10px] tracking-[0.14em] text-[#ECE8E1] uppercase mt-2">
          CREATING COSMIC ARCHITECTURES
        </p>
      </div>

      {/* 3. LOWER-RIGHT-CENTER OPEN FRAMELESS EDITORIAL SERIF: Cinematic Interfaces */}
      <div
        onMouseEnter={() => onDisciplineChange?.(1)}
        onMouseLeave={() => onDisciplineChange?.(null)}
        className="pointer-events-auto absolute bottom-[11.2%] right-[22.4%] hidden xl:block z-20"
      >
        <h3
          className="font-serif font-normal text-[#E2DFD7] leading-[0.92] tracking-[-0.015em] drop-shadow-[0_10px_28px_rgba(0,0,0,0.65)]"
          style={{ fontSize: 'clamp(2.4rem, 4.7vw, 4.45rem)' }}
        >
          <span className="block">Cinematic</span>
          <span className="block pl-7">Interfaces</span>
        </h3>
      </div>

      {/* 4. TOP-RIGHT FLAGSHIP OBSERVATORY POD: High-Compute Engines */}
      <div
        onMouseEnter={() => onDisciplineChange?.(0)}
        onMouseLeave={() => onDisciplineChange?.(null)}
        className="pointer-events-auto absolute top-[9.8%] right-[11.0%] hidden lg:block w-[252px] forge-card p-3 z-20"
        style={{ '--glow-x': '0%', '--glow-y': '100%', '--rim-angle': '215deg' } as GlowStyle}
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
            <div className="text-[10px] tracking-[0.04em] text-amber-200 mt-0.5">{perf.latency} ms</div>
          </div>
          <div className="text-right">
            <div className="text-[7px] tracking-[0.14em] text-white/45 uppercase">EVENTS</div>
            <div className="text-[10px] tracking-[0.04em] text-[#FAF8F4] mt-0.5">2.4M/m</div>
          </div>
        </div>
      </div>

      {/* 5. MIDDLE-RIGHT GRADIENT-LIT ARCHITECTURAL BRACKET: 03 / Brand & Motion Direction */}
      <div
        onMouseEnter={() => onDisciplineChange?.(2)}
        onMouseLeave={() => onDisciplineChange?.(null)}
        className="pointer-events-auto absolute top-[36.2%] right-[2.2%] hidden lg:block w-[226px] pl-4 pt-3 z-20"
      >
        {/* Luminous champagne-to-transparent L-corner hairlines + vertex jewel */}
        <span
          className="pointer-events-none absolute top-0 left-0 right-4 h-[1px] bg-gradient-to-r from-amber-200/55 via-white/25 to-transparent"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute top-0 left-0 bottom-2 w-[1px] bg-gradient-to-b from-amber-200/55 via-white/20 to-transparent"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -top-[2px] -left-[2px] w-[5px] h-[5px] rounded-full bg-[#FBF2D5] shadow-[0_0_8px_rgba(251,242,213,0.9)]"
          aria-hidden="true"
        />

        <div className="font-mono text-[8.5px] tracking-[0.2em] text-amber-200/85 uppercase">
          03 // MOTION SYSTEMS
        </div>
        <h3 className="font-serif text-[19px] leading-[1.12] text-[#FAF8F4] mt-1">
          Brand &amp; Motion Direction
        </h3>
        <p className="font-sans font-light text-[11.5px] leading-[1.48] text-[#D4D0C8] mt-1.5">
          Distinctive spatial typography, procedural 3D shaders, and physics-driven motion crafted
          without compromise.
        </p>
      </div>

      {/* 6. BOTTOM-LEFT INSTRUMENT CLUSTER AROUND THE REAL 3D METALLIC ASTROLABE */}
      {/* 6A. Left Architectural Pod: 01 / Spatial Computing */}
      <div
        onMouseEnter={() => onDisciplineChange?.(0)}
        onMouseLeave={() => onDisciplineChange?.(null)}
        className="pointer-events-auto absolute top-[46.5%] left-[3.4%] hidden lg:block w-[196px] forge-card p-3 z-20"
        style={{ '--glow-x': '100%', '--glow-y': '50%', '--rim-angle': '120deg' } as GlowStyle}
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
            <span className="text-amber-200">{perf.frameMs} / 16.6ms</span>
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
        onMouseEnter={() => onDisciplineChange?.(1)}
        onMouseLeave={() => onDisciplineChange?.(null)}
        className="pointer-events-auto absolute bottom-[8.4%] left-[9.4%] hidden lg:block w-[184px] forge-card p-2.5 z-30"
        style={{ '--glow-x': '100%', '--glow-y': '0%', '--rim-angle': '45deg' } as GlowStyle}
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
          <span>SUPABASE &bull; EDGE</span>
          <span className="text-amber-200/90">99.99%</span>
        </div>
      </div>

      {/* 6C. Bottom Astrolabe Gimbal Synchronizer Pod */}
      <div
        onMouseEnter={() => onDisciplineChange?.(2)}
        onMouseLeave={() => onDisciplineChange?.(null)}
        className="pointer-events-auto absolute bottom-[9.6%] left-[23.8%] hidden lg:flex items-stretch gap-2 w-[228px] forge-card p-2.5 z-20"
        style={{ '--glow-x': '40%', '--glow-y': '0%', '--rim-angle': '15deg' } as GlowStyle}
      >
        <span
          className="pointer-events-none absolute top-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-amber-200/50 to-transparent"
          aria-hidden="true"
        />

        <div className="forge-well px-2.5 py-1.5 font-mono text-[8px] leading-[1.52] tracking-[0.06em] text-[#D4D0C8] shrink-0 flex flex-col justify-between">
          <div>
            <div className="text-[7px] tracking-[0.16em] text-amber-200/85 mb-0.5">GIMBAL LOCK</div>
            <div>X: {perf.axX}°</div>
            <div>Y: {perf.axY}°</div>
            <div>Z: {perf.axZ}°</div>
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
                className="h-full rounded-full bg-amber-200/70 transition-all duration-700"
                style={{ width: `${perf.s1}%` }}
              />
              <span
                className="absolute -top-[2.5px] -ml-[3px] w-[7px] h-[7px] rounded-full bg-[#FFFDF7] shadow-[0_0_8px_rgba(251,242,213,0.9)] transition-all duration-700"
                style={{ left: `${perf.s1}%` }}
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
                className="h-full rounded-full bg-white/55 transition-all duration-700"
                style={{ width: `${perf.s2}%` }}
              />
              <span
                className="absolute -top-[2px] -ml-[2.5px] w-[6px] h-[6px] rounded-full bg-[#ECE8E1] transition-all duration-700"
                style={{ left: `${perf.s2}%` }}
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

      {/* 7. BOTTOM-RIGHT EXECUTIVE ARCHITECTURE POD: Sensory Identity */}
      <div
        onMouseEnter={() => onDisciplineChange?.(1)}
        onMouseLeave={() => onDisciplineChange?.(null)}
        className="pointer-events-auto absolute bottom-[7.4%] right-[2.8%] hidden lg:block w-[252px] forge-card p-3 z-20"
        style={{ '--glow-x': '0%', '--glow-y': '0%', '--rim-angle': '155deg' } as GlowStyle}
      >
        {/* Top & Right Luminous Edge Accents (Twinned with Sector 03 Transmission Console!) */}
        <span
          className="pointer-events-none absolute top-0 left-5 right-8 h-[1px] bg-gradient-to-r from-amber-200/60 via-white/35 to-transparent"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-[1.5px] top-10 h-9 w-[2.5px] rounded-full bg-amber-200/75 shadow-[0_0_12px_rgba(234,192,120,0.65)]"
          aria-hidden="true"
        />

        {/* Recessed Top Calibration Strip */}
        <div className="forge-well px-2.5 py-1.5 mb-2 font-mono text-[7px] tracking-[0.1em] text-white/55">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-amber-200/90">02 // SPATIAL OPTICS</span>
            <span className="text-[#FAF8F4]">DPR 2.0x</span>
          </div>
          <div className="w-full h-[2px] rounded-full bg-white/12 relative mb-1">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300/50 to-[#FFFDF7] transition-all duration-700"
              style={{ width: `${perf.s3}%` }}
            />
            <span
              className="absolute -top-[2.5px] -ml-[3px] w-[7px] h-[7px] rounded-full bg-[#FFFDF7] shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all duration-700"
              style={{ left: `${perf.s3}%` }}
            />
          </div>
          <div className="flex justify-between text-[6.8px]">
            <span>0.0ms</span>
            <span>16.6ms</span>
            <span className="text-[#ECE8E1]">60 FPS LOCK</span>
          </div>
        </div>

        <h3 className="font-serif text-[19px] text-[#FAF8F4] leading-tight">Sensory Identity</h3>
        <p className="font-sans font-light text-[11px] leading-[1.44] text-[#D4D0C8] mt-0.5">
          Spatial UI systems, custom GLSL optics, and resilient full-stack engineering.
        </p>

        {/* Two Executive Recessed Inner Spec Sub-Pods */}
        <div className="mt-2 flex flex-col gap-1.5">
          <div className="forge-well px-2.5 py-1.5 relative">
            <span className="absolute right-0 top-2 bottom-2 w-[2px] rounded-full bg-amber-200/80" />
            <div className="font-mono text-[8px] tracking-[0.14em] text-amber-200 uppercase">
              P-01 // SHADERS &amp; 3D HUD
            </div>
            <p className="font-sans font-light text-[10.5px] leading-[1.4] text-[#DCD8D0] mt-0.5">
              Raymarched volumes, PBR metals &amp; 60fps DOM-WebGL projection.
            </p>
          </div>

          <div className="forge-well px-2.5 py-1.5 relative">
            <span className="absolute right-0 top-2 bottom-2 w-[2px] rounded-full bg-white/35" />
            <div className="font-mono text-[8px] tracking-[0.14em] text-[#FAF8F4] uppercase">
              P-02 // REALTIME SYSTEMS
            </div>
            <p className="font-sans font-light text-[10.5px] leading-[1.4] text-[#DCD8D0] mt-0.5">
              TypeScript, React, Supabase &amp; encrypted low-latency edge APIs.
            </p>
          </div>
        </div>
      </div>

      {/* MOBILE / TABLET LUXURY SUMMARY */}
      <div className="pointer-events-auto lg:hidden absolute inset-x-4 bottom-20 grid grid-cols-1 sm:grid-cols-3 gap-2.5 z-20">
        <div className="forge-card p-3">
          <span className="font-mono text-[8px] tracking-[0.16em] text-amber-200/85">01 // GLSL &amp; 3D</span>
          <h4 className="font-serif text-[17px] text-[#FAF8F4] mt-0.5">High-Compute Engines</h4>
        </div>
        <div className="forge-card p-3">
          <span className="font-mono text-[8px] tracking-[0.16em] text-amber-200/85">02 // SPATIAL UI</span>
          <h4 className="font-serif text-[17px] text-[#FAF8F4] mt-0.5">Cinematic Interfaces</h4>
        </div>
        <div className="forge-card p-3">
          <span className="font-mono text-[8px] tracking-[0.16em] text-amber-200/85">03 // FULL-STACK</span>
          <h4 className="font-serif text-[17px] text-[#FAF8F4] mt-0.5">Sensory Identity</h4>
        </div>
      </div>
    </section>
  );
}
