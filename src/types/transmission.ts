export const TRANSMISSION_SCOPES = ['software', 'uiux', 'identity', 'other'] as const;
export type TransmissionScope = (typeof TRANSMISSION_SCOPES)[number];

export const SCOPE_LABELS: Record<TransmissionScope, string> = {
  software: 'Software Architecture',
  uiux: 'Spatial & Product Interface',
  identity: 'Brand & Motion Identity',
  other: 'Custom / Advisory',
};

export interface TransmissionPayload {
  scope: TransmissionScope;
  name: string;
  email: string;
  message: string;
  companyWebsite?: string; // Honeypot trap (must remain empty)
  dwellMs?: number;        // Time elapsed since form mount in ms
}

export type TransmissionResponse =
  | { ok: true; id: string }
  | {
      ok: false;
      code: 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'CONFIG_ERROR' | 'UPSTREAM_ERROR';
      error: string;
    };

