import test from 'node:test';
import assert from 'node:assert/strict';
import { act, botAction, createGame, upgradeGame, viewFor } from './engine.js';
import { PERSONALITIES, botDelay } from './bot-personalities.js';

const seed = n => () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; };
const seats = Array.from({ length: 4 }, (_, i) => ({ id: i ? `bot-${i}` : 'you', name: i ? `Bot ${i}` : 'You', bot: i > 0 }));

test('bot personalities are assigned, preserved, and kept private', () => {
  const assigned = new Set();
  for (let i = 1; i <= 40; i++) {
    const game = createGame(seats, seed(i));
    game.players.filter(player => player.bot).forEach(player => assigned.add(player.personality));
    for (const seat of seats) {
      for (const player of viewFor(game, seat.id).players) assert.equal(Object.hasOwn(player, 'personality'), false);
    }
    assert.deepEqual(upgradeGame(game).players.map(player => player.personality), game.players.map(player => player.personality));
  }
  assert.equal(assigned.size, Object.keys(PERSONALITIES).length);
});

test('personalities make distinct legal decisions and use distinct pacing', () => {
  const game = createGame(seats, seed(7));
  game.rank = 'A';
  game.players[0].hand = ['A', 'A', 'K', 'Q', 'Q'];
  const view = viewFor(game, 'you');
  const bluffs = {};

  for (const personality of Object.keys(PERSONALITIES)) {
    bluffs[personality] = 0;
    const rng = seed(31);
    for (let i = 0; i < 1000; i++) {
      const move = botAction(view, rng, personality);
      assert.equal(move.type, 'play');
      assert.ok(move.cards.length >= 1 && move.cards.length <= 3);
      if (move.cards.some(index => view.players[0].hand[index] !== 'A')) bluffs[personality]++;
      assert.doesNotThrow(() => act(game, 'you', move));
    }
  }

  assert.ok(bluffs.trickster > bluffs.survivor * 2);
  assert.ok(botDelay({ personality: 'pacer', risks: 0 }, () => .5) < botDelay({ personality: 'survivor', risks: 0 }, () => .5));
});
