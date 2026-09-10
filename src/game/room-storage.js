export const PLAYER_NAME_KEY = 'liars-orbit.player-name.v1';
export const ROOM_SEAT_KEY = 'liars-orbit.seat.v2';
export const LEADER_STATE_KEY = 'liars-orbit.leader.v1';
export const PLAYER_SKIN_KEY = 'liars-orbit.player-skin.v1';

export function rememberedName(storage = globalThis.localStorage) {
  try { return storage.getItem(PLAYER_NAME_KEY)?.trim().slice(0, 18) || ''; } catch { return ''; }
}

export function rememberName(value, storage = globalThis.localStorage) {
  const name = String(value || '').trim().slice(0, 18);
  try { if (name) storage.setItem(PLAYER_NAME_KEY, name); else storage.removeItem(PLAYER_NAME_KEY); } catch { return false; }
  return true;
}

export function rememberedSkin(storage = globalThis.localStorage) {
  try { const value=Number(storage.getItem(PLAYER_SKIN_KEY)); return Number.isInteger(value)&&value>=0&&value<11?value:0; } catch { return 0; }
}

export function rememberSkin(value, storage = globalThis.localStorage) {
  const skin=Number(value);if(!Number.isInteger(skin)||skin<0||skin>=11)return false;
  try { storage.setItem(PLAYER_SKIN_KEY,String(skin)); return true; } catch { return false; }
}

export function loadSeat(storage = globalThis.sessionStorage) {
  try { return JSON.parse(storage.getItem(ROOM_SEAT_KEY) || 'null'); } catch { return null; }
}

export function saveSeat(value, storage = globalThis.sessionStorage) {
  try { storage.setItem(ROOM_SEAT_KEY, JSON.stringify(value)); return true; } catch { return false; }
}

export function clearSeat(storage = globalThis.sessionStorage) {
  try { storage.removeItem(ROOM_SEAT_KEY); return true; } catch { return false; }
}

export function loadLeaderState(storage = globalThis.localStorage) {
  try { return JSON.parse(storage.getItem(LEADER_STATE_KEY) || 'null'); } catch { return null; }
}

export function saveLeaderState(value, storage = globalThis.localStorage) {
  try { storage.setItem(LEADER_STATE_KEY, JSON.stringify(value)); return true; } catch { return false; }
}

export function clearLeaderState(storage = globalThis.localStorage) {
  try { storage.removeItem(LEADER_STATE_KEY); return true; } catch { return false; }
}
