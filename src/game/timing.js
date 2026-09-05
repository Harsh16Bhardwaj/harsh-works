// Shared pacing: persisted deadlines, rather than request frequency, drive rooms.
export const TIMING = { reveal: 5000, loading: 3500, firing: 3200, resolved: 6500, human: 30000, trigger: 20000 };

export function phaseDelay(game, rng = Math.random) {
  if (game.phase === 'playing') return game.players[game.turn].bot ? 5000 + Math.floor(rng() * 5001) : TIMING.human;
  if (game.phase === 'armed') return game.players.find(p => p.id === game.reveal.loserId).bot ? 5000 + Math.floor(rng() * 2501) : TIMING.trigger;
  return TIMING[game.phase] ?? null;
}
