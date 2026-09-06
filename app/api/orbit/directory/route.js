import { directoryRequest } from '../../../../src/game/room-directory.js';

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
    if (raw.length > 1024) return Response.json({ error: 'Request too large.', code: 'REQUEST_TOO_LARGE', requestId }, { status: 413 });
    const body = JSON.parse(raw);
    const seatToken = request.headers.get('authorization')?.replace(/^Bearer /, '');
    const leaderToken = request.headers.get('x-orbit-leader');
    const result = await directoryRequest(body, { seatToken, leaderToken });
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 503;
    console.warn('[orbit-directory]', { requestId, code: error.code || 'DIRECTORY_UNAVAILABLE', status, message: error.message });
    return Response.json({ error: error.message || 'The room service is unavailable.', code: error.code || 'DIRECTORY_UNAVAILABLE', requestId }, { status });
  }
}
