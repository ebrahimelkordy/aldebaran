import type { SectorAnchorPayloads } from './types';

type Listener<T> = (data: T) => void;

class AnchorBus {
  private readonly listeners: {
    [K in keyof SectorAnchorPayloads]?: Set<Listener<NonNullable<SectorAnchorPayloads[K]>>>;
  } = {};

  private readonly latest: SectorAnchorPayloads = {};

  publish(payload: SectorAnchorPayloads): void {
    if (payload.orbital !== undefined) {
      this.latest.orbital = payload.orbital;
      if (payload.orbital && this.listeners.orbital) {
        for (const fn of this.listeners.orbital) {
          fn(payload.orbital);
        }
      }
    }

    if (payload.astrolabe !== undefined) {
      this.latest.astrolabe = payload.astrolabe;
      if (payload.astrolabe && this.listeners.astrolabe) {
        for (const fn of this.listeners.astrolabe) {
          fn(payload.astrolabe);
        }
      }
    }
  }

  subscribe<K extends keyof SectorAnchorPayloads>(
    channel: K,
    listener: Listener<NonNullable<SectorAnchorPayloads[K]>>,
  ): () => void {
    if (!this.listeners[channel]) {
      this.listeners[channel] = new Set() as never;
    }
    const set = this.listeners[channel] as Set<Listener<NonNullable<SectorAnchorPayloads[K]>>>;
    set.add(listener);

    // If there is an existing latest value, deliver immediately
    const curr = this.latest[channel];
    if (curr) {
      listener(curr as NonNullable<SectorAnchorPayloads[K]>);
    }

    return () => {
      set.delete(listener);
    };
  }

  getLatest<K extends keyof SectorAnchorPayloads>(channel: K): SectorAnchorPayloads[K] | undefined {
    return this.latest[channel];
  }
}

export const anchorBus = new AnchorBus();
