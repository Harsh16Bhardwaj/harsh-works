import { getDirectoryStore } from '../../../../src/game/directory-store.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const deleted = await getDirectoryStore().deleteExpired(Date.now());
  return Response.json({ ok: true, deleted, checkedAt: new Date().toISOString() });
}
