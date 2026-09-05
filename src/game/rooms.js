import { randomBytes, randomUUID } from 'node:crypto';
import { act, armRisk, fireRisk, resolveRisk, botAction, BOT_NAMES, createGame, nextRound, viewFor } from './engine.js';

const rooms = globalThis.__liarsOrbitRooms ??= new Map();
const TTL = 2 * 60 * 60 * 1000;
const fail = (message) => { throw new Error(message); };
const nameOf = (name) => typeof name === 'string' && name.trim().length > 0 ? name.trim().slice(0, 18) : 'Traveller';

function schedule(room) {
  clearTimeout(room.timer);
  const game = room.game;
  if (game.phase === 'finished') { room.due = null; return; }
  const riskPlayer = game.players.find((p) => p.id === game.reveal?.loserId);
  const delay = { reveal: 2600, firing: 1500, resolved: 3500, armed: riskPlayer?.bot ? 1400 : 20000 }[game.phase] ?? (game.players[game.turn].bot ? 1100 : 30000);
  room.due = Date.now() + delay;
  room.timer = setTimeout(() => {
    if (Date.now() - room.touched > TTL) { rooms.delete(room.code); return; }
    tick(room);
  }, delay + 5);
  room.timer.unref?.();
}

function tick(room) {
  if (!room.game || room.game.phase === 'finished' || Date.now() < room.due) return;
  if (room.game.phase === 'reveal') room.game = armRisk(room.game);
  else if (room.game.phase === 'armed') room.game = fireRisk(room.game, room.game.reveal.loserId);
  else if (room.game.phase === 'firing') room.game = resolveRisk(room.game);
  else if (room.game.phase === 'resolved') room.game = nextRound(room.game);
  else {
    const player = room.game.players[room.game.turn];
    room.game = act(room.game, player.id, botAction(viewFor(room.game, player.id)));
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

export function roomRequest(body, token) {
  const now = Date.now();
  for (const [code, room] of rooms) if (now - room.touched > TTL) { clearTimeout(room.timer); rooms.delete(code); }
  if (body.type === 'create') {
    if (rooms.size >= 100) fail('The room server is full. Try again later.');
    let code;
    do { code = randomBytes(3).toString('hex').toUpperCase(); } while (rooms.has(code));
    const member = { id: randomUUID(), token: randomBytes(24).toString('hex'), name: nameOf(body.name) };
    const room = { code, members: [member], host: member.id, game: null, touched: now, due: null };
    rooms.set(code, room);
    return { ...output(room, member), token: member.token };
  }
  const code = String(body.code || '').toUpperCase();
  const room = rooms.get(code);
  if (!room) fail('Room not found. Check the code, or create a new room.');
  if (body.type === 'join') {
    if (room.game) fail('This table is already playing. Ask the host to open a new room.');
    if (room.members.length >= 4) fail('This table is full.');
    const member = { id: randomUUID(), token: randomBytes(24).toString('hex'), name: nameOf(body.name) };
    room.members.push(member);
    room.touched = now;
    return { ...output(room, member), token: member.token };
  }
  const member = room.members.find((p) => p.token === token);
  if (!member) fail('Your seat could not be verified. Join the room again.');
  room.touched = now;
  if (body.type === 'start') {
    if (member.id !== room.host || room.game) fail('Only the host can start a waiting table.');
    const seats = room.members.map((p) => ({ id: p.id, name: p.name }));
    while (seats.length < 4) seats.push({ id: `bot-${seats.length}`, name: BOT_NAMES[seats.length - 1], bot: true });
    room.game = createGame(seats, Math.random, randomUUID());
    schedule(room);
  } else if (body.type === 'move') {
    tick(room);
    if (!room.game || room.game.revision !== body.revision) fail('The table has moved on. Try your move again.');
    room.game = body.action?.type === 'fire' ? fireRisk(room.game, member.id) : act(room.game, member.id, body.action);
    schedule(room);
  } else if (body.type === 'leave') {
    if (!room.game) {
      room.members = room.members.filter((p) => p.id !== member.id);
      if (room.host === member.id) room.host = room.members[0]?.id;
      if (!room.members.length) rooms.delete(code);
    } else {
      room.game.players.find((p) => p.id === member.id).bot = true;
      if (room.game.players[room.game.turn].id === member.id) schedule(room);
    }
    return { left: true };
  } else if (body.type !== 'poll') fail('Unknown room action.');
  tick(room);
  return output(room, member);
}
