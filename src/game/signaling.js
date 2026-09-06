import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabase-config.js';

function localSignal(topic, seatId, onSignal) {
  const channel = new BroadcastChannel(topic);
  channel.onmessage = event => { if (event.data?.to === seatId || event.data?.to === '*') onSignal(event.data); };
  return {
    send(to, data) { channel.postMessage({ from: seatId, to, data }); },
    close() { channel.close(); },
  };
}

async function supabaseSignal(topic, seatId, onSignal, onPresence) {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const channel = client.channel(topic, { config: { presence: { key: seatId }, broadcast: { self: false } } });
  channel.on('broadcast', { event: 'signal' }, ({ payload }) => {
    if (payload?.to === seatId || payload?.to === '*') onSignal(payload);
  });
  channel.on('presence', { event: 'sync' }, () => onPresence?.(channel.presenceState()));
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Room connection timed out.')), 8000);
    channel.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(timeout);
        await channel.track({ seatId, seenAt: Date.now() });
        resolve();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        clearTimeout(timeout);
        reject(new Error('Could not open the room connection.'));
      }
    });
  });
  return {
    send(to, data) { return channel.send({ type: 'broadcast', event: 'signal', payload: { from: seatId, to, data } }); },
    close() { channel.untrack(); client.removeChannel(channel); },
  };
}

export async function openSignal({ signalKey, seatId, onSignal, onPresence }) {
  const topic = `orbit:${signalKey}`;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return localSignal(topic, seatId, onSignal);
  return supabaseSignal(topic, seatId, onSignal, onPresence);
}
