// Original procedural ambience: no downloaded music or third-party recordings.
export function createSoundscape() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain(); master.gain.value = .15; master.connect(ctx.destination);
  const nodes = [];
  for (const hz of [55, 82.41, 110.3]) {
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = hz; gain.gain.value = .065;
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
  const windGain=ctx.createGain();windGain.gain.value=.2;wind.connect(filter);filter.connect(windGain);windGain.connect(master);wind.start();nodes.push(wind);
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
      else if(kind==='challenge') { pulse(now,150,62,.32,.35,'sawtooth');pulse(now+.28,120,48,.38,.3,'sawtooth'); }
      else if(kind==='portal') { pulse(now,110,440,.7,.22,'sine');pulse(now+.18,165,660,.85,.18,'triangle');pulse(now+.38,220,880,.9,.13,'sine');noise(now,.9,.09,760); }
      else if(kind==='pull') { pulse(now,780,82,1.1,.3,'sawtooth');pulse(now+.16,520,55,1.25,.22,'sine');noise(now,.8,.16,520); }
      else if(kind==='load') { for(let i=0;i<5;i++)pulse(now+i*.22,900-i*90,430,.08,.16,'square');noise(now+.04,.45,.13,1800); }
      else if(kind==='ready') { noise(now,.1,.3,2200);pulse(now,340,95,.22,.28,'square'); }
      else if(kind==='fire') { pulse(now,72,38,.25,.4,'sine');pulse(now+.38,67,34,.3,.34,'sine'); }
      else if(kind==='dead') { noise(now,.7,.55,430);pulse(now,220,27,1.1,.62,'sawtooth');pulse(now+.08,920,46,.75,.2,'triangle'); }
      else if(kind==='safe') { pulse(now,1250,460,.07,.3,'square');pulse(now+.15,900,360,.06,.2,'square'); }
      else pulse(now,620,220,.11,.16);
    },
    dispose() { nodes.forEach(n=>n.stop());ctx.close(); },
  };
}
