import type { Group, PerspectiveCamera } from 'three';

export type QualityTier = 'high' | 'medium' | 'low';

export interface QualitySettings {
  tier: QualityTier;
  maxPixelRatio: number;
  bloomDownsample: boolean;
  raymarchSteps: number;
  noiseOctaves: number;
  textureResolution: number;
  backdropBlur: string;
}

export interface FrameContext {
  time: number;
  deltaTime: number;
  camera: PerspectiveCamera;
  aspect: number;
  isPortrait: boolean;
  framing: number;
  weight: number;
  activeDiscipline: number | null;
  hoverIndex: number | null;
  focusIndex: number | null;
  tier: QualityTier;
}

export interface SectorScene {
  readonly id: number;
  readonly group: Group;
  update(ctx: FrameContext): void;
  setQuality?(tier: QualityTier): void;
  refreshTextures?(): void;
  dispose?(): void;
}

export interface AstrolabeScreenAnchors {
  centerX: number;
  centerY: number;
  ring0X: number;
  ring0Y: number;
  ring1X: number;
  ring1Y: number;
  ring2X: number;
  ring2Y: number;
}

export interface MoonScreenAnchor {
  x: number;
  y: number;
  moonBehindPlanet: boolean;
}

export interface SectorAnchorPayloads {
  orbital?: MoonScreenAnchor | null;
  astrolabe?: AstrolabeScreenAnchors | null;
}

