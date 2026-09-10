export function Character({ kind = 0, active = false }) {
  if(kind===10)return <svg className={`orbit-character ${active?'awake':''}`} viewBox="0 0 180 210" role="img" aria-label="Ravi Kishan">
    <defs><pattern id="ravi-stole" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#d8c8a6"/><path d="M3 9q6-9 12 0-6 9-12 0Z" fill="none" stroke="#8c4738" strokeWidth="1.5"/><circle cx="9" cy="9" r="2" fill="#477d78"/><path d="M0 1h18M0 17h18" stroke="#b78358"/></pattern></defs>
    <ellipse cx="90" cy="198" rx="73" ry="9" fill="#000" opacity=".25"/>
    <path d="M24 198 31 151 61 132h58l31 19 7 47Z" fill="#282a2c" stroke="#6a5f52"/><path d="m61 132 29 60 29-60-9 66H70Z" fill="#3d3d3d"/>
    <path d="M53 55Q65 31 91 30q29 1 39 27l-4 59-19 25H73l-20-25Z" fill="#b87855" stroke="#d19a76"/>
    <path d="M48 66Q42 37 68 21q28-18 58 3 17 12 9 43l-15-15-3-18-18 8-11 17-8-20-19 19Z" fill="#17191a"/>
    <path d="M55 52q9-27 34-31-10 12-6 35M80 42q15-22 38-15-18 5-26 27" fill="none" stroke="#2e3030" strokeWidth="7" strokeLinecap="round"/>
    <path d="M61 77q12-8 25 1M98 78q13-9 25 0" fill="none" stroke="#30251f" strokeWidth="5" strokeLinecap="round"/>
    <path d="M63 88q10 7 21 0m17 0q11 7 21-1" fill="none" stroke="#e3c1a0" strokeWidth="4"/><circle cx="75" cy="88" r="3" fill="#1b1a19"/><circle cx="111" cy="88" r="3" fill="#1b1a19"/>
    <path d="m91 86-8 25 16 1" fill="none" stroke="#865139" strokeWidth="3"/><path d="M73 123q18 10 35-1-12 17-30 6" fill="#5b302b"/><path d="M77 121q15 6 29 0" stroke="#e5c7ad" strokeWidth="2"/>
    <path d="M48 145 68 132l15 66H55Z" fill="url(#ravi-stole)" stroke="#ad8060"/><path d="m132 145-20-13-14 66h28Z" fill="url(#ravi-stole)" stroke="#ad8060"/>
    <path d="M31 178 49 164l17 13-9 21H29m122-20-20-14-17 13 9 21h30" fill="#b87855" stroke="#5a3a31"/>
  </svg>;
  if(kind===9)return <svg className={`orbit-character ${active?'awake':''}`} viewBox="0 0 180 210" role="img" aria-label="Modiji">
    <ellipse cx="90" cy="198" rx="74" ry="9" fill="#000" opacity=".25"/>
    <path d="M25 198 31 151 62 132h55l32 19 7 47Z" fill="#a94825" stroke="#e4a34f"/><path d="m62 132 28 57 27-57-8 66H71Z" fill="#6e241d"/>
    <path d="M51 62 67 39h46l17 23-4 58-20 21H73l-20-21Z" fill="#bd7b59"/>
    <path d="M50 66q5-35 40-37 36 2 41 37l-12-8-9-18-20 10-21-10-9 19Z" fill="#ddd7c9"/>
    <path d="M59 101q4 35 31 43 27-8 32-43l-13 12-8 18-11-6-12 6-8-18Z" fill="#eee9dc" stroke="#cfc8b8"/>
    <path d="M69 109q9-6 21 1 12-7 22-1-8 8-22 5-13 3-21-5Z" fill="#eee9dc"/>
    <path d="m90 82-7 22h14" fill="none" stroke="#86533e" strokeWidth="3"/>
    <g fill="none" stroke="#62554a" strokeWidth="2"><circle cx="70" cy="82" r="14"/><circle cx="110" cy="82" r="14"/><path d="M84 82h12"/></g><circle cx="70" cy="82" r="3" fill="#24201d"/><circle cx="110" cy="82" r="3" fill="#24201d"/>
    <path d="M55 46 61 17l14 11L90 5l15 23 16-12 5 30-18 10H72Z" fill="#c9993e" stroke="#f2d287" strokeWidth="2"/><path d="M65 39h50" stroke="#7c4a28" strokeWidth="5"/><circle cx="90" cy="25" r="5" fill="#a72d27"/>
    <g fill="#e77c18" stroke="#f3ad32" strokeWidth="1">{Array.from({length:13},(_,i)=>{const a=Math.PI*.16+i*Math.PI*.68/12;return <circle key={i} cx={90+45*Math.cos(a)} cy={130+43*Math.sin(a)} r="6"/>;})}</g>
    <path d="M151 43q30 54 0 125" fill="none" stroke="#a26835" strokeWidth="7"/><path d="M151 43q-18 62 0 125" fill="none" stroke="#ead3a0" strokeWidth="2"/><path d="M151 51v105" stroke="#ded4b6" strokeWidth="2"/><path d="m151 50-6 12h12Zm0 106-5-9h10Z" fill="#d6b36d"/>
    <path d="M139 139q13-8 22 3l-8 17-18-7Z" fill="#bd7b59" stroke="#6e3f2d"/><path d="M31 178 49 164l17 13-9 21H29m122-20-20-14-17 13 9 21h30" fill="#bd7b59" stroke="#6e3f2d"/>
  </svg>;
  if(kind===8)return <svg className={`orbit-character ${active?'awake':''}`} viewBox="0 0 180 210" role="img" aria-label="Habibi">
    <defs><pattern id="habibi-check" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#34363b"/><path d="M0 2h10M0 7h10M2 0v10M7 0v10" stroke="#9d7b67"/><path d="M0 0 10 10M10 0 0 10" stroke="#623f3a" strokeWidth=".6"/></pattern></defs>
    <ellipse cx="90" cy="198" rx="73" ry="9" fill="#000" opacity=".25"/><path d="M25 198 32 151 63 132h54l31 19 8 47Z" fill="#b77772" stroke="#ddb18f"/><path d="m63 132 27 58 27-58-8 66H70Z" fill="#754d4c"/><path d="M55 61 70 38h41l16 23-4 59-17 20H74l-18-21Z" fill="#9a6548"/>
    <path d="M43 74 47 42 68 18h44l22 24 3 34-16-19-64 1Z" fill="url(#habibi-check)" stroke="#b08a70"/><path d="M47 52 30 82l9 55 20-18-2-61m76-5 17 33-9 50-19-18-1-61" fill="url(#habibi-check)" stroke="#8e6b59"/>
    <path d="M50 48q40-14 80 1l-1 7q-39-12-78 0Z" fill="#a23831" stroke="#d46b59" strokeWidth="1.5"/>
    <circle cx="70" cy="82" r="15" fill="none" stroke="#282526" strokeWidth="4"/><circle cx="111" cy="82" r="15" fill="none" stroke="#282526" strokeWidth="4"/><path d="M85 82h11" stroke="#282526" strokeWidth="4"/><circle cx="70" cy="82" r="3" fill="#171719"/><circle cx="111" cy="82" r="3" fill="#171719"/><path d="m90 83-7 22h14" fill="none" stroke="#704934" strokeWidth="3"/>
    <path d="M72 111q10-5 18 0 8-5 18 0-8 5-18 2-10 3-18-2Z" fill="#332523"/><path d="M78 125q12 7 24 0" fill="none" stroke="#704934" strokeWidth="3"/><path d="M85 127q5 4 10 0l-1 11-4 6-4-6Z" fill="#332523"/><path d="M31 178 49 164l17 13-9 21H29m122-20-20-14-17 13 9 21h30" fill="#9a6548" stroke="#5c3932"/>
  </svg>;
  const palettes = [['#b67441','#ebbe83','#283d39'],['#354d60','#a6c2ca','#282c39'],['#78917d','#dfcc9d','#293c36'],['#836379','#d6a99d','#302c3b'],['#9b452d','#f0a35e','#382820'],['#66899d','#d9eef0','#202f3b'],['#b59b51','#fff0ad','#313423'],['#913f4f','#edb3a5','#39232d']];
  const [skin, light, coat] = palettes[kind % palettes.length];
  return <svg className={`orbit-character ${active ? 'awake' : ''}`} viewBox="0 0 180 210" role="img" aria-label={['Desert Fox','Iron Raven','Verdant Unit','Veiled Oracle','Ember Jackal','Frost Corvid','Solar Automaton','Crimson Seer'][kind % 8]}>
    <ellipse cx="90" cy="198" rx="73" ry="9" fill="#000" opacity=".25" />
    <path d="M25 198 32 151 63 132h54l31 19 8 47Z" fill={coat} stroke="#b3a57b" strokeWidth="1" />
    <path d="m62 132 28 58 28-58-6 66H68Z" fill="#0f2023" /><path d="m62 131-15 25 21 5-6 9 28 25m28-64 15 25-21 5 6 9-28 25" fill="none" stroke={light} opacity=".55" />
    <path d="m82 142 8-8 8 8-5 9 6 25-9 13-9-13 6-25Z" fill="#be975a" />
    {kind % 4 === 0 ? <><path d="m47 85-8-66 40 28 23-1 38-29-7 70-15 35-28 22-32-23Z" fill={skin} /><path d="m48 61-2-31 22 22m45 0 19-24-2 35" fill="#392b28" /><path d="m48 90 25 1 17 26 17-26 24-2-15 31-26 20-28-19Z" fill={light} /><path d="m72 106 18 8 18-8-18 22Z" fill="#252928" /><path d="m53 77 25 8-20 4Zm74 0-25 8 20 4Z" fill="#132321" /><path d="m59 82 10 3m44 0 10-3" stroke="#f5d89a" strokeWidth="3" /></> : kind % 4 === 1 ? <><path d="m46 91 5-42 36-24 38 13 16 49-19 35-29 18-33-23Z" fill={skin} /><path d="m51 51 36-26-8 32-29 27m39-57 37 12-15 25" fill="#59717d" /><path d="m80 81 16-4 17 32-40-1Z" fill="#bb9d63" /><path d="m73 108 40 1-22 29Z" fill="#756f50" /><path d="m51 75 28 9-24 6m48-6 25-13-4 17" fill="#101c25" /><circle cx="66" cy="84" r="3" fill="#eecc84" /><circle cx="115" cy="81" r="3" fill="#eecc84" /></> : kind % 4 === 2 ? <><path d="M49 53 66 35h49l18 20-3 67-24 19H72l-25-23Z" fill={skin} stroke={light} /><path d="M55 62h72v35H55Z" fill="#101f21" /><path d="M62 78h20m19 0h19" stroke="#e0c78d" strokeWidth="5" /><path d="M74 116h35m-18-17v9M61 42l15 14h28l16-14" fill="none" stroke={light} strokeWidth="3" /><circle cx="48" cy="87" r="8" fill="#b6a26e" /><circle cx="133" cy="87" r="8" fill="#b6a26e" /></> : <><path d="M42 106 44 55l26-26h39l28 26 4 51-27 32H68Z" fill={coat} stroke={light} /><path d="M54 68 90 52l35 16-9 54-26 20-27-20Z" fill={skin} /><path d="m59 77 27 9-22 7m57-16-27 9 21 7" fill="#0e2021" /><path d="m90 88-8 25h16m-19 12h22" fill="none" stroke={light} /></>}
    <path d="M31 178 49 164l17 13-9 21H29m122-20-20-14-17 13 9 21h30" fill={skin} stroke="#182826" />
  </svg>;
}

export function Revolver({ phase, eliminated }) {
  return <div className={`orbit-gun-stage gun-${phase} ${eliminated ? 'gun-bang' : ''}`} aria-hidden="true"><svg viewBox="0 0 360 165" className="orbit-gun">
    <defs><linearGradient id="gunmetal" x2="0" y2="1"><stop stopColor="#b9b8a4" /><stop offset=".45" stopColor="#525f5c" /><stop offset="1" stopColor="#243532" /></linearGradient></defs>
    <path d="m235 67 29 20 13 58-38 8-30-66" fill="#6d422d" stroke="#bf945b" strokeWidth="3" />
    <path d="m242 96 16 37m-25-32 14 35" stroke="#382c25" strokeWidth="3" />
    <path d="M48 56h147l25-15 34 18-1 31h-71l-8-10H48Z" fill="url(#gunmetal)" stroke="#c5b990" strokeWidth="2" />
    <path d="M51 52h124v8H51Z" fill="#8d9789" /><path d="M53 67h99" stroke="#192a27" strokeWidth="4" />
    <path className="gun-hammer" d="m224 46 9-16 13 7-4 15" fill="#a4a793" stroke="#d5c59a" />
    <path d="M202 90q-5 30 24 23l5-24m-16 0-2 14" fill="none" stroke="#b6ad8b" strokeWidth="4" />
    <g className="gun-drum"><circle cx="180" cy="69" r="28" fill="#384946" stroke="#c0b58e" strokeWidth="3" /><circle cx="180" cy="69" r="6" fill="#a19672" />{Array.from({length:6},(_,i)=><circle key={i} cx={180+17*Math.cos(i*Math.PI/3)} cy={69+17*Math.sin(i*Math.PI/3)} r="5.5" fill="#101e1b" stroke="#8b8f77" />)}</g>
    <path className="gun-flash" d="m46 64-17-6 6-14-18 11L1 45l8 22L0 81l26-6 8 17 5-22Z" fill="#f4c779" />
    <g className="gun-smoke" fill="none" stroke="#d2cab3" strokeWidth="3" strokeLinecap="round"><path d="M42 61q-26-14-13-29t-10-25" /><path d="M40 67Q9 52 19 35" /></g>
    <g className="gun-hands"><path className="gun-hand-support" d="M130 125c18-20 36-28 55-22l21 12-12 24-31-2-25 15Z" fill="#b98564" stroke="#e2b48d" strokeWidth="2" /><path className="gun-hand-grip" d="M218 116c12-19 25-26 39-20l25 17-11 30-34-1-19-13Z" fill="#b98564" stroke="#e2b48d" strokeWidth="2" /><path d="m139 129 28 4m59-13 32 12" stroke="#6e4b3c" strokeWidth="3" strokeLinecap="round" /></g>
  </svg><span className="orbit-gun-shadow" /></div>;
}
