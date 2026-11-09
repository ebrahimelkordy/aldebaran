import { processTransmission } from './_lib/sendTransmission';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const body = await request.json().catch(() => null);
  const env =
    (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const result = await processTransmission(body, ip, env);

  return new Response(JSON.stringify(result.json), {
    status: result.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

