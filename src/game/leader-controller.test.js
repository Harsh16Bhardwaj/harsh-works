import test from 'node:test';
import assert from 'node:assert/strict';
import { createLeaderController } from './leader-controller.js';
import { actionIntent, readRoomMessage } from './room-protocol.js';
import { rememberName, rememberedName } from './room-storage.js';

const seed = n => () => { n=(n*1664525+1013904223)>>>0;return n/4294967296; };

test('room protocol rejects malformed messages and creates complete intentions', () => {
  const intent=actionIntent({roomId:'room',epoch:1,seatId:'host',actionId:'a1',revision:0,action:{type:'play',cards:[0]}});
  assert.equal(readRoomMessage(JSON.stringify(intent)).type,'intent');
  assert.throws(()=>readRoomMessage('{'));
  assert.throws(()=>readRoomMessage({protocol:99,type:'intent'}));
});

test('leader owns state, hides other hands, and deduplicates actions', () => {
  const controller=createLeaderController({roomId:'room',leader:{id:'host',name:'Host'},rng:seed(7),scheduleTimer:()=>0,cancelTimer:()=>{}});
  controller.addSeat({id:'guest',name:'Guest'});controller.start();
  const host=controller.viewFor('host'),guest=controller.viewFor('guest');
  assert.equal(host.game.players.find(player=>player.id==='host').hand.length,5);
  assert.ok(host.game.players.filter(player=>player.id!=='host').every(player=>!('hand' in player)));
  assert.equal(guest.game.players.find(player=>player.id==='guest').hand.length,5);
  const first=controller.intent({seatId:'host',actionId:'once',revision:0,action:{type:'play',cards:[0]}});
  const duplicate=controller.intent({seatId:'host',actionId:'once',revision:0,action:{type:'play',cards:[0]}});
  assert.equal(first.game.revision,1);assert.equal(duplicate.game.revision,1);
  controller.dispose();
});

test('leader runs a bot turn on the client and leader restore starts a new epoch', () => {
  const callbacks=[];const controller=createLeaderController({roomId:'room',leader:{id:'host',name:'Host'},rng:seed(8),scheduleTimer:callback=>{callbacks.push(callback);return callbacks.length;},cancelTimer:()=>{}});
  controller.start();controller.intent({seatId:'host',actionId:'first',revision:0,action:{type:'play',cards:[0]}});
  assert.ok(callbacks.length);callbacks.at(-1)();
  assert.equal(controller.snapshot().game.revision,2);
  const saved=controller.snapshot();controller.restore(saved);assert.equal(controller.snapshot().epoch,2);
  controller.dispose();
});

test('friend rooms can opt out of bot fillers and require two human seats', () => {
  const controller=createLeaderController({roomId:'room',leader:{id:'host',name:'Host'},rng:seed(10),scheduleTimer:()=>0,cancelTimer:()=>{}});
  controller.setAllowBots(false);
  assert.equal(controller.snapshot().allowBots,false);
  assert.throws(()=>controller.start(),/Invite at least one friend/);
  controller.addSeat({id:'guest',name:'Guest'});
  controller.start();
  assert.equal(controller.snapshot().game.players.length,2);
  assert.ok(controller.snapshot().game.players.every(player=>!player.bot));
  controller.dispose();
});

test('player name is remembered without storing empty values', () => {
  const values=new Map();const storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  assert.equal(rememberName('  Harsh  ',storage),true);assert.equal(rememberedName(storage),'Harsh');
  rememberName('',storage);assert.equal(rememberedName(storage),'');
});
