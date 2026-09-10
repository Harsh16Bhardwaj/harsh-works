import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { getDirectoryStore } from './directory-store.js';

const ROOM_TTL = 2 * 60 * 60 * 1000;
const EXTENSION = 60 * 60 * 1000;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const cleanName = (value) => typeof value === 'string' && value.trim() ? value.trim().slice(0, 18) : 'Traveller';
const cleanCharacter = value => Number.isInteger(Number(value)) ? Math.max(0,Math.min(10,Number(value))) : 0;
const freeCharacter = (value, seats) => {
  const requested = cleanCharacter(value);
  const occupied = new Set(seats.map(seat => cleanCharacter(seat.character)));
  if (!occupied.has(requested)) return requested;
  return Array.from({length:5},(_,index)=>index).find(index=>!occupied.has(index)) ?? requested;
};
const digest = (value) => createHash('sha256').update(String(value)).digest('hex');
const token = () => randomBytes(24).toString('base64url');
const fail = (message, code, status = 400) => Object.assign(new Error(message), { code, status });

function code() {
  const bytes = randomBytes(6);
  return [...bytes].map((byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

function publicRoom(room, seatId) {
  return {
    id: room.id, code: room.code, signalKey: room.signalKey, leaderId: room.leaderId,
    seatId, host: seatId === room.leaderId, status: room.status,
    seats: room.seats.map(({ id, name, character }) => ({ id, name, character:cleanCharacter(character) })), expiresAt: room.expiresAt,
  };
}

function authenticate(room, seatToken) {
  const hash = digest(seatToken || '');
  const seat = room.seats.find((candidate) => candidate.tokenHash === hash);
  if (!seat) throw fail('Your saved seat is no longer valid. Join again.', 'SEAT_INVALID', 401);
  return seat;
}

function authenticateLeader(room, leaderToken) {
  if (digest(leaderToken || '') !== room.leaderTokenHash) throw fail('Only the room creator can do that.', 'LEADER_ONLY', 403);
}

export function createDirectoryHandler(store, now = () => Date.now()) {
  return async function directoryRequest(body, credentials = {}) {
    if (body.type === 'create') {
      for (let attempt = 0; attempt < 8; attempt++) {
        const seatToken = token();
        const leaderToken = token();
        const timestamp = now();
        const leader = { id: randomUUID(), name: cleanName(body.name), character:cleanCharacter(body.character), tokenHash: digest(seatToken) };
        const room = {
          id: randomUUID(), code: code(), signalKey: randomBytes(18).toString('hex'),
          leaderId: leader.id, leaderTokenHash: digest(leaderToken), seats: [leader],
          status: 'waiting', version: 1, createdAt: timestamp, lastSeenAt: timestamp,
          expiresAt: timestamp + ROOM_TTL,
        };
        if (await store.create(room)) return { ...publicRoom(room, leader.id), seatToken, leaderToken };
      }
      throw fail('Could not create a unique room. Try again.', 'ROOM_CREATE_FAILED', 503);
    }

    const roomCode = String(body.code || '').trim().toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(roomCode)) throw fail('Enter the six-character room code.', 'INVALID_CODE');

    for (let attempt = 0; attempt < 8; attempt++) {
      const room = await store.getByCode(roomCode);
      if (!room || room.expiresAt <= now()) throw fail('Room not found or expired.', 'ROOM_NOT_FOUND', 404);

      if (body.type === 'join') {
        if (room.status !== 'waiting') throw fail('This game has already started.', 'ROOM_STARTED', 409);
        if (room.seats.length >= 4) throw fail('This room is full.', 'ROOM_FULL', 409);
        const seatToken = token();
        const seat = { id: randomUUID(), name: cleanName(body.name), character:freeCharacter(body.character,room.seats), tokenHash: digest(seatToken) };
        const next = { ...room, seats: [...room.seats, seat], version: room.version + 1, lastSeenAt: now() };
        if (await store.swap(room.id, room.version, next)) return { ...publicRoom(next, seat.id), seatToken };
        continue;
      }

      const seat = authenticate(room, credentials.seatToken);
      if (body.type === 'resume') return publicRoom(room, seat.id);

      if(body.type==='profile'){
        if(room.status!=='waiting')throw fail('Appearance is locked after the deal.','ROOM_STARTED',409);
        const character=freeCharacter(body.character,room.seats.filter(item=>item.id!==seat.id));
        const next={...room,seats:room.seats.map(item=>item.id===seat.id?{...item,character}:item),version:room.version+1,lastSeenAt:now()};
        if(await store.swap(room.id,room.version,next))return publicRoom(next,seat.id);
        continue;
      }

      if (body.type === 'leave' && seat.id !== room.leaderId) {
        const next = { ...room, seats: room.seats.filter(item => item.id !== seat.id), version: room.version + 1, lastSeenAt: now() };
        if (await store.swap(room.id, room.version, next)) return { left: true };
        continue;
      }

      authenticateLeader(room, credentials.leaderToken);
      if (body.type === 'start') {
        if (room.status !== 'waiting') return publicRoom(room, seat.id);
        const next = { ...room, status: 'playing', version: room.version + 1, lastSeenAt: now() };
        if (await store.swap(room.id, room.version, next)) return publicRoom(next, seat.id);
        continue;
      }
      if (body.type === 'heartbeat') {
        const timestamp = now();
        const next = { ...room, version: room.version + 1, lastSeenAt: timestamp, expiresAt: timestamp + EXTENSION };
        if (await store.swap(room.id, room.version, next)) return publicRoom(next, seat.id);
        continue;
      }
      if (body.type === 'close') {
        await store.remove(room.id, room.version);
        return { closed: true };
      }
      throw fail('Unknown room action.', 'INVALID_ACTION');
    }
    throw fail('The room changed at the same time. Try again.', 'ROOM_BUSY', 409);
  };
}

export async function directoryRequest(body, credentials) {
  return createDirectoryHandler(getDirectoryStore())(body, credentials);
}
