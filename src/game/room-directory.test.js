import assert from 'node:assert/strict';
import test from 'node:test';
import { memoryDirectoryStore } from './directory-store.js';
import { createDirectoryHandler } from './room-directory.js';

test('directory creates, joins, resumes, starts and closes a room', async () => {
  let clock = 1000;
  const request = createDirectoryHandler(memoryDirectoryStore(), () => clock);
  const host = await request({ type: 'create', name: 'Rahul' });
  const guest = await request({ type: 'join', code: host.code, name: 'Mamta' });
  assert.equal(guest.seats.length, 2);
  assert.equal((await request({ type: 'resume', code: host.code }, { seatToken: host.seatToken })).host, true);
  const started = await request({ type: 'start', code: host.code }, hostCredentials(host));
  assert.equal(started.status, 'playing');
  await assert.rejects(request({ type: 'join', code: host.code, name: 'Late' }), /already started/);
  assert.deepEqual(await request({ type: 'close', code: host.code }, hostCredentials(host)), { closed: true });
});

test('directory uses compare-and-swap for simultaneous joins and extends active rooms', async () => {
  let clock = 1000;
  const store = memoryDirectoryStore();
  const first = createDirectoryHandler(store, () => clock);
  const second = createDirectoryHandler(store, () => clock);
  const host = await first({ type: 'create', name: 'Rahul' });
  await Promise.all([first({ type: 'join', code: host.code, name: 'Modi' }), second({ type: 'join', code: host.code, name: 'Mamta' })]);
  const room = await first({ type: 'resume', code: host.code }, { seatToken: host.seatToken });
  assert.equal(room.seats.length, 3);
  clock += 10_000;
  const active = await first({ type: 'heartbeat', code: host.code }, hostCredentials(host));
  assert.equal(active.expiresAt, clock + 60 * 60 * 1000);
});

test('expired rooms and invalid seat or leader tokens are rejected', async () => {
  let clock = 1000;
  const request = createDirectoryHandler(memoryDirectoryStore(), () => clock);
  const host = await request({ type: 'create' });
  await assert.rejects(request({ type: 'start', code: host.code }, { seatToken: host.seatToken, leaderToken: 'wrong' }), /creator/);
  await assert.rejects(request({ type: 'resume', code: host.code }, { seatToken: 'wrong' }), /saved seat/);
  clock += 2 * 60 * 60 * 1000 + 1;
  await assert.rejects(request({ type: 'resume', code: host.code }, { seatToken: host.seatToken }), /expired/);
});

function hostCredentials(host) {
  return { seatToken: host.seatToken, leaderToken: host.leaderToken };
}
