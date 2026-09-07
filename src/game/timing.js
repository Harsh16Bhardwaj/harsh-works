// Shared pacing: persisted deadlines, rather than request frequency, drive rooms.
export const TIMING = { reveal: 1600, loading: 800, armed: 240, firing: 320, resolved: 1900, human: 30000 };

export function phaseDelay(game, rng = Math.random) {
  if (game.phase === 'playing') return game.players[game.turn].bot ? 5000 : TIMING.human;
  if (game.phase === 'armed') return TIMING.armed;
  return TIMING[game.phase] ?? null;
}
