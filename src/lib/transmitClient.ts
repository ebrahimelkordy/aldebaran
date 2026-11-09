import type { TransmissionPayload, TransmissionResponse } from '@/types/transmission';

export async function sendTransmission(payload: TransmissionPayload): Promise<TransmissionResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch('/api/transmit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = (await res.json().catch(() => null)) as TransmissionResponse | null;
    if (!data) {
      return { ok: false, code: 'UPSTREAM_ERROR', error: 'Server returned an unreadable response.' };
    }
    return data;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, code: 'UPSTREAM_ERROR', error: 'Transmission timed out. Please verify your connection.' };
    }
    return { ok: false, code: 'UPSTREAM_ERROR', error: 'Could not connect to uplink relay. Please try again.' };
  } finally {
    clearTimeout(timer);
  }
}

