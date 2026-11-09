export interface RadarDialProps {
  size?: number;
  className?: string;
  label?: string;
  active?: boolean;
}

export function RadarDial({ size = 48, className = '', label, active = false }: RadarDialProps) {
  const r = size * 0.42;
  const center = size * 0.5;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="rgba(236,232,225,0.18)"
          strokeWidth="0.75"
        />
        <circle
          cx={center}
          cy={center}
          r={r * 0.72}
          fill="none"
          stroke={active ? 'rgba(234,192,120,0.5)' : 'rgba(234,192,120,0.25)'}
          strokeWidth="0.8"
          strokeDasharray="2 3"
          className="svg-origin-center animate-spin-slow"
        />
        {/* 45-degree diagonal radar crosshairs */}
        <line
          x1={center - r * 0.55}
          y1={center - r * 0.55}
          x2={center + r * 0.55}
          y2={center + r * 0.55}
          stroke="rgba(236,232,225,0.22)"
          strokeWidth="0.75"
        />
        <line
          x1={center - r * 0.55}
          y1={center + r * 0.55}
          x2={center + r * 0.55}
          y2={center - r * 0.55}
          stroke="rgba(236,232,225,0.22)"
          strokeWidth="0.75"
        />
      </svg>
      {label && (
        <span className="absolute font-mono text-[9px] tracking-widest text-[#ECE8E1]/80">
          {label}
        </span>
      )}
    </div>
  );
}
