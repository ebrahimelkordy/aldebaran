import { useEffect, useRef } from 'react';
import { anchorBus } from '@/engine/anchorBus';
import type { SectorAnchorPayloads } from '@/engine/types';

export function useAnchorSubscription<K extends keyof SectorAnchorPayloads>(
  channel: K,
  callback: (data: NonNullable<SectorAnchorPayloads[K]>) => void,
): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    return anchorBus.subscribe(channel, (data) => {
      cbRef.current(data);
    });
  }, [channel]);
}
