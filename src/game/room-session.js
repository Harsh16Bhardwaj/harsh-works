import { createLeaderController } from './leader-controller.js';
import { actionIntent, readRoomMessage, roomMessage } from './room-protocol.js';
import { clearLeaderState, clearSeat, loadLeaderState, saveLeaderState, saveSeat } from './room-storage.js';
import { openSignal } from './signaling.js';

const rtcConfig = { iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }, { urls: 'stun:stun.l.google.com:19302' }] };

async function directory(body, credentials = {}) {
  const response = await fetch('/api/orbit/directory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(credentials.seatToken ? { Authorization: `Bearer ${credentials.seatToken}` } : {}),
      ...(credentials.leaderToken ? { 'X-Orbit-Leader': credentials.leaderToken } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || 'Could not reach the room.'), { code: data.code });
  return data;
}

const send = (channel, message) => {
  if (channel?.readyState === 'open') channel.send(JSON.stringify(message));
};

export async function createRoomSession({ type, name, code, credentials: saved, onState, onError }) {
  const credentials = saved || await directory({ type, name, code });
  const room = saved ? await directory({ type: 'resume', code: saved.code }, saved) : credentials;
  const auth = { code: room.code, seatToken: credentials.seatToken || saved?.seatToken, leaderToken: credentials.leaderToken || saved?.leaderToken };
  saveSeat(auth);
  return room.host
    ? openLeaderSession(room, auth, onState, onError)
    : openGuestSession(room, auth, onState, onError);
}

async function openLeaderSession(room, credentials, onState, onError) {
  const leader = room.seats.find(seat => seat.id === room.seatId);
  const controller = createLeaderController({ roomId: room.id, leader });
  const saved = loadLeaderState();
  if (saved?.roomId === room.id && saved?.leaderId === leader.id && saved.game) {
    try { controller.restore(saved); } catch { clearLeaderState(); }
  }
  const peers = new Map();
  const pendingIce = new Map();
  let closed = false;
  const emit = snapshot => {
    saveLeaderState(snapshot);
    onState({ ...controller.viewFor(room.seatId), code: room.code, playerId: room.seatId, host: true, connected: true });
    for (const [seatId, peer] of peers) send(peer.channel, roomMessage('snapshot', { roomId: room.id, epoch: snapshot.epoch, state: controller.viewFor(seatId) }));
  };
  const unsubscribe = controller.subscribe(emit);

  async function makeOffer(seat) {
    if (closed) return;
    peers.get(seat.id)?.pc.close();
    peers.delete(seat.id);
    const pc = new RTCPeerConnection(rtcConfig);
    const peer = { pc, channel: pc.createDataChannel('game', { ordered: true }) };
    peers.set(seat.id, peer);
    controller.addSeat(seat);
    pc.onicecandidate = event => { if (event.candidate) signal.send(seat.id, { kind: 'ice', candidate: event.candidate.toJSON() }); };
    pc.onconnectionstatechange = () => {
      if (['failed', 'closed'].includes(pc.connectionState)) onError?.(`${seat.name} lost the direct connection.`);
    };
    peer.channel.onopen = () => emit(controller.snapshot());
    peer.channel.onmessage = event => {
      try {
        const message = readRoomMessage(event.data);
        if (message.type === 'intent' && message.roomId === room.id && message.epoch === controller.snapshot().epoch && message.seatId === seat.id) {
          controller.intent(message);
          send(peer.channel, roomMessage('ack', { roomId: room.id, epoch: message.epoch, actionId: message.actionId }));
        }
      } catch (error) { send(peer.channel, roomMessage('error', { message: error.message })); }
    };
    await pc.setLocalDescription(await pc.createOffer());
    signal.send(seat.id, { kind: 'offer', description: pc.localDescription.toJSON() });
  }

  async function onSignal(message) {
    try {
      const { from, data } = message;
      if (data?.kind === 'join' && data.seat?.id === from) await makeOffer(data.seat);
      else if (data?.kind === 'leave') { peers.get(from)?.pc.close(); peers.delete(from); controller.removeSeat(from); }
      else if (data?.kind === 'answer' && peers.has(from)) {
        const pc = peers.get(from).pc;
        await pc.setRemoteDescription(data.description);
        for (const candidate of pendingIce.get(from) || []) await pc.addIceCandidate(candidate);
        pendingIce.delete(from);
      } else if (data?.kind === 'ice') {
        const pc = peers.get(from)?.pc;
        if (pc?.remoteDescription) await pc.addIceCandidate(data.candidate);
        else pendingIce.set(from, [...(pendingIce.get(from) || []), data.candidate]);
      }
    } catch (error) { onError?.(error.message); }
  }

  let signal = await openSignal({ signalKey: room.signalKey, seatId: room.seatId, onSignal });
  const heartbeat = setInterval(() => directory({ type: 'heartbeat', code: room.code }, credentials).catch(() => {}), 5 * 60 * 1000);
  return {
    room, credentials,
    async start() { await directory({ type: 'start', code: room.code }, credentials); controller.start(); },
    act(action, revision) { return controller.intent({ seatId: room.seatId, actionId: crypto.randomUUID(), revision, action }); },
    async close() {
      closed = true; clearInterval(heartbeat);
      for (const peer of peers.values()) { send(peer.channel, roomMessage('room-closed', { roomId: room.id })); peer.pc.close(); }
      signal.close(); unsubscribe(); controller.dispose(); clearLeaderState(); clearSeat();
      await directory({ type: 'close', code: room.code }, credentials).catch(() => {});
    },
  };
}

async function openGuestSession(room, credentials, onState, onError) {
  const pc = new RTCPeerConnection(rtcConfig);
  const pendingIce = [];
  let channel;
  let latest;
  const apply = event => {
    try {
      const message = readRoomMessage(event.data);
      if (message.type === 'snapshot' && message.roomId === room.id) {
        latest = message.state;
        onState({ ...message.state, code: room.code, playerId: room.seatId, host: false, connected: true });
      } else if (message.type === 'room-closed') onError?.('The room creator left. This room is closed.');
      else if (message.type === 'error') onError?.(message.message);
    } catch (error) { onError?.(error.message); }
  };
  pc.ondatachannel = event => {
    channel = event.channel;
    channel.onmessage = apply;
  };
  pc.onicecandidate = event => { if (event.candidate) signal.send(room.leaderId, { kind: 'ice', candidate: event.candidate.toJSON() }); };
  pc.onconnectionstatechange = () => {
    if (['failed', 'disconnected'].includes(pc.connectionState)) onError?.('Direct connection lost. Reopen the invite to reconnect.');
  };
  async function onSignal(message) {
    try {
      const { data } = message;
      if (data?.kind === 'offer') {
        await pc.setRemoteDescription(data.description);
        for (const candidate of pendingIce.splice(0)) await pc.addIceCandidate(candidate);
        await pc.setLocalDescription(await pc.createAnswer());
        signal.send(room.leaderId, { kind: 'answer', description: pc.localDescription.toJSON() });
      } else if (data?.kind === 'ice') {
        if (pc.remoteDescription) await pc.addIceCandidate(data.candidate);
        else pendingIce.push(data.candidate);
      }
    } catch (error) { onError?.(error.message); }
  }
  let signal = await openSignal({ signalKey: room.signalKey, seatId: room.seatId, onSignal });
  const seat = room.seats.find(item => item.id === room.seatId);
  signal.send(room.leaderId, { kind: 'join', seat });
  onState({ ...room, playerId: room.seatId, game: null, connected: false });
  return {
    room, credentials,
    start() { throw new Error('Waiting for the room creator.'); },
    act(action, revision) {
      if (!channel || channel.readyState !== 'open' || !latest) throw new Error('Still connecting to the room creator.');
      send(channel, actionIntent({ roomId: room.id, epoch: latest.epoch, seatId: room.seatId, actionId: crypto.randomUUID(), revision, action }));
    },
    async close() {
      signal.send(room.leaderId, { kind: 'leave' });
      await directory({ type: 'leave', code: room.code }, credentials).catch(() => {});
      signal.close(); channel?.close(); pc.close(); clearSeat();
    },
  };
}
