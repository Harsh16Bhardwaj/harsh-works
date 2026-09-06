import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './supabase-config.js';

export function memoryDirectoryStore() {
  const rooms = new Map();
  return {
    async create(room) {
      if ([...rooms.values()].some((item) => item.code === room.code)) return false;
      rooms.set(room.id, structuredClone(room));
      return true;
    },
    async getByCode(code) {
      const room = [...rooms.values()].find((item) => item.code === code);
      return room ? structuredClone(room) : null;
    },
    async swap(id, version, room) {
      const current = rooms.get(id);
      if (!current || current.version !== version) return false;
      rooms.set(id, structuredClone(room));
      return true;
    },
    async remove(id, version) {
      const current = rooms.get(id);
      if (!current || (version != null && current.version !== version)) return false;
      return rooms.delete(id);
    },
    async deleteExpired(now) {
      let deleted = 0;
      for (const [id, room] of rooms) if (room.expiresAt <= now) { rooms.delete(id); deleted++; }
      return deleted;
    },
  };
}

function fromRow(row) {
  return {
    id: row.id, code: row.code, signalKey: row.signal_key, leaderId: row.leader_id,
    leaderTokenHash: row.leader_token_hash, seats: row.seats, status: row.status,
    version: row.version, createdAt: Date.parse(row.created_at),
    lastSeenAt: Date.parse(row.last_seen_at), expiresAt: Date.parse(row.expires_at),
  };
}

function toRow(room) {
  return {
    id: room.id, code: room.code, signal_key: room.signalKey, leader_id: room.leaderId,
    leader_token_hash: room.leaderTokenHash, seats: room.seats, status: room.status,
    version: room.version, created_at: new Date(room.createdAt).toISOString(),
    last_seen_at: new Date(room.lastSeenAt).toISOString(), expires_at: new Date(room.expiresAt).toISOString(),
  };
}

export function supabaseDirectoryStore(url, secret) {
  const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  return {
    async create(room) {
      const { error } = await db.from('orbit_rooms').insert(toRow(room));
      if (!error) return true;
      if (error.code === '23505') return false;
      throw new Error(`Room directory unavailable: ${error.message}`);
    },
    async getByCode(code) {
      const { data, error } = await db.from('orbit_rooms').select('*').eq('code', code).maybeSingle();
      if (error) throw new Error(`Room directory unavailable: ${error.message}`);
      return data ? fromRow(data) : null;
    },
    async swap(id, version, room) {
      const { data, error } = await db.from('orbit_rooms').update(toRow(room)).eq('id', id).eq('version', version).select('id').maybeSingle();
      if (error) throw new Error(`Room directory unavailable: ${error.message}`);
      return Boolean(data);
    },
    async remove(id, version) {
      let query = db.from('orbit_rooms').delete().eq('id', id);
      if (version != null) query = query.eq('version', version);
      const { error } = await query;
      if (error) throw new Error(`Room directory unavailable: ${error.message}`);
      return true;
    },
    async deleteExpired(now) {
      const { data, error } = await db.from('orbit_rooms').delete().lt('expires_at', new Date(now).toISOString()).select('id');
      if (error) throw new Error(`Room cleanup failed: ${error.message}`);
      return data?.length ?? 0;
    },
  };
}

export function getDirectoryStore() {
  const url = SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (url && secret) return globalThis.__orbitSupabaseDirectory ??= supabaseDirectoryStore(url, secret);
  if (process.env.NODE_ENV === 'production') throw new Error('Shared rooms are not configured yet.');
  return globalThis.__orbitMemoryDirectory ??= memoryDirectoryStore();
}
