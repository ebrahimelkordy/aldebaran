import { useEffect, useRef, type CSSProperties } from 'react';

interface LiveReadoutProps {
  initial: string | number;
  getValue?: (t: number) => string | number;
  intervalMs?: number;
  className?: string;
  style?: CSSProperties;
}

export function LiveReadout({
  initial,
  getValue,
  intervalMs = 750,
  className,
  style,
}: LiveReadoutProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!getValue) return;

    const id = window.setInterval(() => {
      if (spanRef.current) {
        const t = Date.now() * 0.001;
        spanRef.current.textContent = String(getValue(t));
      }
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [getValue, intervalMs]);

  return (
    <span ref={spanRef} className={className} style={style}>
      {initial}
    </span>
  );
}

