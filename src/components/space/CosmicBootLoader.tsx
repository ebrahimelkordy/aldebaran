import { useEffect, useRef, useState } from 'react';
import { useSpatialStore } from '@/store/spatialStore';

interface CosmicBootLoaderProps {
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  dist: number;
  angle: number;
  speed: number;
  radialSpeed: number;
  alpha: number;
  hue: string;
}

const TELEMETRY_PHASES = [
  { min: 0, text: 'CALIBRATING OPTICAL SENSORS & ASSET BUFFERS' },
  { min: 25, text: 'COMPILING 26,000 STELLAR BODIES [ALDEBARAN α-TAU]' },
  { min: 55, text: 'ALIGNING RELATIVISTIC ACCRETION DISCS' },
  { min: 80, text: 'SYNCHRONIZING KEPLER ORBITAL SYSTEMS' },
  { min: 98, text: 'IGNITION COMMENCED // SPATIAL MATRIX STABILIZED' },
];

export default function CosmicBootLoader({ onComplete }: CosmicBootLoaderProps) {
  const engineReady = useSpatialStore((s) => s.engineReady);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(TELEMETRY_PHASES[0].text);
  const [ignited, setIgnited] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(10);
  const currentProgressRef = useRef<number>(0);
  const fontLoadedRef = useRef<boolean>(false);

  // 1. Real Hardware Readiness Detection
  useEffect(() => {
    // Monitor web fonts
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        fontLoadedRef.current = true;
        targetProgressRef.current = Math.max(targetProgressRef.current, 40);
      }).catch(() => {
        fontLoadedRef.current = true;
        targetProgressRef.current = Math.max(targetProgressRef.current, 40);
      });
    } else {
      fontLoadedRef.current = true;
      targetProgressRef.current = 40;
    }
  }, []);

  // When 3D engine compiles active sector & renders first frame
  useEffect(() => {
    if (engineReady) {
      targetProgressRef.current = 100;
    } else if (fontLoadedRef.current) {
      targetProgressRef.current = Math.max(targetProgressRef.current, 75);
    }
  }, [engineReady]);

  // Safety fallback: ensure loader never freezes regardless of network or device state
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      targetProgressRef.current = 100;
    }, 2800);
    return () => clearTimeout(safetyTimer);
  }, []);

  // 2. Smooth Lerp Progress Controller
  useEffect(() => {
    let active = true;

    const interval = setInterval(() => {
      if (!active) return;
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;

      if (current < target) {
        // Smooth exponential approach with minimum delta
        const step = Math.max(0.6, (target - current) * 0.12);
        const next = Math.min(target, current + step);
        currentProgressRef.current = next;
        const rounded = Math.floor(next);
        setProgress(rounded);

        const activePhase = [...TELEMETRY_PHASES].reverse().find((p) => rounded >= p.min);
        if (activePhase) setStatusText(activePhase.text);

        if (rounded >= 100) {
          clearInterval(interval);
          setIgnited(true);
          onComplete?.();
          setTimeout(() => {
            setUnmounted(true);
          }, 850);
        }
      }
    }, 24);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [onComplete]);

  // 3. Canvas Gravitational Singularity & Precision Astrolabe Reticle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const PARTICLE_COUNT = Math.min(220, Math.floor((width * height) / 5000));
    const particles: Particle[] = [];

    const maxDist = Math.hypot(width, height) * 0.55;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const dist = 30 + Math.random() * maxDist;
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x: 0,
        y: 0,
        radius: Math.random() < 0.25 ? 1.4 : 0.75,
        dist,
        angle,
        speed: (0.003 + Math.random() * 0.007) * (Math.random() < 0.5 ? 1 : -1),
        radialSpeed: 0.35 + Math.random() * 0.75,
        alpha: 0.2 + Math.random() * 0.65,
        hue: Math.random() < 0.75 ? '#FBF2D5' : '#E2A64C',
      });
    }

    let rotOuter = 0;
    let rotInner = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw faint celestial coordinate grid
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 242, 213, 0.04)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
      ctx.restore();

      // Accretion particles converging toward gravitational center
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed;
        p.dist -= p.radialSpeed * (1 + (maxDist - p.dist) / maxDist * 1.5);

        // Reset particle when swallowed by singularity core
        if (p.dist < 8) {
          p.dist = maxDist * (0.8 + Math.random() * 0.2);
          p.angle = Math.random() * Math.PI * 2;
        }

        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * p.dist;

        // Draw particle with faint speed streak
        ctx.fillStyle = p.hue;
        ctx.globalAlpha = p.alpha * Math.min(1, p.dist / 40);
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Precision Astrolabe Reticles
      rotOuter += 0.0025;
      rotInner -= 0.0035;

      const baseR = Math.min(width, height) * 0.14;

      ctx.save();
      ctx.translate(cx, cy);

      // Outer Ticked Calibration Ring
      ctx.strokeStyle = 'rgba(251, 242, 213, 0.22)';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.arc(0, 0, baseR, 0, Math.PI * 2);
      ctx.stroke();

      // Degree radial notches
      ctx.save();
      ctx.rotate(rotOuter);
      ctx.strokeStyle = 'rgba(251, 242, 213, 0.35)';
      ctx.lineWidth = 0.75;
      for (let a = 0; a < 360; a += 15) {
        const rad = (a * Math.PI) / 180;
        const len = a % 90 === 0 ? 8 : a % 45 === 0 ? 5 : 2.5;
        const x1 = Math.cos(rad) * (baseR - len);
        const y1 = Math.sin(rad) * (baseR - len);
        const x2 = Math.cos(rad) * baseR;
        const y2 = Math.sin(rad) * baseR;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // Inner Counter-Rotating Hex Reticle
      ctx.save();
      ctx.rotate(rotInner);
      ctx.strokeStyle = 'rgba(234, 192, 120, 0.28)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, baseR * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Golden Singularity Core
      const corePulse = 1 + Math.sin(performance.now() * 0.006) * 0.18;
      const coreR = Math.max(3, 4.5 * corePulse);

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseR * 0.45);
      grad.addColorStop(0, 'rgba(255, 244, 208, 0.95)');
      grad.addColorStop(0.2, 'rgba(234, 192, 120, 0.45)');
      grad.addColorStop(0.6, 'rgba(158, 108, 40, 0.12)');
      grad.addColorStop(1, 'rgba(3, 4, 7, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, baseR * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Bright focal point
      ctx.fillStyle = '#FFFDF5';
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  if (unmounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#030407] select-none transition-opacity duration-700 ease-out ${
        ignited ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Interactive Accretion Singularity Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ opacity: ignited ? 0 : 1 }}
      />

      {/* Atmospheric vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_25%,#030407_80%)]" />

      {/* Telemetry & Optical Calibration Interface */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-4 transition-all duration-500"
        style={{
          opacity: ignited ? 0 : 1,
          transform: `scale(${ignited ? 1.05 : 1})`,
        }}
      >
        {/* Brand & Sector Header */}
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EAC078] shadow-[0_0_8px_#FFF4D0] animate-pulse" />
          <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.32em] uppercase text-[#EAC078]">
            ALDEBARAN // CALIBRATION PROTOCOL
          </p>
          <span className="w-1.5 h-1.5 rounded-full bg-[#EAC078] shadow-[0_0_8px_#FFF4D0] animate-pulse" />
        </div>

        {/* Monumental Counter */}
        <div className="mt-5 flex items-baseline gap-2">
          <span
            className="font-tall font-bold text-6xl sm:text-8xl tracking-tight text-[#FAF8F5] leading-none drop-shadow-[0_0_35px_rgba(234,192,120,0.3)]"
          >
            {progress.toString().padStart(3, '0')}
          </span>
          <span className="font-mono text-sm sm:text-base text-[#EAC078]/80 font-light">
            %
          </span>
        </div>

        {/* Dynamic Telemetry Status Readout */}
        <div className="mt-4 flex items-center justify-center h-6 max-w-md">
          <p className="font-mono text-[9.5px] sm:text-[11px] tracking-[0.22em] text-[#D4D0C8] uppercase transition-all duration-300">
            {statusText}
          </p>
        </div>

        {/* Horizontal Laser Progress Bar with Hairline Notches */}
        <div className="mt-6 w-64 sm:w-80 relative flex items-center">
          <div className="w-full h-[1px] bg-white/15 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#9E6C28] via-[#EAC078] to-[#FFF4D0] transition-all duration-75 ease-out shadow-[0_0_12px_#FFF4D0]"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Edge Marker Crosshairs */}
          <span className="absolute -left-1.5 w-1 h-2 border-l border-white/40" />
          <span className="absolute -right-1.5 w-1 h-2 border-r border-white/40" />
        </div>

        {/* Precision Spatial Coordinates Footer */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4 sm:gap-6 border-t border-white/10 pt-4 font-mono text-[8px] sm:text-[9px] tracking-[0.25em] text-white/50 uppercase">
          <span>RA 04h 35m 55s</span>
          <span className="text-white/20">|</span>
          <span>DEC +16° 30′ 33″</span>
          <span className="text-white/20">|</span>
          <span>MAG 0.85 // K5III</span>
        </div>
      </div>
    </div>
  );
}
