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
      const osc=ctx.createOscillator(); const gain=ctx.createGain();osc.connect(gain);gain.connect(master);
      const low=kind==='bang';osc.type=low?'sawtooth':'triangle';
      osc.frequency.setValueAtTime(low?95:kind==='reveal'?240:kind==='load'?170:600,ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(low?28:70,ctx.currentTime+.23);
      gain.gain.setValueAtTime(low?.6:.25,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.32);
      osc.start();osc.stop(ctx.currentTime+.35);
    },
    dispose() { nodes.forEach(n=>n.stop());ctx.close(); },
  };
}
