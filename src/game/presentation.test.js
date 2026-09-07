import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_SECONDS, hammerPose, tableSeats, damp } from './presentation.js';

test('occupied seats are equally distributed for two to four players', () => {
  for (const count of [2, 3, 4]) {
    const players = Array.from({ length: 4 }, (_, i) => i < count - 1 || i === 3 ? { id: i } : null);
    const seats = tableSeats(players).filter(Boolean).sort((a,b) => a.angle-b.angle);
    assert.equal(seats.length, count);
    seats.forEach((seat,i) => {
      const next = seats[(i+1)%count].angle + (i === count-1 ? Math.PI*2 : 0);
      assert.ok(Math.abs(next-seat.angle-Math.PI*2/count)<1e-9);
      assert.ok(Math.abs(Math.sin(seat.facing)*seat.z-Math.cos(seat.facing)*seat.x)<1e-9);
    });
  }
});

test('final and intermediate eliminations retain the target until actual contact', () => {
  for (const phase of ['resolved', 'finished']) {
    assert.equal(hammerPose(phase, CONTACT_SECONDS-.001, true).contact, false);
    assert.equal(hammerPose(phase, CONTACT_SECONDS, true).contact, true);
    assert.equal(hammerPose(phase, CONTACT_SECONDS, true).angle, 0);
    assert.equal(hammerPose(phase, 0, true, true).contact, true);
  }
});

test('camera damping produces the same progress at 30 and 60 frames per second', () => {
  const run = fps => { let x=0; for(let i=0;i<fps;i++) x+=(1-x)*damp(6,1/fps); return x; };
  assert.ok(Math.abs(run(30)-run(60))<1e-9);
});
