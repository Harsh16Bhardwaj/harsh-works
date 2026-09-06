// Original procedural ambience: no downloaded music or third-party recordings.
export function createSoundscape() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain(); master.gain.value = .12; master.connect(ctx.destination);
  const nodes = [];
  for (const hz of [55, 82.41]) {
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = hz; gain.gain.value = .035;
    osc.connect(gain); gain.connect(master); osc.start(); nodes.push(osc);
    const lfo = ctx.createOscillator(); const depth = ctx.createGain();
    lfo.frequency.value = .09 + hz / 2500; depth.gain.value = .035;
    lfo.connect(depth); depth.connect(gain.gain); lfo.start(); nodes.push(lfo);
  }
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const data = buffer.getChannelData(0); let brown = 0;
  for (let i=0;i<data.length;i++) { brown=(brown+(Math.random()*2-1)*.025)/1.025;data[i]=brown*3; }
  const wind=ctx.createBufferSource();wind.buffer=buffer;wind.loop=true;
  const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=450;
  const windGain=ctx.createGain();windGain.gain.value=.045;wind.connect(filter);filter.connect(windGain);windGain.connect(master);wind.start();nodes.push(wind);
  return {
    setVolume(value) { ctx.resume(); master.gain.setTargetAtTime(value,ctx.currentTime,.15); },
    pause() { ctx.suspend(); },
    resume() { ctx.resume(); },
    cue(kind) {
      ctx.resume();
      const now=ctx.currentTime;
      const pulse=(at,from,to,duration=.18,level=.24,type='triangle')=>{
        const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;
        osc.frequency.setValueAtTime(from,at);osc.frequency.exponentialRampToValueAtTime(to,at+duration);
        gain.gain.setValueAtTime(level,at);gain.gain.exponentialRampToValueAtTime(.001,at+duration);
        osc.connect(gain);gain.connect(master);osc.start(at);osc.stop(at+duration+.02);
      };
      const noise=(at,duration=.12,level=.35,frequency=1200)=>{
        const length=Math.ceil(ctx.sampleRate*duration),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
        for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
        const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.8;
        gain.gain.setValueAtTime(level,at);gain.gain.exponentialRampToValueAtTime(.001,at+duration);
        source.connect(filter);filter.connect(gain);gain.connect(master);source.start(at);
      };
      if(kind==='start') { pulse(now,294,294,.16,.28);pulse(now+.19,392,392,.13,.26);pulse(now+.36,440,440,.13,.27);pulse(now+.55,587,587,.34,.34);noise(now+.56,.18,.08,1900); }
      else if(kind==='deal') { noise(now,.09,.28,1500);noise(now+.1,.08,.22,1050);pulse(now+.03,520,300,.1,.12); }
      else if(kind==='challenge'||kind==='detective') { pulse(now,196,155,.38,.24,'triangle');pulse(now+.22,233,174,.42,.2,'triangle');pulse(now+.5,147,82,.65,.22,'sine'); }
      else if(kind==='hammer-rise') { pulse(now,72,145,.9,.2,'sine');pulse(now+.18,96,190,.85,.15,'triangle');noise(now,.65,.055,520); }
      else if(kind==='impact') { noise(now,.2,.52,260);pulse(now,88,32,.42,.55,'sine');pulse(now+.04,180,44,.28,.28,'sawtooth'); }
      else if(kind==='load') { for(let i=0;i<5;i++)pulse(now+i*.22,900-i*90,430,.08,.16,'square');noise(now+.04,.45,.13,1800); }
      else if(kind==='ready') { noise(now,.1,.3,2200);pulse(now,340,95,.22,.28,'square'); }
      else if(kind==='fire') { pulse(now,72,38,.25,.4,'sine');pulse(now+.38,67,34,.3,.34,'sine'); }
      else if(kind==='dead') { noise(now,.55,.36,430);pulse(now,170,32,.85,.38,'sawtooth'); }
      else if(kind==='safe') { pulse(now,190,560,.22,.27,'sine');pulse(now+.2,420,720,.26,.2,'triangle'); }
      else pulse(now,620,220,.11,.16);
    },
    dispose() { nodes.forEach(n=>n.stop());ctx.close(); },
  };
}
