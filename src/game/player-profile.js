import { SKINS, normalizeSkin } from './skins.js';

export const PLAYER_PROFILE_KEY = 'liars-orbit.player-profile.v1';
export const PROFILE_VERSION = 2;
export const STARTING_COINS = 10000;
export const STARTING_RANK_POINTS = 10000;
export const PLACEMENT_REWARDS = {
  1: { coins: 260, points: 100, wagerMultiplier: 2.25 },
  2: { coins: 140, points: 55, wagerMultiplier: 1 },
  3: { coins: 70, points: 25, wagerMultiplier: .35 },
  4: { coins: 35, points: 10, wagerMultiplier: 0 },
};

export function freshProfile() {
  return { version:PROFILE_VERSION, coins:STARTING_COINS, rankPoints:STARTING_RANK_POINTS, wins:10, games:0, owned:[0,1,2,3,4], selected:0, wagers:{}, settled:[] };
}

export function normalizeProfile(value) {
  const base=freshProfile(),source=value&&typeof value==='object'?value:{};
  const legacy=source.version!==PROFILE_VERSION;
  const stat=(key)=>Math.max(0,Math.floor(Number.isFinite(Number(source[key]))?Number(source[key]):base[key]));
  const owned=[...new Set([...base.owned,...(Array.isArray(source.owned)?source.owned:[])].map(normalizeSkin))];
  const selected=owned.includes(normalizeSkin(source.selected))?normalizeSkin(source.selected):0;
  return {
    ...base,
    coins:legacy?Math.max(STARTING_COINS,stat('coins')):stat('coins'),
    rankPoints:legacy?Math.max(STARTING_RANK_POINTS,stat('rankPoints')):stat('rankPoints'),
    wins:legacy?Math.max(10,stat('wins')):stat('wins'),games:stat('games'),
    owned,selected,
    wagers:source.wagers&&typeof source.wagers==='object'?source.wagers:{},
    settled:Array.isArray(source.settled)?source.settled.slice(-50):[],
  };
}

export function loadProfile(storage=globalThis.localStorage) {
  try{return normalizeProfile(JSON.parse(storage.getItem(PLAYER_PROFILE_KEY)||'null'));}catch{return freshProfile();}
}

export function saveProfile(profile,storage=globalThis.localStorage) {
  try{storage.setItem(PLAYER_PROFILE_KEY,JSON.stringify(normalizeProfile(profile)));return true;}catch{return false;}
}

export function skinAccess(profile,skinId) {
  const skin=SKINS.find(item=>item.id===normalizeSkin(skinId));
  if(profile.owned.includes(skin.id))return {owned:true,available:true,skin};
  if((skin.requiredWins||0)>profile.wins)return {owned:false,available:false,skin,reason:`Win ${skin.requiredWins} games`};
  if(profile.coins<skin.cost)return {owned:false,available:false,skin,reason:`Need ${skin.cost-profile.coins} more coins`};
  return {owned:false,available:true,skin};
}

export function buySkin(profile,skinId) {
  const current=normalizeProfile(profile),access=skinAccess(current,skinId);
  if(access.owned)return {profile:current,bought:false,error:null};
  if(!access.available)return {profile:current,bought:false,error:access.reason};
  return {profile:{...current,coins:current.coins-access.skin.cost,owned:[...current.owned,access.skin.id],selected:access.skin.id},bought:true,error:null};
}

export function equipSkin(profile,skinId) {
  const current=normalizeProfile(profile),skin=normalizeSkin(skinId);
  return current.owned.includes(skin)?{...current,selected:skin}:current;
}

export function placeWager(profile,gameId,amount) {
  const current=normalizeProfile(profile);
  if(!gameId||Object.hasOwn(current.wagers,gameId)||current.settled.includes(gameId))return current;
  const stake=Math.max(0,Math.min(current.coins,Math.floor(Number(amount)||0)));
  return {...current,coins:current.coins-stake,wagers:{...current.wagers,[gameId]:stake}};
}

export function settleMatch(profile,gameId,placement) {
  const current=normalizeProfile(profile);
  if(!gameId||current.settled.includes(gameId))return {profile:current,reward:null};
  const place=Math.max(1,Math.min(4,Math.floor(Number(placement)||4)));
  const rule=PLACEMENT_REWARDS[place],stake=Math.max(0,Math.floor(Number(current.wagers[gameId])||0));
  const wagerReturn=Math.floor(stake*rule.wagerMultiplier),reward={placement:place,coins:rule.coins+wagerReturn,points:rule.points,stake,wagerReturn};
  const wagers={...current.wagers};delete wagers[gameId];
  return {profile:{...current,coins:current.coins+reward.coins,rankPoints:current.rankPoints+reward.points,wins:current.wins+(place===1?1:0),games:current.games+1,wagers,settled:[...current.settled,gameId].slice(-50)},reward};
}

export function profileRank(points) {
  if(points>=1500)return 'High Roller';
  if(points>=750)return 'Cardsharp';
  if(points>=300)return 'Bluff Reader';
  return 'New Arrival';
}
