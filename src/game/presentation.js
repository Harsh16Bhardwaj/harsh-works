// One contact timestamp drives the mallet, reactions and sound.
export const CONTACT_SECONDS = 0.28;
export const clamp01 = value => Math.max(0, Math.min(1, value));
export const damp = (speed, dt) => 1 - Math.exp(-speed * dt);

export function tableSeats(players) {
  const occupied = players.map((player, slot) => player ? slot : -1).filter(slot => slot >= 0);
  const ordered = occupied.includes(3) ? [3, ...occupied.filter(slot => slot !== 3)] : occupied;
  const seats = Array(4).fill(null);
  ordered.forEach((slot, index) => {
    const angle = Math.PI / 4 + index * Math.PI * 2 / ordered.length;
    const x = Math.cos(angle) * 3.08, z = Math.sin(angle) * 1.91;
    seats[slot] = { x, z, angle, facing: Math.atan2(-x, -z) };
  });
  return seats;
}

export function hammerPose(phase, elapsed, eliminated, reduced = false) {
  const result = phase === 'resolved' || phase === 'finished';
  const contact = result && (reduced || elapsed >= CONTACT_SECONDS);
  let angle = 1.3, lift = 0, squash = 0;
  if (phase === 'loading') { const t = clamp01(elapsed / .75); angle = .65 + .65 * (1 - (1 - t) ** 3); lift = t * .13; }
  if (phase === 'armed' || phase === 'firing') { angle = 1.3; lift = .13; }
  if (result) {
    const t = reduced ? 1 : clamp01(elapsed / CONTACT_SECONDS);
    // Accelerate into the contact pose, instead of easing to a stop above it.
    angle = 1.3 * (1 - t ** 3); lift = .13 * (1 - t ** 3);
    if (contact) {
      const after = Math.max(0, elapsed - CONTACT_SECONDS);
      angle = reduced ? 0 : Math.sin(Math.min(1, after / .52) * Math.PI) * (eliminated ? .12 : .48);
      squash = eliminated || reduced ? 0 : Math.max(0, Math.cos(after * 11)) * Math.exp(-after * 6) * .5;
      if (!eliminated && after > .52 && !reduced) {
        const retreat = clamp01((after-.52)/.55);
        angle = .95 * (retreat*retreat*(3-2*retreat)); lift = retreat*.14;
      }
    }
  }
  return { angle, lift, contact, squash, result };
}
