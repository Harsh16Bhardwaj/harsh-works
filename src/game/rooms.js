import { randomBytes, randomUUID } from 'node:crypto';
import { act, armRisk, readyRisk, fireRisk, resolveRisk, botAction, BOT_NAMES, createGame, nextRound, viewFor } from './engine.js';

import { phaseDelay } from './timing.js';
import { getRoomStore } from './room-store.js';
const TTL = 2 * 60 * 60 * 1000;
const fail = (message, code = 'INVALID_ACTION', status = 400) => {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  throw error;
};
const nameOf = (name) => typeof name === 'string' && name.trim().length > 0 ? name.trim().slice(0, 18) : 'Traveller';

function schedule(room) {
  const delay = phaseDelay(room.game);
  room.due = delay === null ? null : Date.now() + delay;
}

function tick(room) {
  if (!room.game || room.game.phase === 'finished' || Date.now() < room.due) return;
  if (room.game.phase === 'reveal') room.game = armRisk(room.game);
  else if (room.game.phase === 'loading') room.game = readyRisk(room.game);
  else if (room.game.phase === 'armed') room.game = fireRisk(room.game, room.game.reveal.loserId);
  else if (room.game.phase === 'firing') room.game = resolveRisk(room.game);
  else if (room.game.phase === 'resolved') room.game = nextRound(room.game);
  else {
    const player = room.game.players[room.game.turn];
    room.game = act(room.game, player.id, botAction(viewFor(room.game, player.id), Math.random, player.personality));
  }
  schedule(room);
}

function output(room, member) {
  return {
    code: room.code, playerId: member.id, host: member.id === room.host, due: room.due,
    seats: room.members.map(({ id, name }) => ({ id, name })),
    game: room.game ? viewFor(room.game, member.id) : null, serverNow: Date.now(),
  };
}

// Compare-and-swap prevents overlapping requests from losing joins or moves.
// Storage is in memory: production must run a single persistent Node process.
export function createRoomHandler(store) {
  return async function request(body, token) {
    if (body.type === 'create') {
      for (let attempt = 0; attempt < 8; attempt++) {
        const code = randomBytes(3).toString('hex').toUpperCase();
        const member = { id: randomUUID(), token: randomBytes(24).toString('hex'), name: nameOf(body.name) };
        const room = { code, members: [member], host: member.id, game: null, touched: Date.now(), due: null };
        if (await store.swap(code, null, JSON.stringify(room), TTL)) return { ...output(room, member), token: member.token };
      }
      fail('Could not open a table. Please try again.', 'ROOM_CREATE_FAILED', 503);
    }
    const code = String(body.code || '').trim().toUpperCase();
    if (!/^[A-F0-9]{6}$/.test(code)) fail('Enter the six-character room code.', 'INVALID_CODE');
    for (let attempt = 0; attempt < 8; attempt++) {
      const previous = await store.get(code);
      if (!previous) fail('Room not found or expired. Check the code, or create a new room.', 'ROOM_NOT_FOUND', 404);
      const room = JSON.parse(previous);
      const result = applyRequest(room, body, token);
      const next = room.members.length ? JSON.stringify(room) : null;
      if (next === previous || await store.swap(code, previous, next, TTL)) return result;
    }
    fail('The table is busy. Please try that action again.', 'ROOM_BUSY', 409);
  };
}

export async function roomRequest(body, token) {
  return createRoomHandler(getRoomStore())(body, token);
}

function applyRequest(room, body, token) {
  const now = Date.now();
  if (body.type === 'join') {
    if (room.game) fail('This table is already playing. Ask the host to open a new room.', 'ROOM_STARTED', 409);
    if (room.members.length >= 4) fail('This table is full.', 'ROOM_FULL', 409);
    const member = { id: randomUUID(), token: randomBytes(24).toString('hex'), name: nameOf(body.name) };
    room.members.push(member);
    room.touched = now;
    return { ...output(room, member), token: member.token };
  }
  const member = room.members.find((p) => p.token === token);
  if (!member) fail('Your saved seat is no longer valid. Join the room again.', 'SEAT_INVALID', 401);
  if (now - room.touched > 60000 || body.type !== 'poll') room.touched = now;
  if (body.type === 'start') {
    if (member.id !== room.host || room.game) fail('Only the host can start a waiting table.', 'HOST_ONLY', 403);
    const seats = room.members.map((p) => ({ id: p.id, name: p.name }));
    while (seats.length < 4) seats.push({ id: `bot-${seats.length}`, name: BOT_NAMES[seats.length - 1], bot: true });
    room.game = createGame(seats, Math.random, randomUUID());
    schedule(room);
  } else if (body.type === 'move') {
    tick(room);
    if (!room.game || room.game.revision !== body.revision) fail('The table has moved on. Your view is refreshing.', 'STALE_STATE', 409);
    room.game = body.action?.type === 'fire' ? fireRisk(room.game, member.id) : act(room.game, member.id, body.action);
    schedule(room);
  } else if (body.type === 'leave') {
    if (!room.game) {
      room.members = room.members.filter((p) => p.id !== member.id);
      if (room.host === member.id) room.host = room.members[0]?.id;

    } else {
      room.game.players.find((p) => p.id === member.id).bot = true;
      if (room.game.players[room.game.turn].id === member.id) schedule(room);
    }
    return { left: true };
  } else if (body.type !== 'poll') fail('Unknown room action.');
  tick(room);
  return output(room, member);
}
