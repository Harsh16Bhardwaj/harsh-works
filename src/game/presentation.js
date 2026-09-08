// One contact timestamp drives the mallet, reactions and sound.
export const CONTACT_SECONDS = 0.28;
export const clamp01 = value => Math.max(0, Math.min(1, value));
export const damp = (speed, dt) => 1 - Math.exp(-speed * dt);

export function tableSeats(players) {
  const occupied = players.map((player, slot) => player ? slot : -1).filter(slot => slot >= 0);
  const ordered = occupied.includes(3) ? [3, ...occupied.filter(slot => slot !== 3)] : occupied;
  const seats = Array(4).fill(null);
  ordered.forEach((slot, index) => {
    // Slots follow the game turn order clockwise: local player, then the player on their right.
    const angle = Math.PI / 4 - index * Math.PI * 2 / ordered.length;
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
      // Commit to the hit. A rebound followed by a second retreat reads as a
      // double strike, so the mallet remains planted for the result beat.
      angle = 0;
      lift = 0;
      squash = eliminated || reduced ? 0 : Math.max(0, Math.cos(after * 11)) * Math.exp(-after * 6) * .5;
    }
  }
  return { angle, lift, contact, squash, result };
}

export function cinematicCameraPose(seat, phase) {
  const close = phase === 'reveal' || phase === 'loading' || phase === 'armed';
  const distance = close ? 3.08 : 4.05;
  const forwardX = Math.sin(seat.facing), forwardZ = Math.cos(seat.facing);
  return {
    close,
    position: {
      x: seat.x + forwardX * distance,
      y: close ? 2.12 : 2.72,
      z: seat.z + forwardZ * distance,
    },
    target: { x: seat.x, y: close ? 1.06 : .98, z: seat.z },
  };
}
