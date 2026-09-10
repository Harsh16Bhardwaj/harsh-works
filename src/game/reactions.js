import { SKINS, REACTION_POOLS } from './skins.js';

const hash = value => { let n=2166136261; for(const c of value) n=Math.imul(n^c.charCodeAt(0),16777619); return n>>>0; };
// Event-derived choice means all seats hear the same reaction, including silence.
// Cosmetic randomness never shares the engine's random stream.
export function reactionFor(skinId, scenario, eventId) {
  const pool=(SKINS.find(s=>s.id===skinId)?.reactions || REACTION_POOLS)[scenario];
  if(!pool?.length)return null;
  const seed=hash(`${eventId}:${scenario}`);
  if(scenario==='play' && seed%100>=42)return null;
  return pool[seed%pool.length];
}
