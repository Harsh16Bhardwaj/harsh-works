import test from 'node:test';
import assert from 'node:assert/strict';
import { act, armRisk, readyRisk, fireRisk, resolveRisk, bluffEstimate, botAction, createGame, mustChallenge, nextRound, upgradeGame, validSave, viewFor } from './engine.js';
import { createRoomHandler, roomRequest } from './rooms.js';
import { memoryRoomStore } from './room-store.js';
import { phaseDelay, TIMING } from './timing.js';

const seats = ['you', 'one', 'two', 'three'].map((id, i) => ({ id, name: id, bot: i > 0 }));
const seed = (n) => () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; };

test('deal contains exactly six of each rank and two jokers; private views reveal no other hand', () => {
  const game = createGame(seats, seed(1));
  const cards = game.players.flatMap((p) => p.hand);
  for (const rank of ['A', 'K', 'Q']) assert.equal(cards.filter((c) => c === rank).length, 6);
  assert.equal(cards.filter((c) => c === 'J').length, 2);
  const view = viewFor(game, 'you');
  assert.equal(view.players[0].hand.length, 5);
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

test('a joker counts as the table rank; a wrong accusation penalizes the challenger', () => {
  let game = createGame(seats, seed(4));
  game.rank = 'A'; game.players[0].hand = ['A', 'J'];
  game = act(game, 'you', { type: 'play', cards: [0, 1] });
  assert.equal('cards' in viewFor(game, 'one').last, false);
  game = act(game, 'one', { type: 'challenge' });
  assert.equal(game.reveal.liar, false); assert.equal(game.players[1].risks, 0);
  assert.equal(game.reveal.eliminated, undefined);
  assert.equal(game.players[0].score, 120); assert.equal(game.phase, 'reveal');
});

test('one wrong rank exposes a lie and only the challenge loser faces the draw', () => {
  let game = createGame(seats, seed(9));
  game.rank = 'A'; game.players[0].hand = ['A', 'Q'];
  game = act(game, 'you', { type: 'play', cards: [0, 1] });
  game = act(game, 'one', { type: 'challenge' });
  assert.equal(game.reveal.liar, true); assert.equal(game.players[0].alive, true);
  game.players[0].losingDraw = 1;
  game = resolveRisk(fireRisk(readyRisk(armRisk(game)), 'you'), () => 0);
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
      else if (game.phase === 'loading') game = readyRisk(game);
      else if (game.phase === 'armed') game = fireRisk(game, game.reveal.loserId);
      else if (game.phase === 'firing') game = resolveRisk(game, rng);
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

test('room credentials, host permissions, room capacity and stale moves are enforced', async () => {
  const host = await roomRequest({ type: 'create', name: 'Host' });
  const guest = await roomRequest({ type: 'join', code: host.code, name: 'Guest' });
  assert.equal(guest.seats.length, 2);
  await assert.rejects(() => roomRequest({ type: 'poll', code: host.code }, 'wrong-token'));
  await assert.rejects(() => roomRequest({ type: 'start', code: host.code }, guest.token));
  const started = await roomRequest({ type: 'start', code: host.code }, host.token);
  assert.equal(started.game.players.length, 4);
  assert.ok(started.game.players.filter((p) => p.id !== host.playerId).every((p) => !('hand' in p)));
  assert.ok(!JSON.stringify(started).includes(guest.token));
  await assert.rejects(() => roomRequest({ type: 'join', code: host.code }));
  const moved = await roomRequest({ type: 'move', code: host.code, revision: 0, action: { type: 'play', cards: [0] } }, host.token);
  assert.equal(moved.game.revision, 1);
  await assert.rejects(() => roomRequest({ type: 'move', code: host.code, revision: 0, action: { type: 'play', cards: [0] } }, host.token));
  const g = await roomRequest({ type: 'poll', code: host.code }, guest.token);
  assert.equal(g.game.players.find((p) => p.id === guest.playerId).hand.length, 5);
  assert.ok(!('hand' in g.game.players[0]));
});

test('lobby transfers host on leave and limits seats to four', async () => {
  const host = await roomRequest({ type: 'create' });
  const guest = await roomRequest({ type: 'join', code: host.code });
  await roomRequest({ type: 'join', code: host.code }); await roomRequest({ type: 'join', code: host.code });
  await assert.rejects(() => roomRequest({ type: 'join', code: host.code }));
  await roomRequest({ type: 'leave', code: host.code }, host.token);
  assert.equal((await roomRequest({ type: 'poll', code: host.code }, guest.token)).host, true);
});


test('only the losing player can fire, and the result is secret until resolution', () => {
  let game=createGame(seats,seed(3));game.rank='A';game.players[0].hand=['Q'];
  game=act(game,'you',{type:'play',cards:[0]});game=act(game,'one',{type:'challenge'});
  assert.throws(()=>fireRisk(game,'you'));
  game=readyRisk(armRisk(game));assert.throws(()=>fireRisk(game,'one'));
  game.players[0].losingDraw=1;
  game=fireRisk(game,'you');assert.equal(viewFor(game,'one').reveal.eliminated,undefined);
  assert.equal(game.players[0].alive,true);assert.throws(()=>fireRisk(game,'you'));
  game=resolveRisk(game,()=>0);assert.equal(game.reveal.eliminated,true);
  assert.throws(()=>resolveRisk(game));
});

test('each player has one hidden losing draw and the sixth can never be safe', () => {
  let game = createGame(seats, seed(12));
  game.players[0].losingDraw = 6;
  for (let draw = 1; draw <= 6; draw++) {
    game.phase = 'firing'; game.reveal = { loserId: 'you' };
    game = resolveRisk(game);
    assert.equal(game.players[0].alive, draw < 6, `draw ${draw}`);
  }
  const hidden = viewFor(createGame(seats, seed(4)), 'one');
  assert.ok(hidden.players.every(player => !('losingDraw' in player)));
  const legacy = createGame(seats, seed(8));
  delete legacy.players[0].losingDraw; legacy.players[0].risks = 6;
  assert.equal(upgradeGame(legacy, () => .9).players[0].alive, false);
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

test('concurrent joins preserve all seats and concurrent moves apply only once', async () => {
  const store = memoryRoomStore();
  const first = createRoomHandler(store), second = createRoomHandler(store);
  const host = await first({ type: 'create' });
  const joins = await Promise.allSettled(Array.from({ length: 4 }, (_, i) => second({ type: 'join', code: ` ${host.code.toLowerCase()} `, name: `Guest ${i}` })));
  assert.equal(joins.filter(r => r.status === 'fulfilled').length, 3);
  const lobby = await first({ type: 'poll', code: host.code }, host.token);
  assert.equal(new Set(lobby.seats.map(s => s.id)).size, 4);
  await first({ type: 'start', code: host.code }, host.token);
  const move = { type: 'move', code: host.code, revision: 0, action: { type: 'play', cards: [0] } };
  const moves = await Promise.allSettled([first(move, host.token), second(move, host.token)]);
  assert.equal(moves.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal((await second({ type: 'poll', code: host.code }, host.token)).game.revision, 1);
});

test('bots wait five seconds; late and simultaneous polls advance only one turn', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: 100000 });
  const request = createRoomHandler(memoryRoomStore());
  const host = await request({ type: 'create' });
  const guest = await request({ type: 'join', code: host.code });
  await request({ type: 'start', code: host.code }, host.token);
  await request({ type: 'move', code: host.code, revision: 0, action: { type: 'play', cards: [0] } }, host.token);
  const botTurn = await request({ type: 'move', code: host.code, revision: 1, action: { type: 'play', cards: [0] } }, guest.token);
  assert.equal(botTurn.due - Date.now(), 5000);
  t.mock.timers.tick(4999);
  assert.equal((await request({ type: 'poll', code: host.code }, host.token)).game.revision, 2);
  t.mock.timers.tick(60000);
  const polls = await Promise.all([request({ type: 'poll', code: host.code }, host.token), request({ type: 'poll', code: host.code }, guest.token)]);
  assert.ok(polls.every(p => p.game.revision === 3));
  assert.ok(polls[0].due > Date.now(), 'Late reconnect must not fast-forward the whole table');
});

test('loading blocks an early draw and each suspense stage has its own deadline', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: 100000 });
  const request = createRoomHandler(memoryRoomStore());
  const host = await request({ type: 'create' }), guest = await request({ type: 'join', code: host.code });
  await request({ type: 'start', code: host.code }, host.token);
  await request({ type: 'move', code: host.code, revision: 0, action: { type: 'play', cards: [0] } }, host.token);
  const reveal = await request({ type: 'move', code: host.code, revision: 1, action: { type: 'challenge' } }, guest.token);
  assert.equal(reveal.due - Date.now(), TIMING.reveal);
  t.mock.timers.tick(TIMING.reveal);
  const loading = await request({ type: 'poll', code: host.code }, host.token);
  assert.equal(loading.game.phase, 'loading');
  const loser = loading.game.reveal.loserId === host.playerId ? host : guest;
  await assert.rejects(request({ type: 'move', code: host.code, revision: loading.game.revision, action: { type: 'fire' } }, loser.token));
  t.mock.timers.tick(TIMING.loading);
  const armed = await request({ type: 'poll', code: host.code }, host.token);
  assert.equal(armed.game.phase, 'armed');
  const firing = await request({ type: 'move', code: host.code, revision: armed.game.revision, action: { type: 'fire' } }, loser.token);
  assert.equal(firing.due - Date.now(), TIMING.firing);
  assert.equal(firing.game.reveal.eliminated, undefined);
  t.mock.timers.tick(TIMING.firing - 1);
  assert.equal((await request({ type: 'poll', code: host.code }, host.token)).game.phase, 'firing');
  t.mock.timers.tick(1);
  const result = await request({ type: 'poll', code: host.code }, host.token);
  assert.equal(result.game.phase, 'resolved');
  assert.equal(result.due - Date.now(), TIMING.resolved);
  assert.equal(phaseDelay({ phase: 'playing', players: [{ bot: true }], turn: 0 }, () => 0), 5000);
  assert.equal(phaseDelay({ phase: 'playing', players: [{ bot: true }], turn: 0 }, () => .9999), 5000);
});

test('turns always move clockwise and only skip players who cannot act', () => {
  let game=createGame(seats,seed(31));game.rank='A';
  game.players.forEach(player=>{player.hand=['A','K','Q','J'];});
  for(const [actor,next] of [['you','one'],['one','two'],['two','three'],['three','you']]) {
    game=act(game,actor,{type:'play',cards:[0]});
    assert.equal(game.players[game.turn].id,next);
  }
  game.players[1].alive=false;game.players[1].hand=[];game.turn=0;
  game=act(game,'you',{type:'play',cards:[0]});
  assert.equal(game.players[game.turn].id,'two');
});

test('rooms expire after inactivity and independent processes do not share memory', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: 100000 });
  const request = createRoomHandler(memoryRoomStore());
  const host = await request({ type: 'create' });
  await assert.rejects(createRoomHandler(memoryRoomStore())({ type: 'join', code: host.code }), /not found/);
  t.mock.timers.tick(2 * 60 * 60 * 1000 + 1);
  await assert.rejects(request({ type: 'join', code: host.code }), /expired/);
});
