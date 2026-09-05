export function Character({ kind = 0, active = false }) {
  const palettes = [['#b67441','#ebbe83','#283d39'],['#354d60','#a6c2ca','#282c39'],['#78917d','#dfcc9d','#293c36'],['#836379','#d6a99d','#302c3b']];
  const [skin, light, coat] = palettes[kind % 4];
  return <svg className={`orbit-character ${active ? 'awake' : ''}`} viewBox="0 0 180 210" role="img" aria-label={['Vesper, the fox','Rook, the raven','Sable, the automaton','The masked traveller'][kind % 4]}>
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
  </svg><span className="orbit-gun-shadow" /></div>;
}
