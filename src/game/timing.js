// Shared pacing: persisted deadlines, rather than request frequency, drive rooms.
export const TIMING = { reveal: 4000, loading: 2800, firing: 2500, resolved: 4500, human: 30000, trigger: 20000 };

export function phaseDelay(game, rng = Math.random) {
  if (game.phase === 'playing') return game.players[game.turn].bot ? 5000 : TIMING.human;
  if (game.phase === 'armed') return game.players.find(p => p.id === game.reveal.loserId).bot ? 2500 : TIMING.trigger;
  return TIMING[game.phase] ?? null;
}
