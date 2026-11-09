import {
  SCOPE_LABELS,
  TRANSMISSION_SCOPES,
  type TransmissionPayload,
  type TransmissionResponse,
  type TransmissionScope,
} from '../../src/types/transmission';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ipHits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    ipHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  ipHits.set(ip, recent);
  return false;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderEmailHtml(params: {
  scopeLabel: string;
  name: string;
  email: string;
  message: string;
  timestampIso: string;
}): string {
  const safeScope = escapeHtml(params.scopeLabel);
  const safeName = escapeHtml(params.name);
  const safeEmail = escapeHtml(params.email);
  const safeMessage = escapeHtml(params.message).replace(/\r?\n/g, '<br />');

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:32px 16px;background-color:#030407;color:#ECE8E1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background-color:#080B13;border:1px solid #262A36;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:24px 28px;border-bottom:1px solid #1C202B;background-color:#0B0F1A;">
          <div style="font-family:monospace;font-size:11px;letter-spacing:2.4px;color:#EAC078;text-transform:uppercase;">
            ALDEBARAN // DIRECT QUANTUM UPLINK
          </div>
          <h1 style="margin:8px 0 0;font-size:22px;font-weight:500;color:#FAF8F4;">
            New Project Inquiry
          </h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;background-color:#05070D;border:1px solid #181C26;border-radius:8px;">
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #141821;">
                <span style="font-family:monospace;font-size:10px;letter-spacing:1.5px;color:#8E929F;text-transform:uppercase;display:block;">SCOPE</span>
                <span style="font-size:14px;color:#FBF2D5;font-weight:600;">${safeScope}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #141821;">
                <span style="font-family:monospace;font-size:10px;letter-spacing:1.5px;color:#8E929F;text-transform:uppercase;display:block;">SENDER</span>
                <span style="font-size:14px;color:#FAF8F4;">${safeName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 16px;">
                <span style="font-family:monospace;font-size:10px;letter-spacing:1.5px;color:#8E929F;text-transform:uppercase;display:block;">REPLY-TO EMAIL</span>
                <a href="mailto:${safeEmail}" style="font-size:14px;color:#C5F1FA;text-decoration:none;">${safeEmail}</a>
              </td>
            </tr>
          </table>

          <div style="font-family:monospace;font-size:10px;letter-spacing:1.5px;color:#8E929F;text-transform:uppercase;margin-bottom:8px;">
            MESSAGE PAYLOAD
          </div>
          <div style="padding:18px;background-color:#05070D;border:1px solid #181C26;border-radius:8px;font-size:14px;line-height:1.65;color:#E6E2DA;">
            ${safeMessage}
          </div>

          <div style="margin-top:20px;font-family:monospace;font-size:10px;color:#6E7382;">
            RECEIVED AT ${params.timestampIso} &bull; Reply directly to this email to contact ${safeName}.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function processTransmission(
  body: unknown,
  clientIp: string,
  env: Record<string, string | undefined>,
): Promise<{ status: number; json: TransmissionResponse }> {
  if (isRateLimited(clientIp)) {
    return {
      status: 429,
      json: { ok: false, code: 'RATE_LIMITED', error: 'Too many submissions. Please wait a few minutes.' },
    };
  }

  if (!body || typeof body !== 'object') {
    return { status: 400, json: { ok: false, code: 'VALIDATION_ERROR', error: 'Invalid request body.' } };
  }

  const payload = body as Partial<TransmissionPayload>;

  // Silent drop for automated bots filling hidden honeypot or submitting in < 1.2s
  if (
    (typeof payload.companyWebsite === 'string' && payload.companyWebsite.trim() !== '') ||
    (typeof payload.dwellMs === 'number' && payload.dwellMs < 1200)
  ) {
    return { status: 200, json: { ok: true, id: 'filtered' } };
  }

  const scope: TransmissionScope = TRANSMISSION_SCOPES.includes(payload.scope as TransmissionScope)
    ? (payload.scope as TransmissionScope)
    : 'software';
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';

  if (name.length < 1 || name.length > 80) {
    return { status: 400, json: { ok: false, code: 'VALIDATION_ERROR', error: 'Enter your name (1–80 chars).' } };
  }
  if (email.length < 5 || email.length > 120 || !EMAIL_REGEX.test(email)) {
    return { status: 400, json: { ok: false, code: 'VALIDATION_ERROR', error: 'Enter a valid email address.' } };
  }
  if (message.length < 10 || message.length > 2000) {
    return {
      status: 400,
      json: { ok: false, code: 'VALIDATION_ERROR', error: 'Your message needs 10 to 2,000 characters.' },
    };
  }

  const apiKey = env.RESEND_API_KEY?.trim();
  const toEmail = env.TRANSMISSION_TO_EMAIL?.trim();
  const fromEmail = env.TRANSMISSION_FROM_EMAIL?.trim() || 'Aldebaran Studio <onboarding@resend.dev>';

  if (!apiKey || !toEmail) {
    return {
      status: 503,
      json: {
        ok: false,
        code: 'CONFIG_ERROR',
        error: 'Transmission relay is not configured on the server.',
      },
    };
  }

  const scopeLabel = SCOPE_LABELS[scope];
  const timestampIso = new Date().toISOString();

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `[ALDEBARAN // ${scope.toUpperCase()}] Inquiry from ${name}`,
        html: renderEmailHtml({ scopeLabel, name, email, message, timestampIso }),
        text: `ALDEBARAN // NEW INQUIRY\nScope: ${scopeLabel}\nName: ${name}\nEmail: ${email}\nTime: ${timestampIso}\n\n${message}`,
      }),
    });

    const result = (await response.json().catch(() => ({}))) as { id?: string };

    if (!response.ok || !result.id) {
      return {
        status: 502,
        json: { ok: false, code: 'UPSTREAM_ERROR', error: 'Mail relay rejected dispatch. Please try again.' },
      };
    }

    return { status: 200, json: { ok: true, id: result.id } };
  } catch {
    return {
      status: 502,
      json: { ok: false, code: 'UPSTREAM_ERROR', error: 'Network error while dispatching transmission.' },
    };
  }
}
