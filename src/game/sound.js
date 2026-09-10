// Original procedural ambience: no downloaded music or third-party recordings.
export function createSoundscape() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain(); master.gain.value = .12;
  const limiter = ctx.createDynamicsCompressor(); limiter.threshold.value=-10; limiter.knee.value=12; limiter.ratio.value=5;
  master.connect(limiter); limiter.connect(ctx.destination);
  const ambience = ctx.createGain(); ambience.gain.value=1; ambience.connect(master);
  const nodes = [];
  const clips = new Map();
  let activeReaction = null, reactionGeneration = 0;
  for (const hz of [55, 82.41]) {
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = hz; gain.gain.value = .035;
    osc.connect(gain); gain.connect(ambience); osc.start(); nodes.push(osc);
    const lfo = ctx.createOscillator(); const depth = ctx.createGain();
    lfo.frequency.value = .09 + hz / 2500; depth.gain.value = .035;
    lfo.connect(depth); depth.connect(gain.gain); lfo.start(); nodes.push(lfo);
  }
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const data = buffer.getChannelData(0); let brown = 0;
  for (let i=0;i<data.length;i++) { brown=(brown+(Math.random()*2-1)*.025)/1.025;data[i]=brown*3; }
  const wind=ctx.createBufferSource();wind.buffer=buffer;wind.loop=true;
  const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=450;
  const windGain=ctx.createGain();windGain.gain.value=.045;wind.connect(filter);filter.connect(windGain);windGain.connect(ambience);wind.start();nodes.push(wind);
  return {
    setVolume(value) { ctx.resume(); master.gain.setTargetAtTime(value,ctx.currentTime,.15); },
    pause() { ctx.suspend(); },
    resume() { ctx.resume(); },
    reaction(entry, options = {}) {
      if(!entry)return;
      const generation=++reactionGeneration;
      activeReaction?.stop(); activeReaction=null;
      if(!entry.src){this.cue(entry.cue,options);return;}
      // Lazy, cached asset adapter. Recorded voices can replace synthesized cues.
      if(!clips.has(entry.src))clips.set(entry.src,fetch(entry.src).then(r=>{if(!r.ok)throw new Error('Audio unavailable');return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).catch(()=>null));
      clips.get(entry.src).then(buffer=>{
        if(!buffer||generation!==reactionGeneration||ctx.state==='closed')return;
        const source=ctx.createBufferSource();source.buffer=buffer;source.connect(master);
        activeReaction=source;source.onended=()=>{source.disconnect();if(activeReaction===source)activeReaction=null;};source.start();
      });
    },
    cue(kind, {pan=0, delay=0, heavy=true} = {}) {
      ctx.resume();
      const now=ctx.currentTime+delay;
      const position=ctx.createStereoPanner();position.pan.value=Math.max(-.7,Math.min(.7,pan));position.connect(master);
      let pending=0;
      const cleanup=()=>{pending--;if(pending===0)position.disconnect();};
      if(['challenge','detective','hammer-rise','impact'].includes(kind)) {
        ambience.gain.cancelScheduledValues(ctx.currentTime);
        ambience.gain.setTargetAtTime(.22,ctx.currentTime,.09);
        ambience.gain.setTargetAtTime(1,now+(kind==='impact'?.7:1.5),.5);
      }
      const pulse=(at,from,to,duration=.18,level=.24,type='triangle')=>{
        const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;
        osc.frequency.setValueAtTime(from,at);osc.frequency.exponentialRampToValueAtTime(to,at+duration);
        gain.gain.setValueAtTime(level,at);gain.gain.exponentialRampToValueAtTime(.001,at+duration);
        osc.connect(gain);gain.connect(position);pending++;osc.onended=()=>{osc.disconnect();gain.disconnect();cleanup();};osc.start(at);osc.stop(at+duration+.02);
      };
      const noise=(at,duration=.12,level=.35,frequency=1200)=>{
        const length=Math.ceil(ctx.sampleRate*duration),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
        for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
        const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.8;
        gain.gain.setValueAtTime(level,at);gain.gain.exponentialRampToValueAtTime(.001,at+duration);
        source.connect(filter);filter.connect(gain);gain.connect(position);pending++;source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();cleanup();};source.start(at);
      };
      if(kind==='meme-faaa') { pulse(now,310,170,.60,.10,'sawtooth');pulse(now,640,340,.56,.045,'triangle');noise(now,.13,.10,1100); }
      else if(kind==='meme-sad') { [233,220,207,196].forEach((hz,i)=>pulse(now+i*.17,hz,hz*.92,.24,.12,'triangle')); }
      else if(kind==='meme-boing') { pulse(now,130,650,.16,.18);pulse(now+.14,650,210,.30,.14); }
      else if(kind==='meme-sting') { pulse(now,110,55,.35,.22,'sine');noise(now,.13,.16,700); }
      else if(kind==='meme-hmm') { pulse(now,180,230,.28,.10,'triangle');pulse(now+.20,230,180,.22,.08); }
      else if(kind==='meme-pop') { pulse(now,750,120,.095,.16,'sine'); }
      else if(kind==='start') { pulse(now,294,294,.16,.28);pulse(now+.19,392,392,.13,.26);pulse(now+.36,440,440,.13,.27);pulse(now+.55,587,587,.34,.34);noise(now+.56,.18,.08,1900); }
      else if(kind==='deal') { noise(now,.09,.28,1500);noise(now+.1,.08,.22,1050);pulse(now+.03,520,300,.1,.12); }
      else if(kind==='challenge'||kind==='detective') { pulse(now,196,155,.38,.24,'triangle');pulse(now+.22,233,174,.42,.2,'triangle');pulse(now+.5,147,82,.65,.22,'sine'); }
      else if(kind==='hammer-rise') { noise(now,.65,.17,380);pulse(now,72,110,.6,.12,'sine');noise(now+.35,.18,.08,1200); }
      else if(kind==='swing') { noise(now,.28,.32,850);pulse(now,230,65,.28,.12,'triangle'); }
      else if(kind==='impact') {
        noise(now,.11,heavy?.6:.32,heavy?240:520);pulse(now,heavy?82:140,heavy?30:55,.36,heavy?.52:.28,'sine');
        pulse(now+.015,420,380,.34,.055,'sine');pulse(now+.018,670,610,.22,.035,'sine');noise(now+.09,.16,.1,1600);
      }
      else if(kind==='load') { for(let i=0;i<5;i++)pulse(now+i*.22,900-i*90,430,.08,.16,'square');noise(now+.04,.45,.13,1800); }
      else if(kind==='ready') { noise(now,.045,.13,1900);pulse(now,230,150,.13,.1,'triangle'); }
      else if(kind==='fire') { pulse(now,72,38,.25,.4,'sine');pulse(now+.38,67,34,.3,.34,'sine'); }
      else if(kind==='dead') { for(let i=0;i<4;i++)noise(now+i*.085,.12,.12/(1+i*.3),550+i*270);pulse(now,90,40,.6,.12,'sine'); }
      else if(kind==='safe') { pulse(now,170,310,.16,.16,'sine');noise(now+.15,.16,.07,700); }
      else pulse(now,620,220,.11,.16);
    },
    dispose() { reactionGeneration++;activeReaction?.stop();nodes.forEach(n=>n.stop());ctx.close(); },
  };
}
