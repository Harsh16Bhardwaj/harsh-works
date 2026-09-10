// Private policy configuration. Never serialize these assignments to guests.
export const PERSONALITIES = {
  trickster: { bluff: .48, challenge: .50, caution: .65, memory: .8, pace: 2600 },
  pacer: { bluff: .28, challenge: .55, caution: .7, memory: .5, pace: 1400 },
  survivor: { bluff: .10, challenge: .68, caution: 1.4, memory: .8, pace: 3400 },
  reader: { bluff: .20, challenge: .54, caution: 1, memory: 1.6, pace: 3000 },
  opportunist: { bluff: .30, challenge: .56, caution: 1, memory: 1.1, pace: 2300 },
};
export function assignPersonality(rng = Math.random) {
  const keys = Object.keys(PERSONALITIES);
  return keys[Math.min(keys.length - 1, Math.floor(rng() * keys.length))];
}
export function botDelay(player, rng = Math.random) {
  const policy = PERSONALITIES[player.personality];
  return policy ? Math.round(policy.pace + rng() * 1300 + player.risks * 100) : 5000;
}
export function chooseBotMove(view, estimate, rng = Math.random, personality = 'opportunist') {
  const self = view.players[view.turn], hand = self.hand;
  if (!hand) throw new Error('The bot needs its own hand.');
  const policy = PERSONALITIES[personality] || PERSONALITIES.opportunist;
  const good = [], bad = [];
  hand.forEach((rank, index) => (rank === view.rank || rank === 'J' ? good : bad).push(index));
  const opponent = view.last && view.players[view.last.player];
  const forced = view.last && (!hand.length || view.players.filter(p => p.alive && p.count > 0).length <= 1);
  const danger = self.risks / 6;
  // Only revealed outcomes are evidence. Unchallenged claims are not known lies.
  const history = opponent ? (opponent.caught + 1) / (opponent.caught + opponent.honest + 2) : .5;
  const timing = (view.events || []).filter(e => e.player === opponent?.id && e.type === 'play' && e.elapsedMs > 0);
  const average = timing.reduce((sum, e) => sum + e.elapsedMs, 0) / Math.max(1, timing.length);
  const unusualPace = timing.length >= 4 && timing.at(-1).elapsedMs < average * .45 ? .025 : 0;
  const suspicion = estimate + (history - .5) * .18 * policy.memory + unusualPace;
  const endgame = view.players.filter(p => p.alive).length === 2;
  const exploit = personality === 'opportunist' && opponent ? (opponent.count <= 1 ? .08 : 0) + (endgame ? .04 : 0) : 0;
  const threshold = policy.challenge + danger * .12 * policy.caution - (!good.length ? .10 : 0) - exploit;
  if (forced || (opponent && suspicion > threshold + (rng() - .5) * .10)) return { type: 'challenge' };
  const exposure = self.caught / (self.caught + self.honest + 3);
  const bluffChance = policy.bluff * (1 - danger * .6) * (1 - exposure * .55);
  const bluff = !good.length || (bad.length && rng() < bluffChance);
  const options = [...(bluff ? bad : good)];
  for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
  // A large lie is conspicuous; the fast player takes that risk more often.
  const desired = bluff ? (personality === 'pacer' && rng() < .45 ? 2 : 1)
    : personality === 'survivor' && good.length > 1 && bad.length > 0 ? good.length - 1 : 3;
  return { type: 'play', cards: options.slice(0, Math.max(1, Math.min(3, desired))) };
}
