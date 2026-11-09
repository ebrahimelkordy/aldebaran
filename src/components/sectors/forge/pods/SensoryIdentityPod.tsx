import { useEffect, useRef } from 'react';

interface SensoryIdentityPodProps {
  onHover?: (active: boolean) => void;
}

export function SensoryIdentityPod({ onHover }: SensoryIdentityPodProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now() * 0.001;
      const s3 = Math.round(70 + Math.sin(t * 0.6 + 1.2) * 12);
      if (barRef.current) barRef.current.style.width = `${s3}%`;
      if (dotRef.current) dotRef.current.style.left = `${s3}%`;
    }, 750);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className="pointer-events-auto absolute bottom-[7.4%] right-[2.8%] hidden lg:block w-[252px] forge-card p-3 z-20"
      style={{ '--glow-x': '0%', '--glow-y': '0%', '--rim-angle': '155deg' } as React.CSSProperties}
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
            ref={barRef}
            className="h-full rounded-full bg-gradient-to-r from-amber-300/50 to-[#FFFDF7] transition-all duration-700"
            style={{ width: '74%' }}
          />
          <span
            ref={dotRef}
            className="absolute -top-[2.5px] -ml-[3px] w-[7px] h-[7px] rounded-full bg-[#FFFDF7] shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all duration-700"
            style={{ left: '74%' }}
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
            TypeScript, React, Resend &amp; encrypted low-latency edge APIs.
          </p>
        </div>
      </div>
    </div>
  );
}
