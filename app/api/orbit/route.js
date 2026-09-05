import { roomRequest } from '../../../src/game/rooms.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const requestId = crypto.randomUUID();
  try {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== request.headers.get('host')) {
      return Response.json({ error: 'Use the same address as the room host.', code: 'ORIGIN_MISMATCH', requestId }, { status: 403 });
    }
    const raw = await request.text();
    if (raw.length > 2048) return Response.json({ error: 'Request too large.', code: 'REQUEST_TOO_LARGE', requestId }, { status: 413 });
    const body = JSON.parse(raw);
    if (!body || typeof body !== 'object') throw new Error('Invalid request.');
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
    return Response.json(await roomRequest(body, token), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 400;
    console.warn('[orbit-room]', { requestId, code: error.code || 'BAD_REQUEST', status, message: error.message });
    return Response.json({ error: error.message || 'The table could not process that move.', code: error.code || 'BAD_REQUEST', requestId }, { status });
  }
}
