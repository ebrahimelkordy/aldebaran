import { type CSSProperties, type ReactNode } from 'react';

export interface ForgeWellProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function ForgeWell({ children, className = '', style }: ForgeWellProps) {
  return (
    <div style={style} className={`forge-well ${className}`}>
      {children}
    </div>
  );
}

