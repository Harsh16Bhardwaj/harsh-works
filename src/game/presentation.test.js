import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { CONTACT_SECONDS, cinematicCameraPose, hammerPose, tableSeats, damp } from './presentation.js';
import { makeHammer } from './stage-models.js';

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

test('turn order is seated clockwise from the local player to the player on their right', () => {
  const seats=tableSeats([{id:'next'},{id:'after'},{id:'last'},{id:'you'}]);
  assert.equal(seats[3].angle,Math.PI/4);
  assert.equal(seats[0].angle,-Math.PI/4);
  assert.equal(seats[1].angle,-Math.PI*3/4);
  assert.equal(seats[2].angle,-Math.PI*5/4);
});

test('final and intermediate eliminations retain the target until actual contact', () => {
  for (const phase of ['resolved', 'finished']) {
    assert.equal(hammerPose(phase, CONTACT_SECONDS-.001, true).contact, false);
    assert.equal(hammerPose(phase, CONTACT_SECONDS, true).contact, true);
    assert.equal(hammerPose(phase, CONTACT_SECONDS, true).angle, 0);
    assert.equal(hammerPose(phase, 0, true, true).contact, true);
  }
});

test('the hammer striking face stops at the actor collision height', () => {
  const contactY=1.77,hammer=makeHammer({x:1,z:1,facing:Math.PI},contactY);
  hammer.pivot.rotation.x=0;hammer.root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(hammer.head);
  assert.ok(Math.abs(bounds.min.y-contactY)<.001);
});

test('hammer commits to one contact without a second directional bounce', () => {
  for (const elapsed of [CONTACT_SECONDS, CONTACT_SECONDS+.15, CONTACT_SECONDS+.6, CONTACT_SECONDS+1.2]) {
    const pose=hammerPose('resolved',elapsed,false);
    assert.equal(pose.angle,0);
    assert.equal(pose.lift,0);
  }
});

test('cinematic camera sits directly in front of every randomized seat', () => {
  const seats=tableSeats([{id:0},{id:1},{id:2},{id:3}]).filter(Boolean);
  for(const seat of seats){
    const pose=cinematicCameraPose(seat,'reveal');
    const dx=pose.position.x-seat.x,dz=pose.position.z-seat.z;
    const distance=Math.hypot(dx,dz);
    assert.ok(Math.abs(distance-3.08)<1e-9);
    assert.ok(Math.abs(dx/distance-Math.sin(seat.facing))<1e-9);
    assert.ok(Math.abs(dz/distance-Math.cos(seat.facing))<1e-9);
    assert.equal(pose.close,true);
  }
});

test('camera damping produces the same progress at 30 and 60 frames per second', () => {
  const run = fps => { let x=0; for(let i=0;i<fps;i++) x+=(1-x)*damp(6,1/fps); return x; };
  assert.ok(Math.abs(run(30)-run(60))<1e-9);
});
