import { act, armRisk, readyRisk, fireRisk, resolveRisk, botAction, BOT_NAMES, createGame, nextRound, upgradeGame, viewFor } from './engine.js';
import { phaseDelay } from './timing.js';

const copy = value => JSON.parse(JSON.stringify(value));
const freeCharacter = (value, seats) => {
  const requested=Math.max(0,Math.min(10,Number(value)||0));
  const occupied=new Set(seats.map(seat=>Math.max(0,Math.min(10,Number(seat.character)||0))));
  if(!occupied.has(requested))return requested;
  return Array.from({length:5},(_,index)=>index).find(index=>!occupied.has(index))??requested;
};

export function createLeaderController({ roomId, leader, epoch = 1, rng = Math.random, now = Date.now, scheduleTimer = setTimeout, cancelTimer = clearTimeout } = {}) {
  if (!roomId || !leader?.id) throw new Error('A leader and room are required.');
  let state = { roomId, epoch, leaderId: leader.id, seats: [copy(leader)], allowBots: true, game: null, due: null };
  let timer = null;
  const listeners = new Set();
  const actionIds = new Set();

  const notify = () => listeners.forEach(listener => listener(controller.snapshot()));
  const setState = next => { state = next; armTimer(); notify(); };

  function armTimer() {
    if (timer) cancelTimer(timer);
    timer = null;
    if (!state.game) return;
    const delay = phaseDelay(state.game, rng);
    if (delay === null) return;
    state.due = now() + delay;
    const automatic = state.game.phase !== 'playing' || state.game.players[state.game.turn]?.bot;
    if (!automatic) return;
    timer = scheduleTimer(() => controller.advance(), delay);
  }

  function advanceGame(game) {
    if (game.phase === 'reveal') return armRisk(game);
    if (game.phase === 'loading') return readyRisk(game);
    if (game.phase === 'armed') return fireRisk(game, game.reveal.loserId);
    if (game.phase === 'firing') return resolveRisk(game, rng);
    if (game.phase === 'resolved') return nextRound(game, rng);
    const player = game.players[game.turn];
    if (!player.bot) return game;
    return act(game, player.id, botAction(viewFor(game, player.id), rng, player.personality), rng);
  }

  const controller = {
    subscribe(listener) { listeners.add(listener); listener(controller.snapshot()); return () => listeners.delete(listener); },
    snapshot() { return copy(state); },
    viewFor(seatId) {
      return { roomId: state.roomId, epoch: state.epoch, leaderId: state.leaderId, seats: copy(state.seats), allowBots: state.allowBots, due: state.due, game: state.game ? viewFor(state.game, seatId) : null };
    },
    addSeat(seat) {
      if (!seat?.id || state.seats.some(existing => existing.id === seat.id)) return controller.snapshot();
      if (state.game) throw new Error('The game has already started.');
      if (state.seats.length >= 4) throw new Error('The room is full.');
      setState({ ...state, seats: [...state.seats, {...copy(seat),character:freeCharacter(seat.character,state.seats)}] });
      return controller.snapshot();
    },
    removeSeat(seatId) {
      if (!state.seats.some(seat => seat.id === seatId) || seatId === state.leaderId) return controller.snapshot();
      if (!state.game) setState({ ...state, seats: state.seats.filter(seat => seat.id !== seatId) });
      else setState({ ...state, game: { ...state.game, players: state.game.players.map(player => player.id === seatId ? { ...player, bot: true } : player) } });
      return controller.snapshot();
    },
    setAllowBots(allowBots) {
      if (state.game) throw new Error('Bot settings cannot change after the deal.');
      setState({ ...state, allowBots: Boolean(allowBots) });
      return controller.snapshot();
    },
    start() {
      if (state.game) return controller.snapshot();
      if (!state.allowBots && state.seats.length < 2) throw new Error('Invite at least one friend, or enable bot fillers.');
      const seats = state.seats.map(seat => ({ id: seat.id, name: seat.name, character:seat.character }));
      if (state.allowBots) while (seats.length < 4) seats.push({ id: `bot-${seats.length}`, name: BOT_NAMES[seats.length - 1], bot: true });
      setState({ ...state, game: createGame(seats, rng, roomId) });
      return controller.snapshot();
    },
    updateSeat(seatId, character) {
      if(state.game)throw new Error('Appearance is locked after the deal.');
      const skin=freeCharacter(character,state.seats.filter(seat=>seat.id!==seatId));
      setState({...state,seats:state.seats.map(seat=>seat.id===seatId?{...seat,character:skin}:seat)});
      return controller.snapshot();
    },
    intent({ seatId, actionId, revision, action }) {
      if (!state.game) throw new Error('The game has not started.');
      if (!actionId || actionIds.has(actionId)) return controller.viewFor(seatId);
      if (revision !== state.game.revision) throw new Error('The table has moved on.');
      const game = action?.type === 'fire' ? fireRisk(state.game, seatId) : act(state.game, seatId, action, rng);
      actionIds.add(actionId);
      if (actionIds.size > 128) actionIds.delete(actionIds.values().next().value);
      setState({ ...state, game });
      return controller.viewFor(seatId);
    },
    advance() {
      if (!state.game) return controller.snapshot();
      const game = advanceGame(state.game);
      if (game !== state.game) setState({ ...state, game });
      return controller.snapshot();
    },
    restore(snapshot) {
      if (!snapshot || snapshot.roomId !== roomId || snapshot.leaderId !== leader.id || !snapshot.game) throw new Error('Invalid leader snapshot.');
      state = { ...copy(snapshot), allowBots: snapshot.allowBots !== false, game: upgradeGame(snapshot.game, rng), epoch: Math.max(epoch, snapshot.epoch + 1) };
      armTimer(); notify();
      return controller.snapshot();
    },
    dispose() { if (timer) cancelTimer(timer); timer = null; listeners.clear(); },
  };
  return controller;
}
