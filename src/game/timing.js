// Shared pacing: persisted deadlines, rather than request frequency, drive rooms.
export const TIMING = { reveal: 2200, loading: 900, armed: 700, firing: 1500, resolved: 2800, human: 30000 };

export function phaseDelay(game, rng = Math.random) {
  if (game.phase === 'playing') return game.players[game.turn].bot ? 5000 : TIMING.human;
  if (game.phase === 'armed') return TIMING.armed;
  return TIMING[game.phase] ?? null;
}
