import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, viewFor, act, upgradeGame, botAction } from './engine.js';
import { PERSONALITIES, botDelay } from './bot-personalities.js';
import { ACTIVE_SKINS, skinName } from './skins.js';
import { reactionFor } from './reactions.js';
import { makeActor } from './stage-models.js';

const seed = n => () => { n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296; };
const seats = Array.from({length:4},(_,i)=>({id:i?'bot-'+i:'you',name:'Account '+i,bot:i>0}));

test('random private personas survive saves and never enter any seat projection',()=>{
  const assigned=new Set();
  for(let i=1;i<=40;i++) {
    const game=createGame(seats,seed(i));
    game.players.filter(p=>p.bot).forEach(p=>assigned.add(p.personality));
    for(const seat of seats)for(const p of viewFor(game,seat.id).players) {
      assert.ok(!Object.hasOwn(p,'personality'));assert.ok(!Object.hasOwn(p,'style'));assert.ok(!Object.hasOwn(p,'losingDraw'));
    }
    assert.deepEqual(upgradeGame(game).players.map(p=>p.personality),game.players.map(p=>p.personality));
    assert.equal(new Set(game.players.map(p=>p.character)).size,4);
    assert.ok(game.players.every(p=>ACTIVE_SKINS.some(s=>s.id===p.character)&&p.name===skinName(p.character)));
  }
  assert.equal(assigned.size,5);
});

test('public events contain observable actions, never played card ranks',()=>{
  const game=createGame(seats,seed(4));
  const next=act(game,'you',{type:'play',cards:[0]});
  const event=viewFor(next,'bot-1').events.at(-1);
  assert.equal(event.count,1);assert.equal(event.player,'you');
  assert.ok(!Object.hasOwn(event,'cards'));assert.ok(event.elapsedMs>=0);
});

test('personas have meaningfully different behavior without illegal actions',()=>{
  const game=createGame(seats,seed(7));game.rank='A';game.players[0].hand=['A','A','K','Q','Q'];
  const view=viewFor(game,'you'), counts={};
  for(const persona of Object.keys(PERSONALITIES)) {
    counts[persona]=0;const rng=seed(31);
    for(let i=0;i<1000;i++) {
      const move=botAction(view,rng,persona);
      assert.equal(move.type,'play');assert.ok(move.cards.length>=1&&move.cards.length<=3);
      if(move.cards.some(index=>view.players[0].hand[index]!=='A'))counts[persona]++;
      assert.doesNotThrow(()=>act(game,'you',move));
    }
  }
  assert.ok(counts.trickster>counts.survivor*2);
  assert.ok(botDelay({personality:'pacer',risks:0},()=>.5)<botDelay({personality:'survivor',risks:0},()=>.5));
});

test('changing hidden opponents cards cannot change a bot decision',()=>{
  const game=createGame(seats,seed(11));const altered=structuredClone(game);
  altered.players.slice(1).forEach(p=>{p.hand=p.hand.map(()=> 'J');p.losingDraw=6;p.personality='reader';});
  for(const persona of Object.keys(PERSONALITIES))assert.deepEqual(botAction(viewFor(game,'you'),seed(3),persona),botAction(viewFor(altered,'you'),seed(3),persona));
});

test('reaction choices are synchronized and card chatter leaves silence',()=>{
  let spoken=0;
  for(let i=0;i<100;i++) {const a=reactionFor(0,'play',`event-${i}`);assert.deepEqual(a,reactionFor(0,'play',`event-${i}`));if(a)spoken++;}
  assert.ok(spoken>10&&spoken<80);
  for(const skin of ACTIVE_SKINS)for(const scenario of ['challenge','threatened','death','survival'])assert.ok(reactionFor(skin.id,scenario,'one')?.cue);
});

test('all low-poly skins expose the shared seated animation contract',()=>{
  for(const skin of ACTIVE_SKINS) {
    const actor=makeActor({x:0,z:0,facing:0},skin.id);
    assert.equal(actor.arms.length,2);assert.equal(actor.eyes.length,2);
    assert.ok(actor.cards);assert.ok(actor.head);assert.ok(actor.neck);assert.ok(actor.torso);
    assert.ok(actor.bodyMeshes.length>0&&actor.bodyMeshes.every(mesh=>mesh.material.flatShading));
    const geometries=new Set(),materials=new Set();actor.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
  }
});
