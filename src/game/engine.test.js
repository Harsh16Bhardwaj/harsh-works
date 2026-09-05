import test from 'node:test';
import assert from 'node:assert/strict';
import { act, armRisk, fireRisk, resolveRisk, bluffEstimate, botAction, createGame, mustChallenge, nextRound, validSave, viewFor } from './engine.js';
import { roomRequest } from './rooms.js';

const seats = ['you', 'one', 'two', 'three'].map((id, i) => ({ id, name: id, bot: i > 0 }));
const seed = (n) => () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; };

test('deal contains exactly six of each rank and two jokers; private views reveal no other hand or chamber', () => {
  const game = createGame(seats, seed(1));
  const cards = game.players.flatMap((p) => p.hand);
  for (const rank of ['A', 'K', 'Q']) assert.equal(cards.filter((c) => c === rank).length, 6);
  assert.equal(cards.filter((c) => c === 'J').length, 2);
  const view = viewFor(game, 'you');
  assert.equal(view.players[0].hand.length, 5);
  assert.ok(view.players.every((p) => !('chamber' in p)));
  assert.ok(view.players.slice(1).every((p) => !('hand' in p)));
});

test('rejects out of turn, duplicate, oversized, invalid and nonexistent moves without changing state', () => {
  const game = createGame(seats, seed(3));
  const original = JSON.stringify(game);
  assert.throws(() => act(game, 'one', { type: 'play', cards: [0] }));
  for (const cards of [[], [0, 0], [0, 1, 2, 3], [-1], [5], ['0'], null]) {
    assert.throws(() => act(game, 'you', { type: 'play', cards }));
  }
  assert.throws(() => act(game, 'you', { type: 'challenge' }));
  assert.equal(JSON.stringify(game), original);
});

test('a joker is truthful; a false accusation penalizes challenger and scores defender', () => {
  let game = createGame(seats, seed(4));
  game.rank = 'A'; game.players[0].hand = ['A', 'J']; game.players[1].chamber = 6;
  game = act(game, 'you', { type: 'play', cards: [0, 1] });
  assert.equal('cards' in viewFor(game, 'one').last, false);
  game = act(game, 'one', { type: 'challenge' });
  assert.equal(game.reveal.liar, false); assert.equal(game.players[1].risks, 0);
  assert.equal(game.reveal.eliminated, undefined);
  assert.equal(game.players[0].score, 120); assert.equal(game.phase, 'reveal');
});

test('one wrong rank exposes a bluff, advances only the loser, and eliminates on their fixed chamber', () => {
  let game = createGame(seats, seed(9));
  game.rank = 'A'; game.players[0].hand = ['A', 'Q']; game.players[0].chamber = 1;
  game = act(game, 'you', { type: 'play', cards: [0, 1] });
  game = act(game, 'one', { type: 'challenge' });
  assert.equal(game.reveal.liar, true); assert.equal(game.players[0].alive, true);
  game = resolveRisk(fireRisk(armRisk(game), 'you'));
  assert.equal(game.players[0].alive, false);
  assert.equal(game.players[1].score, 100); assert.equal(game.players[1].risks, 0);
  const next = nextRound(game, seed(2));
  assert.equal(next.players[0].hand.length, 0); assert.equal(next.players[0].risks, 1);
  assert.equal(next.last, null); assert.equal(next.round, 2);
});

test('accepted bluff awards points once; last card holder must challenge', () => {
  let game = createGame(seats, seed(3));
  game.rank = 'A'; game.players[0].hand = ['Q'];
  game = act(game, 'you', { type: 'play', cards: [0] });
  game = act(game, 'one', { type: 'play', cards: [0] });
  assert.equal(game.players[0].score, 35);
  game.players.forEach((p, i) => { if (i !== game.turn) p.hand = []; });
  assert.equal(mustChallenge(game), true);
  assert.throws(() => act(game, game.players[game.turn].id, { type: 'play', cards: [0] }));
});

test('500 seeded full matches terminate, preserve invariants, and award one winner', () => {
  for (let match = 1; match <= 500; match++) {
    const rng = seed(match);
    let game = createGame(seats, rng, String(match));
    let turns = 0;
    while (game.phase !== 'finished' && turns++ < 1000) {
      if (game.phase === 'reveal') game = armRisk(game);
      else if (game.phase === 'armed') game = fireRisk(game, game.reveal.loserId);
      else if (game.phase === 'firing') game = resolveRisk(game);
      else if (game.phase === 'resolved') game = nextRound(game, rng);
      else {
        const player = game.players[game.turn];
        game = act(game, player.id, botAction(viewFor(game, player.id), rng), rng);
      }
      assert.ok(validSave(game));
      assert.ok(game.players.every((p) => p.hand.length <= 5 && p.score >= 0));
    }
    assert.equal(game.phase, 'finished', `Match ${match} stalled`);
    assert.equal(game.players.filter((p) => p.alive).length, 1);
    assert.ok(game.players.find((p) => p.id === game.winner).score >= 500);
  }
});

test('room credentials, host permissions, room capacity and stale moves are enforced', () => {
  const host = roomRequest({ type: 'create', name: 'Host' });
  const guest = roomRequest({ type: 'join', code: host.code, name: 'Guest' });
  assert.equal(guest.seats.length, 2);
  assert.throws(() => roomRequest({ type: 'poll', code: host.code }, 'wrong-token'));
  assert.throws(() => roomRequest({ type: 'start', code: host.code }, guest.token));
  const started = roomRequest({ type: 'start', code: host.code }, host.token);
  assert.equal(started.game.players.length, 4);
  assert.ok(started.game.players.filter((p) => p.id !== host.playerId).every((p) => !('hand' in p)));
  assert.ok(!JSON.stringify(started).includes('chamber'));
  assert.ok(!JSON.stringify(started).includes(guest.token));
  assert.throws(() => roomRequest({ type: 'join', code: host.code }));
  const moved = roomRequest({ type: 'move', code: host.code, revision: 0, action: { type: 'play', cards: [0] } }, host.token);
  assert.equal(moved.game.revision, 1);
  assert.throws(() => roomRequest({ type: 'move', code: host.code, revision: 0, action: { type: 'play', cards: [0] } }, host.token));
  const g = roomRequest({ type: 'poll', code: host.code }, guest.token);
  assert.equal(g.game.players.find((p) => p.id === guest.playerId).hand.length, 5);
  assert.ok(!('hand' in g.game.players[0]));
});

test('lobby transfers host on leave and limits seats to four', () => {
  const host = roomRequest({ type: 'create' });
  const guest = roomRequest({ type: 'join', code: host.code });
  roomRequest({ type: 'join', code: host.code }); roomRequest({ type: 'join', code: host.code });
  assert.throws(() => roomRequest({ type: 'join', code: host.code }));
  roomRequest({ type: 'leave', code: host.code }, host.token);
  assert.equal(roomRequest({ type: 'poll', code: host.code }, guest.token).host, true);
});


test('only the losing player can fire, and the result is secret until resolution', () => {
  let game=createGame(seats,seed(3));game.rank='A';game.players[0].hand=['Q'];game.players[0].chamber=1;
  game=act(game,'you',{type:'play',cards:[0]});game=act(game,'one',{type:'challenge'});
  assert.throws(()=>fireRisk(game,'you'));
  game=armRisk(game);assert.throws(()=>fireRisk(game,'one'));
  game=fireRisk(game,'you');assert.equal(viewFor(game,'one').reveal.eliminated,undefined);
  assert.equal(game.players[0].alive,true);assert.throws(()=>fireRisk(game,'you'));
  game=resolveRisk(game);assert.equal(game.reveal.eliminated,true);
  assert.throws(()=>resolveRisk(game));
});

test('bot suspicion uses cumulative claims and revealed opponent history', () => {
  let game=createGame(seats,seed(5));game.players[0].hand=['A','A','K','Q','Q'];game.rank='A';
  game.last={player:1,count:1,cards:['A']};game.claims=[{player:1,count:1}];
  const low=bluffEstimate(viewFor(game,'you'));
  game.claims.push({player:1,count:3});
  assert.ok(bluffEstimate(viewFor(game,'you'))>low);
  const before=bluffEstimate(viewFor(game,'you'));game.players[1].caught=8;
  assert.ok(bluffEstimate(viewFor(game,'you'))>before);
  const view=viewFor(game,'you');assert.ok(view.players.slice(1).every(p=>!('played' in p)));
});

test('two-human room bots advance on server timers without client polling', async () => {
  const host=roomRequest({type:'create',name:'Host'});const guest=roomRequest({type:'join',code:host.code,name:'Guest'});
  roomRequest({type:'start',code:host.code},host.token);
  roomRequest({type:'move',code:host.code,revision:0,action:{type:'play',cards:[0]}},host.token);
  roomRequest({type:'move',code:host.code,revision:1,action:{type:'play',cards:[0]}},guest.token);
  const raw=globalThis.__liarsOrbitRooms.get(host.code);
  assert.equal(raw.game.players[raw.game.turn].bot,true);
  assert.ok(raw.due-Date.now()<=1150);
  await new Promise(resolve=>setTimeout(resolve,1250));
  assert.ok(raw.game.revision>=3,'Bot stalled without polling');
  clearTimeout(raw.timer);globalThis.__liarsOrbitRooms.delete(host.code);
});
