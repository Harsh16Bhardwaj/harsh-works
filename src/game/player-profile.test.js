import test from 'node:test';
import assert from 'node:assert/strict';
import { buySkin, freshProfile, placeWager, settleMatch, skinAccess } from './player-profile.js';

test('five starter skins are owned and paid skins charge coins',()=>{
  const start=freshProfile();
  assert.deepEqual(start.owned,[0,1,2,3,4]);
  const result=buySkin(start,5);
  assert.equal(result.bought,true);assert.equal(result.profile.coins,9750);assert.ok(result.profile.owned.includes(5));
});

test('Habibi requires ten wins as well as its coin price',()=>{
  const start={...freshProfile(),coins:2000,wins:9};
  assert.equal(skinAccess(start,8).available,false);
  const result=buySkin({...start,wins:10},8);
  assert.equal(result.bought,true);assert.equal(result.profile.coins,1000);
});

test('Modiji is a premium coin unlock without a win gate',()=>{
  const start={...freshProfile(),coins:1000};
  const result=buySkin(start,9);
  assert.equal(result.bought,true);assert.equal(result.profile.coins,100);assert.ok(result.profile.owned.includes(9));
});

test('wagers charge and settle exactly once with placement rewards',()=>{
  const wagered=placeWager(freshProfile(),'game-1',100);
  assert.equal(wagered.coins,9900);
  const first=settleMatch(wagered,'game-1',1);
  assert.equal(first.profile.coins,10385);assert.equal(first.profile.rankPoints,10100);assert.equal(first.profile.wins,11);
  const duplicate=settleMatch(first.profile,'game-1',1);
  assert.equal(duplicate.reward,null);assert.equal(duplicate.profile.coins,10385);
});
