export const ROOM_PROTOCOL_VERSION = 1;

export const ROOM_MESSAGE_TYPES = new Set([
  'hello', 'intent', 'snapshot', 'private-state', 'ack', 'ping', 'pong', 'room-closed', 'error',
]);

export function roomMessage(type, fields = {}) {
  if (!ROOM_MESSAGE_TYPES.has(type)) throw new Error('Unknown room message type.');
  return { protocol: ROOM_PROTOCOL_VERSION, type, ...fields };
}

export function readRoomMessage(value) {
  let message = value;
  if (typeof value === 'string') {
    try { message = JSON.parse(value); } catch { throw new Error('Invalid room message.'); }
  }
  if (!message || typeof message !== 'object' || message.protocol !== ROOM_PROTOCOL_VERSION || !ROOM_MESSAGE_TYPES.has(message.type)) {
    throw new Error('Unsupported room message.');
  }
  if (message.roomId !== undefined && typeof message.roomId !== 'string') throw new Error('Invalid room identity.');
  if (message.epoch !== undefined && (!Number.isInteger(message.epoch) || message.epoch < 1)) throw new Error('Invalid room epoch.');
  return message;
}

export function actionIntent({ roomId, epoch, seatId, actionId, revision, action }) {
  if (!roomId || !seatId || !actionId || !Number.isInteger(revision) || !action || typeof action !== 'object') {
    throw new Error('Incomplete player action.');
  }
  return roomMessage('intent', { roomId, epoch, seatId, actionId, revision, action });
}
