import { roomRequest } from '../../../src/game/rooms.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== request.headers.get('host')) {
      return Response.json({ error: 'Use the same address as the room host.' }, { status: 403 });
    }
    const raw = await request.text();
    if (raw.length > 2048) return Response.json({ error: 'Request too large.' }, { status: 413 });
    const body = JSON.parse(raw);
    if (!body || typeof body !== 'object') throw new Error('Invalid request.');
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
    return Response.json(roomRequest(body, token), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error.message || 'The table could not process that move.' }, { status: 400 });
  }
}
