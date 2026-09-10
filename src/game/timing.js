import { botDelay } from './bot-personalities.js';
// Shared pacing: persisted deadlines, rather than request frequency, drive rooms.
// Let each consequence read as a sequence: evidence, camera move, reaction, impact, result.
export const TIMING = { reveal: 1800, loading: 1450, armed: 1050, firing: 420, resolved: 1900, human: 30000 };

export function phaseDelay(game, rng = Math.random) {
  if (game.phase === 'playing') return game.players[game.turn].bot ? botDelay(game.players[game.turn], rng) : TIMING.human;
  if (game.phase === 'armed') return TIMING.armed;
  return TIMING[game.phase] ?? null;
}
