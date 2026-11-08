import { useEffect, useRef, useState } from 'react';

export default function CosmicCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if device has fine pointer (mouse)
    const hasMouse = window.matchMedia('(pointer: fine)').matches;
    if (!hasMouse) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let animId = 0;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setIsVisible(true);

      // Check if hovering interactive target
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, textarea, [role="button"], .interactive-target');
        setIsHovered(!!interactive);
      }
    };

    const handlePointerDown = () => setIsPressed(true);
    const handlePointerUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      // Silky smooth lerp lag for outer reticle
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }

      setCoords({ x: Math.round(targetX), y: Math.round(targetY) });
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {/* Central instantaneous laser dot */}
      <div
        ref={dotRef}
        className="absolute -left-1 -top-1 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FBF2D5] shadow-[0_0_8px_#FBF2D5]"
      />

      {/* Lagging magnetic precision reticle */}
      <div
        ref={cursorRef}
        className={`absolute -left-5 -top-5 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-transform duration-150 ${
          isHovered ? 'scale-135' : isPressed ? 'scale-85' : 'scale-100'
        }`}
      >
        <div
          className={`relative h-full w-full rounded-full border transition-all duration-300 ${
            isHovered
              ? 'border-[#FBF2D5] bg-[#FBF2D5]/10 shadow-[0_0_16px_rgba(251,242,213,0.35)]'
              : 'border-[#FBF2D5]/40 bg-transparent'
          }`}
        >
          {/* Coordinate crosshair ticks */}
          <div className="absolute left-1/2 top-0 h-1.5 w-px -translate-x-1/2 bg-[#FBF2D5]" />
          <div className="absolute bottom-0 left-1/2 h-1.5 w-px -translate-x-1/2 bg-[#FBF2D5]" />
          <div className="absolute left-0 top-1/2 h-px w-1.5 -translate-y-1/2 bg-[#FBF2D5]" />
          <div className="absolute right-0 top-1/2 h-px w-1.5 -translate-y-1/2 bg-[#FBF2D5]" />
        </div>

        {/* Micro-telemetry readout */}
        <div className="absolute -bottom-4 left-6 whitespace-nowrap font-mono text-[9px] uppercase tracking-wider text-[#FBF2D5]/60">
          [{coords.x}, {coords.y}]
        </div>
      </div>
    </div>
  );
}
