// Shared rules for the browser's solo table and the authoritative LAN table.
export const RANKS = ['A', 'K', 'Q'];
export const RANK_NAMES = { A: 'Aces', K: 'Kings', Q: 'Queens', J: 'Joker' };
export const BOT_NAMES = ['Rahul', 'Modi', 'Mamta'];
const copy = (value) => JSON.parse(JSON.stringify(value));
const pick = (items, rng) => items[Math.floor(rng() * items.length)];

export function shuffle(items, rng = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function deal(state, starter, rng) {
  const deck = shuffle([...RANKS.flatMap((rank) => Array(6).fill(rank)), 'J', 'J'], rng);
  state.rank = pick(RANKS, rng);
  state.round += 1;
  state.players.forEach((p) => { p.hand = p.alive ? deck.splice(0, 5) : []; });
  state.turn = state.players[starter]?.alive ? starter : state.players.findIndex((p) => p.alive);
  state.last = null;
  state.reveal = null;
  state.claims = [];
  state.players.forEach((p) => { p.played = []; });
  state.phase = 'playing';
  state.log = [`Round ${state.round}. All claims are ${RANK_NAMES[state.rank]}.`, ...state.log].slice(0, 12);
}

export function createGame(seats, rng = Math.random, id = String(Date.now())) {
  const state = {
    version: 2, id, round: 0, phase: 'playing', rank: 'A', turn: 0, last: null,
    reveal: null, winner: null, log: [], revision: 0,
    players: seats.map((seat, i) => ({
      id: seat.id, name: seat.name, bot: Boolean(seat.bot), style: i === 0 ? 0 : (i - 1) % 3, character: (i + 3) % 4,
      alive: true, hand: [], played: [], risks: 0, losingDraw: 1 + Math.floor(rng() * 6), score: 0, caught: 0, honest: 0,
    })),
  };
  if (seats.length < 2 || seats.length > 4) throw new Error('A table needs 2–4 players.');
  deal(state, 0, rng);
  return state;
}

export function upgradeGame(previous, rng = Math.random) {
  const state = copy(previous);
  state.players.forEach((player) => {
    if (!Number.isInteger(player.losingDraw) || player.losingDraw < 1 || player.losingDraw > 6) {
      const remaining = Math.max(1, 6 - player.risks);
      player.losingDraw = Math.min(6, player.risks + 1 + Math.floor(rng() * remaining));
    }
    if (player.risks >= player.losingDraw || player.risks >= 6) player.alive = false;
  });
  const survivors = state.players.filter((player) => player.alive);
  if (survivors.length === 1) { state.phase = 'finished'; state.winner = survivors[0].id; }
  else if (state.phase === 'playing' && !state.players[state.turn]?.alive) {
    const next = state.players.findIndex((player) => player.alive && player.hand.length);
    state.turn = next >= 0 ? next : state.players.findIndex((player) => player.alive);
  }
  return state;
}

export function mustChallenge(state) {
  return Boolean(state.last) && (state.players[state.turn].hand.length === 0 ||
    state.players.filter((p) => p.alive && p.hand.length > 0).length <= 1);
}

export function act(previous, actorId, action, rng = Math.random) {
  const state = copy(previous);
  if (state.phase !== 'playing') throw new Error('Wait for the next hand.');
  const player = state.players[state.turn];
  if (player.id !== actorId || !player.alive) throw new Error('It is not your turn.');
  if (action.type === 'play') {
    if (mustChallenge(state)) throw new Error('You must challenge the final claim.');
    const indexes = action.cards;
    if (!Array.isArray(indexes) || indexes.length < 1 || indexes.length > 3 ||
      new Set(indexes).size !== indexes.length || indexes.some((i) => !Number.isInteger(i) || i < 0 || i >= player.hand.length)) {
      throw new Error('Choose 1–3 cards from your hand.');
    }
    const cards = indexes.map((i) => player.hand[i]);
    player.hand = player.hand.filter((_, i) => !indexes.includes(i));
    player.played.push(...cards);
    // Only a subsequent play accepts the previous bluff and awards its points.
    if (state.last && state.last.cards.some((rank) => rank !== state.rank && rank !== 'J')) {
      state.players[state.last.player].score += 25;
    }
    state.last = { player: state.turn, cards, count: cards.length };
    state.claims.push({ player: state.turn, count: cards.length });
    player.score += cards.length * 10;
    state.log.unshift(`${player.name} claimed ${cards.length} ${RANK_NAMES[state.rank]}.`);
    for (let step = 1; step <= state.players.length; step++) {
      const next = (state.turn + step) % state.players.length;
      if (next !== state.turn && state.players[next].alive && state.players[next].hand.length) {
        state.turn = next;
        break;
      }
    }
    // If everyone emptied their hands, another survivor still gets to challenge.
    if (state.players[state.turn] === player) {
      for (let step = 1; step <= state.players.length; step++) {
        const next = (state.turn + step) % state.players.length;
        if (state.players[next].alive && state.players[next].id !== player.id) {
          state.turn = next;
          break;
        }
      }
    }
  } else if (action.type === 'challenge') {
    if (!state.last) throw new Error('There is no claim to challenge yet.');
    const liar = state.last.cards.some((rank) => rank !== state.rank && rank !== 'J');
    const accused = state.players[state.last.player];
    const loser = liar ? accused : player;
    (liar ? player : accused).score += 100;
    accused[liar ? 'caught' : 'honest'] += 1;
    state.reveal = {
      cards: state.last.cards, liar, accused: accused.name, challenger: player.name,
      loser: loser.name, loserId: loser.id, draw: loser.risks + 1,
    };
    state.log.unshift(`${player.name} called LIAR. ${accused.name} ${liar ? 'lied' : 'told the truth'}. ${loser.name} faces the hammer.`);
    state.phase = 'reveal';
    state.nextStarter = state.players.indexOf(loser);
  } else {
    throw new Error('Unknown move.');
  }
  state.revision += 1;
  state.log = state.log.slice(0, 12);
  return state;
}

export function nextRound(previous, rng = Math.random) {
  if (previous.phase !== 'resolved') throw new Error('The hand is not over.');
  const state = copy(previous);
  deal(state, state.nextStarter, rng);
  state.revision += 1;
  return state;
}

export function armRisk(previous) {
  if (previous.phase !== 'reveal') throw new Error('Reveal the cards first.');
  return { ...copy(previous), phase: 'loading', revision: previous.revision + 1 };
}

export function readyRisk(previous) {
  if (previous.phase !== 'loading') throw new Error('The hammer is not ready yet.');
  return { ...copy(previous), phase: 'armed', revision: previous.revision + 1 };
}

export function fireRisk(previous, actorId) {
  if (previous.phase !== 'armed' || previous.reveal.loserId !== actorId) throw new Error('Only the player who lost the challenge can try their luck.');
  return { ...copy(previous), phase: 'firing', revision: previous.revision + 1 };
}

export function resolveRisk(previous, rng = Math.random) {
  if (previous.phase !== 'firing') throw new Error('The hammer has not landed yet.');
  const state = copy(previous);
  const player = state.players.find((p) => p.id === state.reveal.loserId);
  // Older saved rooms did not have a fixed losing draw. Pick uniformly from
  // the remaining draws so they also end no later than draw six.
  if (!Number.isInteger(player.losingDraw) || player.losingDraw <= player.risks || player.losingDraw > 6) {
    player.losingDraw = Math.min(6, player.risks + 1 + Math.floor(rng() * Math.max(1, 6 - player.risks)));
  }
  player.risks = Math.min(6, player.risks + 1);
  const eliminated = player.risks >= player.losingDraw || player.risks >= 6;
  if (eliminated) player.alive = false;
  state.reveal.eliminated = eliminated;
  const survivors = state.players.filter((p) => p.alive);
  state.phase = survivors.length === 1 ? 'finished' : 'resolved';
  if (state.phase === 'finished') { state.winner = survivors[0].id; survivors[0].score += 500; }
  state.log.unshift(`${eliminated ? 'DEAD' : 'SAFE'}. ${player.name} ${eliminated ? 'was crushed by the hammer' : 'bounces back'}.`);
  state.revision += 1;
  return state;
}

// This projection is also the ONLY input supplied to bot decisions.
export function viewFor(state, id) {
  return {
    ...state,
    players: state.players.map(({ hand, played, losingDraw, ...p }) => ({
      ...p, count: hand.length, ...(p.id === id ? { hand: [...hand], played: [...played] } : {}),
    })),
    last: state.last ? { player: state.last.player, count: state.last.count } : null,
  };
}

// Hypergeometric estimate: probability the unknown original hand could hold
// enough matching cards. This is an estimate, never access to hidden hands.
export function bluffEstimate(view) {
  if (!view.last) return 0;
  const self = view.players[view.turn];
  const known = [...self.hand, ...(self.played || [])];
  const good = Math.max(0, 8 - known.filter((r) => r === view.rank || r === 'J').length);
  const population = 20 - known.length;
  const accused = view.players[view.last.player];
  const claimed = (view.claims || []).filter((c) => c.player === view.last.player).reduce((sum, c) => sum + c.count, 0);
  const required = Math.min(5, Math.max(view.last.count, claimed));
  const choose = (n, k) => { if (k < 0 || k > n) return 0; let v = 1; for (let i = 1; i <= k; i++) v = v * (n - i + 1) / i; return v; };
  let plausible = 0;
  for (let k = required; k <= 5; k++) plausible += choose(good, k) * choose(population - good, 5 - k) / choose(population, 5);
  const observed = (accused.caught + 1.5) / (accused.caught + accused.honest + 3);
  return Math.max(.04, Math.min(.96, (1 - plausible) * .65 + observed * .35));
}

export function botAction(view, rng = Math.random) {
  const player = view.players[view.turn];
  const hand = player.hand;
  if (!hand) throw new Error('The bot needs its own hand.');
  const forced = view.last && (hand.length === 0 || view.players.filter((p) => p.alive && p.count > 0).length <= 1);
  const truthful = hand.map((rank, i) => rank === view.rank || rank === 'J' ? i : -1).filter((i) => i >= 0);
  const suspicion = bluffEstimate(view);
  const threshold = [.56, .46, .62][player.style] + player.risks * .025 - (truthful.length === 0 ? .1 : 0);
  if (forced || (view.last && suspicion > threshold + (rng() - .5) * .12)) return { type: 'challenge' };
  const bluff = !truthful.length || rng() < [.14, .32, .23][player.style] / (1 + player.risks * .25);
  const bad = hand.map((r, i) => r !== view.rank && r !== 'J' ? i : -1).filter((i) => i >= 0);
  const options = bluff && bad.length ? shuffle(bad, rng) : shuffle(truthful, rng);
  // Small bluffs are easier to sell. Honest hands shed more cards, but sometimes
  // retain one matching card to avoid a forced lie on the following turn.
  const count = bluff ? Math.min(options.length, rng() < .78 ? 1 : 2) : Math.min(options.length, options.length >= 3 && rng() < .45 ? 2 : 3);
  return { type: 'play', cards: options.slice(0, count) };
}

export function validSave(state) {
  return Boolean(state && state.version === 2 && typeof state.id === 'string' &&
    ['playing', 'reveal', 'loading', 'armed', 'firing', 'resolved', 'finished'].includes(state.phase) && RANKS.includes(state.rank) &&
    Number.isInteger(state.turn) && state.turn >= 0 && state.turn < 4 &&
    Array.isArray(state.players) && state.players.length === 4 && state.players[0].id === 'you' &&
    Array.isArray(state.log) && state.log.every((line) => typeof line === 'string') &&
    state.players.every((p) => typeof p.id === 'string' && typeof p.name === 'string' &&
      Number.isFinite(p.score) && p.score >= 0 && Number.isInteger(p.risks) && p.risks >= 0 && p.risks <= 6 &&
      (p.losingDraw === undefined || (Number.isInteger(p.losingDraw) && p.losingDraw >= 1 && p.losingDraw <= 6)) && typeof p.alive === 'boolean' &&
      Array.isArray(p.hand) && p.hand.length <= 5 && p.hand.every((rank) => [...RANKS, 'J'].includes(rank))) &&
    (!state.last || (Number.isInteger(state.last.player) && state.last.player >= 0 && state.last.player < 4 &&
      Array.isArray(state.last.cards) && state.last.cards.length >= 1 && state.last.cards.length <= 3 &&
      state.last.cards.every((rank) => [...RANKS, 'J'].includes(rank)))));
}
