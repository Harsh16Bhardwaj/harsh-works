// Server-only. No room state, hidden cards or Redis credentials reach clients.
export function memoryRoomStore() {
  const rooms = new Map();
  return {
    async get(code) {
      const item = rooms.get(code);
      if (!item || item.expires <= Date.now()) { rooms.delete(code); return null; }
      return item.value;
    },
    async swap(code, expected, value, ttl) {
      for (const [key, item] of rooms) if (item.expires <= Date.now()) rooms.delete(key);
      if ((rooms.get(code)?.value ?? null) !== expected) return false;
      if (value === null) rooms.delete(code);
      else {
        if (expected === null && rooms.size >= 100) throw new Error('The room server is full. Try again later.');
        rooms.set(code, { value, expires: Date.now() + ttl });
      }
      return true;
    },
  };
}

// In-memory rooms need a single, continuously running Node server.
export function getRoomStore() {
  return globalThis.__liarsOrbitLocalStore ??= memoryRoomStore();
}
