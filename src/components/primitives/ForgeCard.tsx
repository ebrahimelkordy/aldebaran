import { type CSSProperties, type ReactNode } from 'react';

export interface ForgeCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  glowX?: string;
  glowY?: string;
  rimAngle?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  tabIndex?: number;
  role?: string;
}

export function ForgeCard({
  children,
  className = '',
  style,
  glowX = '0%',
  glowY = '0%',
  rimAngle = '135deg',
  onMouseEnter,
  onMouseLeave,
  onClick,
  tabIndex,
  role,
}: ForgeCardProps) {
  const dynamicStyle = {
    ...style,
    '--glow-x': glowX,
    '--glow-y': glowY,
    '--rim-angle': rimAngle,
  } as CSSProperties;

  return (
    <div
      role={role}
      tabIndex={tabIndex}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={dynamicStyle}
      className={`forge-card ${className}`}
    >
      {children}
    </div>
  );
}
