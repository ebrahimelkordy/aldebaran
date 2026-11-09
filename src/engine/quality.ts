import type { QualitySettings, QualityTier } from './types';

export const QUALITY_TIERS: Record<QualityTier, QualitySettings> = {
  high: {
    tier: 'high',
    maxPixelRatio: 2.0,
    bloomDownsample: false,
    raymarchSteps: 160,
    noiseOctaves: 5,
    textureResolution: 4096,
    backdropBlur: 'blur(22px)',
  },
  medium: {
    tier: 'medium',
    maxPixelRatio: 1.35,
    bloomDownsample: true,
    raymarchSteps: 88,
    noiseOctaves: 4,
    textureResolution: 2048,
    backdropBlur: 'blur(12px)',
  },
  low: {
    tier: 'low',
    maxPixelRatio: 1.0,
    bloomDownsample: true,
    raymarchSteps: 56,
    noiseOctaves: 3,
    textureResolution: 1024,
    backdropBlur: 'none',
  },
};

export function detectDeviceTier(): QualityTier {
  if (typeof window === 'undefined') return 'high';

  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
  const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024;

  if (cores <= 4 || mem <= 4) {
    return isMobile ? 'low' : 'medium';
  }

  if (isMobile) {
    return 'medium';
  }

  return 'high';
}

export class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private lowFpsDuration = 0;
  private currentTier: QualityTier;

  constructor(
    initialTier: QualityTier,
    private readonly onTierDowngrade?: (newTier: QualityTier) => void,
  ) {
    this.currentTier = initialTier;
  }

  getTier(): QualityTier {
    return this.currentTier;
  }

  tick(now: number): void {
    this.frameCount++;
    const delta = now - this.lastTime;

    if (delta >= 1000) {
      const fps = (this.frameCount * 1000) / delta;
      this.frameCount = 0;
      this.lastTime = now;

      if (fps < 38) {
        this.lowFpsDuration += delta * 0.001;
        if (this.lowFpsDuration >= 2.5) {
          this.downgrade();
          this.lowFpsDuration = 0;
        }
      } else {
        this.lowFpsDuration = Math.max(0, this.lowFpsDuration - 0.5);
      }
    }
  }

  private downgrade(): void {
    if (this.currentTier === 'high') {
      this.currentTier = 'medium';
      this.onTierDowngrade?.('medium');
    } else if (this.currentTier === 'medium') {
      this.currentTier = 'low';
      this.onTierDowngrade?.('low');
    }
  }
}
