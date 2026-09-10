export const SKINS = [
  { id:0, name:'Desert Fox', title:'The Instigator', cost:0 },
  { id:1, name:'Iron Raven', title:'The Watcher', cost:0 },
  { id:2, name:'Verdant Unit', title:'The Calculator', cost:0 },
  { id:3, name:'Veiled Oracle', title:'The Unreadable', cost:0 },
  { id:4, name:'Ember Jackal', title:'The Firebrand', cost:0 },
  { id:5, name:'Frost Corvid', title:'The Cold Read', cost:250 },
  { id:6, name:'Solar Automaton', title:'The House Edge', cost:450 },
  { id:7, name:'Crimson Seer', title:'The Last Word', cost:700 },
  { id:8, name:'Habibi', title:'The Bazaar Bluff', cost:1000, requiredWins:10 },
  { id:9, name:'Modiji', title:'The Royal Gambit', cost:900 },
  { id:10, name:'Ravi Kishan', title:'The Dramatic Tell', cost:850 },
];

export const ACTIVE_SKINS = SKINS;
export const skinName = id => SKINS.find(skin => skin.id === Number(id))?.name || SKINS[0].name;

// Replace cue entries with { id, src, caption } when recorded assets arrive.
export const REACTION_POOLS = {
  play: [{id:'pop',cue:'meme-pop',caption:'Pop!'}, {id:'hmm',cue:'meme-hmm',caption:'Hmm…'}],
  challenge: [{id:'sting',cue:'meme-sting',caption:'Hold up!'}],
  threatened: [{id:'faaa',cue:'meme-faaa',caption:'Faaaa!'}],
  death: [{id:'sad',cue:'meme-sad',caption:'Womp womp.'}],
  survival: [{id:'boing',cue:'meme-boing',caption:'Boing!'}],
};

SKINS.forEach(skin => {
  skin.assetVersion = 1;
  skin.model = {type:'procedural-low-poly',rig:'seated-v1'};
  skin.reactions = REACTION_POOLS;
});

export const normalizeSkin = value => {
  const skin=Number(value);
  return Number.isInteger(skin)&&SKINS.some(item=>item.id===skin)?skin:0;
};
