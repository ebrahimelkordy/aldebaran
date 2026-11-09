import { useEffect, useRef } from 'react';
import type { Sector2ScreenAnchors } from '@/space/starClusters';
import { useAnchorSubscription } from '@/hooks/useAnchorSubscription';
import { MacroTelemetryPod } from '@/components/sectors/forge/pods/MacroTelemetryPod';
import { HighComputePod } from '@/components/sectors/forge/pods/HighComputePod';
import { BrandMotionPod } from '@/components/sectors/forge/pods/BrandMotionPod';
import { AstrolabeCluster } from '@/components/sectors/forge/pods/AstrolabeCluster';
import { SensoryIdentityPod } from '@/components/sectors/forge/pods/SensoryIdentityPod';

interface SystemsPanelProps {
  getAnchors?: () => Sector2ScreenAnchors | null;
  onDisciplineChange?: (index: number | null) => void;
}

export default function SystemsPanel({ getAnchors, onDisciplineChange }: SystemsPanelProps) {
  const astrolabeTickRef = useRef<SVGLineElement>(null);
  const astrolabeDotRef = useRef<SVGCircleElement>(null);
  const astrolabeCalloutRef = useRef<SVGPolylineElement>(null);

  const updateAstrolabeSvg = (a: Sector2ScreenAnchors) => {
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
  };

  // Primary: 60fps single-pass subscription from Universe render loop
  useAnchorSubscription('astrolabe', (anchors) => {
    updateAstrolabeSvg(anchors);
  });

  // Secondary fallback: getAnchors prop if provided without anchorBus
  useEffect(() => {
    if (!getAnchors) return;
    let rafId = 0;
    const tick = () => {
      const a = getAnchors();
      if (a) updateAstrolabeSvg(a);
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
          <linearGradient id="forgeLineLeft" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(251,242,213,0.06)" />
            <stop offset="100%" stopColor="rgba(251,242,213,0.48)" />
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
          points="414,432 414,364 472,364"
          fill="none"
          stroke="rgba(251,242,213,0.48)"
          strokeWidth="0.9"
        />

        {/* Astrolabe Core Precision Outer Ring Tick */}
        <line
          ref={astrolabeTickRef}
          x1="356"
          y1="532"
          x2="356"
          y2="602"
          stroke="rgba(251,242,213,0.48)"
          strokeWidth="0.9"
          strokeDasharray="2 3"
        />
        <circle ref={astrolabeDotRef} cx="348" cy="560" r="2.2" fill="#FBF2D5" />

        {/* Nebula Lower-Right -> Sensory Identity Pod Converging Hairlines */}
        <line x1="1012" y1="434" x2="1074" y2="486" stroke="url(#forgeLineRight)" strokeWidth="0.8" />
        <line x1="1012" y1="434" x2="1074" y2="528" stroke="rgba(236,232,225,0.16)" strokeWidth="0.75" />
      </svg>

      {/* 1. UPPER-LEFT INSTRUMENT POD: MACRO-TELEMETRY */}
      <MacroTelemetryPod onHover={(active) => onDisciplineChange?.(active ? 0 : null)} />

      {/* 2. TOP-LEFT EDITORIAL STATEMENT (Desktop) */}
      <div className="pointer-events-none absolute top-[23.2%] left-[3.6%] max-w-[92vw] lg:max-w-[560px] hidden lg:block z-20">
        <p className="font-mono text-[10.5px] sm:text-[11px] tracking-[0.22em] text-[#E6E2DA] uppercase">
          02 // THE FORGE
        </p>
        <p className="font-sans font-light text-[12px] sm:text-[13px] leading-[1.62] text-[#D4D0C8] mt-2 max-w-[480px]">
          Engineering at astronomical scale. Custom 3D graphics pipelines, distributed systems, and
          architectures calibrated for zero compromise.
        </p>
        <div className="mt-3 flex items-center gap-4 text-[#C8C4BC] font-mono text-[9px] tracking-[0.16em]">
          <span className="flex items-center gap-1.5 text-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAC078] shadow-[0_0_6px_rgba(234,192,120,0.8)]" />
            LIVE WORKSPACE
          </span>
          <span className="text-white/30">&bull;</span>
          <span>LATENCY: &lt;15MS</span>
          <span className="text-white/30">&bull;</span>
          <span>REPLICATION: GLOBAL</span>
        </div>
      </div>

      {/* MOBILE COMPACT HEADER (< 1024px) */}
      <div className="pointer-events-none absolute top-16 inset-x-5 lg:hidden z-20">
        <div className="font-mono text-[9px] tracking-[0.2em] text-amber-200/90 uppercase">
          02 // THE FORGE
        </div>
        <p className="font-sans font-light text-[11px] text-[#D4D0C8] mt-0.5 max-w-[280px]">
          Engineering at astronomical scale. Custom graphics &amp; realtime systems.
        </p>
      </div>

      {/* 3. LOWER-RIGHT-CENTER OPEN FRAMELESS EDITORIAL SERIF: Cinematic Interfaces */}
      <div
        onMouseEnter={() => onDisciplineChange?.(1)}
        onMouseLeave={() => onDisciplineChange?.(null)}
        className="pointer-events-auto absolute bottom-[18.2%] right-[17.5%] hidden xl:block max-w-[280px] z-20 cursor-default"
      >
        <span className="font-mono text-[8px] tracking-[0.2em] text-amber-200/80 uppercase">
          02 // INTERFACE
        </span>
        <h3 className="font-serif text-[24px] leading-[1.08] text-[#FAF8F4] mt-1">
          Cinematic Interfaces
        </h3>
        <p className="font-sans font-light text-[11.5px] leading-[1.48] text-[#D4D0C8] mt-1.5">
          Spatial interaction architectures, fluid HUD grids, and tactile micro-details calibrated
          to leave an indelible impression.
        </p>
      </div>

      {/* 4. TOP-RIGHT FLAGSHIP OBSERVATORY POD: High-Compute Engines */}
      <HighComputePod onHover={(active) => onDisciplineChange?.(active ? 0 : null)} />

      {/* 5. MIDDLE-RIGHT GRADIENT-LIT ARCHITECTURAL BRACKET: 03 / Brand & Motion Direction */}
      <BrandMotionPod onHover={(active) => onDisciplineChange?.(active ? 2 : null)} />

      {/* 6. BOTTOM-LEFT INSTRUMENT CLUSTER AROUND THE REAL 3D METALLIC ASTROLABE */}
      <AstrolabeCluster onHoverDiscipline={onDisciplineChange} />

      {/* 7. BOTTOM-RIGHT EXECUTIVE ARCHITECTURE POD: Sensory Identity */}
      <SensoryIdentityPod onHover={(active) => onDisciplineChange?.(active ? 1 : null)} />

      {/* MOBILE LUXURY SNAP CAROUSEL (< 1024px) */}
      <div className="pointer-events-auto lg:hidden absolute inset-x-0 bottom-[68px] z-20">
        <div className="flex gap-3 px-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2">
          {/* Card 0: High-Compute Engines */}
          <div
            onClick={() => onDisciplineChange?.(0)}
            className="w-[84vw] max-w-[340px] shrink-0 snap-center forge-card p-3.5 cursor-pointer"
            style={{ '--glow-x': '50%', '--glow-y': '100%', '--rim-angle': '145deg' } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[8px] tracking-[0.2em] text-amber-200/90 uppercase">
                01 // CORE ARCHITECTURE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse-soft" />
            </div>
            <h3 className="font-serif text-[18px] text-[#FAF8F4] leading-tight">High-Compute Engines</h3>
            <p className="font-sans font-light text-[10.5px] leading-tight text-[#D4D0C8] mt-0.5 line-clamp-1">
              Realtime WebGL pipelines &amp; distributed low-latency runtimes.
            </p>
            <div className="forge-well mt-2 px-2.5 py-1.5 flex items-center justify-between font-mono text-[7.5px] text-[#D8D4CC]">
              <div><span className="text-white/45">LATENCY:</span> <span className="text-amber-200">&lt;14ms</span></div>
              <div><span className="text-white/45">FPS:</span> <span className="text-amber-200">60.0 LOCK</span></div>
              <span className="text-amber-200/90 font-semibold">ACTIVE &rarr;</span>
            </div>
          </div>

          {/* Card 1: Cinematic Interfaces */}
          <div
            onClick={() => onDisciplineChange?.(1)}
            className="w-[84vw] max-w-[340px] shrink-0 snap-center forge-card p-3.5 cursor-pointer"
            style={{ '--glow-x': '50%', '--glow-y': '100%', '--rim-angle': '145deg' } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[8px] tracking-[0.2em] text-amber-200/90 uppercase">
                02 // SPATIAL &amp; DIGITAL UI
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAC078]" />
            </div>
            <h3 className="font-serif text-[18px] text-[#FAF8F4] leading-tight">Cinematic Interfaces</h3>
            <p className="font-sans font-light text-[10.5px] leading-tight text-[#D4D0C8] mt-0.5 line-clamp-1">
              Fluid HUD grids, sensory haptics &amp; 3D DOM projection.
            </p>
            <div className="forge-well mt-2 px-2.5 py-1.5 flex items-center justify-between font-mono text-[7.5px] text-[#D8D4CC]">
              <div><span className="text-white/45">PROJECTION:</span> <span className="text-amber-200">60FPS BUS</span></div>
              <div><span className="text-white/45">HUD:</span> <span className="text-amber-200">RETINA</span></div>
              <span className="text-amber-200/90 font-semibold">ACTIVE &rarr;</span>
            </div>
          </div>

          {/* Card 2: Sensory Identity */}
          <div
            onClick={() => onDisciplineChange?.(2)}
            className="w-[84vw] max-w-[340px] shrink-0 snap-center forge-card p-3.5 cursor-pointer"
            style={{ '--glow-x': '50%', '--glow-y': '100%', '--rim-angle': '145deg' } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[8px] tracking-[0.2em] text-amber-200/90 uppercase">
                03 // SENSORY IDENTITY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            </div>
            <h3 className="font-serif text-[18px] text-[#FAF8F4] leading-tight">Sensory Identity</h3>
            <p className="font-sans font-light text-[10.5px] leading-tight text-[#D4D0C8] mt-0.5 line-clamp-1">
              Procedural typography, raymarched optics &amp; sonic branding.
            </p>
            <div className="forge-well mt-2 px-2.5 py-1.5 flex items-center justify-between font-mono text-[7.5px] text-[#D8D4CC]">
              <div><span className="text-white/45">OPTICS:</span> <span className="text-amber-200">RAYMARCH</span></div>
              <div><span className="text-white/45">SHADERS:</span> <span className="text-amber-200">CUSTOM</span></div>
              <span className="text-amber-200/90 font-semibold">ACTIVE &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
