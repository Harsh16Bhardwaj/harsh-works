'use client';

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, AudioLines, Check, CircleHelp, Copy, Gamepad2, Moon, Sparkles, Users, Volume2, VolumeX, X } from 'lucide-react';
import { act, armRisk, fireRisk, resolveRisk, botAction, BOT_NAMES, createGame, nextRound, RANK_NAMES, viewFor } from './engine.js';
import { Character, Revolver } from './Character.jsx';
import { createSoundscape } from './sound.js';
import './orbit.css';
const TableScene = lazy(() => import('./TableScene.jsx'));

const ROOM = 'liars-orbit.room.v1';

function Crest({ rank = 'A', small = false }) {
  return <svg className={`orbit-crest ${small ? 'small' : ''}`} viewBox="0 0 100 110" fill="none" aria-hidden="true">
    <path d="M50 5 89 29v48L50 103 11 77V29Z" stroke="currentColor" strokeWidth=".8" />
    <path d="M50 15 80 34v38L50 93 20 72V34Z" stroke="currentColor" strokeWidth=".5" opacity=".55" />
    {rank === 'K' ? <><path d="m26 40 12 12 12-25 12 25 12-12-6 35H32Z" stroke="currentColor" strokeWidth="2" /><path d="M33 67h34M38 81h24" stroke="currentColor" /></> : rank === 'Q' ? <><path d="m50 25 19 29-19 30-19-30Z" stroke="currentColor" strokeWidth="2" /><circle cx="50" cy="54" r="10" stroke="currentColor" /><path d="M50 25v59M31 54h38" stroke="currentColor" opacity=".6" /></> : rank === 'J' ? <><path d="M60 27a28 28 0 1 0 12 42A27 27 0 0 1 60 27Z" stroke="currentColor" strokeWidth="2" /><path d="m66 28 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="currentColor" /></> : <><path d="m50 25 23 52H27Z" stroke="currentColor" strokeWidth="2" /><path d="m50 38 13 30H37Z" stroke="currentColor" /><circle cx="50" cy="57" r="24" stroke="currentColor" strokeWidth=".7" /></>}
    <circle cx="50" cy="5" r="2" fill="currentColor" /><circle cx="50" cy="103" r="2" fill="currentColor" />
  </svg>;
}

function Card({ rank, back = false, selected, onClick, disabled, index }) {
  const content = <><span className="orbit-card-corner">{back ? '✧' : rank}<small>✦</small></span><Crest rank={back ? 'J' : rank} /><span className="orbit-card-word">{back ? 'ORBIT' : rank === 'J' ? 'WILD' : RANK_NAMES[rank]?.slice(0, -1).toUpperCase()}</span><span className="orbit-card-corner bottom">{back ? '✧' : rank}</span></>;
  const cls = `orbit-card ${back ? 'back' : ''} ${selected ? 'selected' : ''} ${rank === 'J' ? 'wild' : ''}`;
  return onClick ? <button type="button" className={cls} onClick={onClick} disabled={disabled} aria-pressed={selected} aria-label={`Card ${index + 1}: ${rank === 'J' ? 'Joker, wild' : RANK_NAMES[rank]?.slice(0, -1)}${selected ? ', selected' : ''}`}>{content}</button> : <div className={cls}>{content}</div>;
}

function Seat({ player, active, position }) {
  return <div className={`orbit-seat seat-${position} ${active ? 'active' : ''} ${!player.alive ? 'eliminated' : ''}`}>
    <Character kind={player.character ?? position} active={active} />
    <div><strong>{player.name}</strong><span className="orbit-seat-meta">{!player.alive ? 'OUT OF ORBIT' : active ? 'THINKING…' : player.bot ? ['THE OBSERVER', 'THE GAMBLER', 'THE WILDCARD'][player.style] : 'AT THE TABLE'}</span></div>
    <div className="orbit-risk" aria-label={`${player.risks} of 6 chambers used`}>{Array.from({ length: 6 }, (_, i) => <i key={i} className={i < player.risks ? 'spent' : ''} />)}</div>
    {player.alive && <div className="orbit-mini-hand" aria-label={`${player.count} cards remaining`}>{Array.from({ length: player.count }, (_, i) => <span key={i}>✧</span>)}</div>}
  </div>;
}

function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => { previous?.focus?.(); };
  }, []);
  return <dialog className="orbit-modal" ref={ref} onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <button className="orbit-icon close" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
    <p className="orbit-eyebrow">THE HOUSE RULES</p><h2>{title}</h2>{children}
  </dialog>;
}

export default function OrbitGame() {
  const [solo, setSolo] = useState(null);
  const [room, setRoom] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [mode, setMode] = useState('solo');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selected, setSelected] = useState([]);
  const [rules, setRules] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');
  const [storageWarning, setStorageWarning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [sound, setSound] = useState(true);
  const [volume, setVolume] = useState(25);
  const [copied, setCopied] = useState(false);
  const [clock, setClock] = useState(0);
  const audio = useRef(null);
  const lock = useRef(false);
  const latestRevision = useRef(-1);
  const game = room?.game || (solo ? viewFor(solo, 'you') : null);
  const youId = room ? room.playerId : 'you';
  const you = game?.players.find((p) => p.id === youId);
  const yourTurn = game?.phase === 'playing' && game.players[game.turn].id === youId;
  const forced = game?.last && (you?.count === 0 || game.players.filter((p) => p.alive && p.count > 0).length <= 1);

  useEffect(() => {
    try {
      const seat = JSON.parse(sessionStorage.getItem(ROOM) || 'null');
      if (seat?.code && seat?.token) setCredentials(seat);
    } catch { setStorageWarning(true); }
    setReady(true);
    const visibility = () => { if (document.hidden) audio.current?.pause(); else audio.current?.resume(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); audio.current?.dispose(); };
  }, []);

  useEffect(() => { audio.current?.setVolume(sound ? volume / 100 : 0); }, [sound, volume]);
  useEffect(() => {
    if (game?.phase === 'reveal') audio.current?.cue('reveal');
    if (game?.phase === 'armed') audio.current?.cue('load');
    if (game?.phase === 'resolved' || game?.phase === 'finished') audio.current?.cue(game.reveal.eliminated ? 'bang' : 'click');
  }, [game?.phase, game?.round]);

  useEffect(() => { setSelected([]); }, [game?.revision, game?.id]);

  useEffect(() => {
    if (!room?.game || room.game.phase !== 'playing') return;
    setClock(Date.now());
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [room?.game?.phase, room?.game?.revision]);

  useEffect(() => {
    if (!solo || rules || leaving) return;
    let update, delay;
    if (solo.phase === 'reveal') { update = armRisk; delay = 2600; }
    else if (solo.phase === 'armed' && solo.players.find(p => p.id === solo.reveal.loserId).bot) { update = s => fireRisk(s, s.reveal.loserId); delay = 1300; }
    else if (solo.phase === 'firing') { update = resolveRisk; delay = 1500; }
    else if (solo.phase === 'playing' && solo.players[solo.turn].bot) {
      update = s => act(s, s.players[s.turn].id, botAction(viewFor(s, s.players[s.turn].id)));
      delay = 1050;
    }
    if (!update) return;
    const timer = setTimeout(() => setSolo(update), delay);
    return () => clearTimeout(timer);
  }, [solo, rules, leaving]);

  async function request(body, creds = credentials, signal) {
    const timeout = AbortSignal.timeout(8000);
    const response = await fetch('/api/orbit', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(creds ? { Authorization: `Bearer ${creds.token}` } : {}) }, body: JSON.stringify({ ...body, code: body.code || creds?.code }), signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not reach the table.');
    return data;
  }

  function acceptRoom(data) {
    const revision = data.game?.revision ?? -1;
    if (revision >= latestRevision.current) { latestRevision.current = revision; setRoom(data); }
  }

  useEffect(() => {
    if (!credentials) return;
    let cancelled = false;
    let timer;
    const controller = new AbortController();
    async function poll() {
      try {
        const data = await request({ type: 'poll' }, credentials, controller.signal);
        if (!cancelled) { acceptRoom(data); setError(''); }
      } catch (e) {
        if (!cancelled) setError(`${e.message} Your seat reconnects automatically while this page is open.`);
      }
      if (!cancelled) timer = setTimeout(poll, 450);
    }
    poll();
    return () => { cancelled = true; clearTimeout(timer); controller.abort(); };
  }, [credentials]);

  function ensureAudio() {
    if (!sound) return;
    try { audio.current ??= createSoundscape(); audio.current.setVolume(volume / 100); }
    catch { setSound(false); }
  }
  function tone(kind = 'play') { if (sound) audio.current?.cue(kind); }
  function startSolo() {
    ensureAudio(); setError(''); setRoom(null); setSelected([]);
    setSolo(createGame([{ id: 'you', name: name.trim().slice(0, 18) || 'You' }, ...BOT_NAMES.map((n, i) => ({ id: `bot-${i}`, name: n, bot: true }))], Math.random, globalThis.crypto?.randomUUID?.() || `solo-${Date.now()}`));
  }

  async function roomAction(type) {
    ensureAudio();
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const data = await request({ type, name, code: type === 'join' ? code.toUpperCase() : credentials?.code });
      if (data.token) {
        const creds = { token: data.token, code: data.code };
        latestRevision.current = -1;
        setCredentials(creds);
        try { sessionStorage.setItem(ROOM, JSON.stringify(creds)); } catch { setStorageWarning(true); }
      }
      acceptRoom(data);
    } catch (e) { setError(e.message); }
    finally { lock.current = false; setBusy(false); }
  }

  async function move(type) {
    if ((type === 'fire' ? game?.phase !== 'armed' || game.reveal.loserId !== youId : !yourTurn) || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const action = { type, cards: selected };
      if (room) acceptRoom(await request({ type: 'move', action, revision: game.revision }));
      else setSolo(type === 'fire' ? fireRisk(solo, 'you') : act(solo, 'you', action));
      setSelected([]); tone(type);
    } catch (e) { setError(e.message); }
    finally { lock.current = false; setBusy(false); }
  }

  async function leave() {
    if (credentials) {
      try { await request({ type: 'leave' }); } catch { /* Turn timeout keeps the old table moving. */ }
      try { sessionStorage.removeItem(ROOM); } catch { /* Storage unavailable. */ }
    }
    setCredentials(null); setRoom(null); setSolo(null); setLeaving(false); setError(''); latestRevision.current = -1;
  }

  async function copyCode() {
    try { await navigator.clipboard.writeText(room.code); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { setError(`Room code: ${room.code}. Select and copy it to share.`); }
  }

  const opponents = game?.players.filter((p) => p.id !== youId) || [];
  const reveal = game?.reveal;
  return <main className="orbit-app">
    <div className="orbit-scenery" aria-hidden="true"><div className="orbit-moon" /><div className="orbit-horizon" /></div>
    <header className="orbit-header">
      <a className="orbit-home" href="/" aria-label="Back to portfolio"><ArrowLeft size={16} /><span>PORTFOLIO</span></a>
      <a className="orbit-brand" href="/play"><Sparkles size={22} /><span>LIAR’S <b>ORBIT</b></span></a>
      <div className="orbit-header-actions"><button className="orbit-icon" onClick={() => { if (!sound) { try { audio.current ??= createSoundscape(); } catch { return; } } setSound(!sound); }} aria-label={sound ? 'Mute sound' : 'Enable sound'} aria-pressed={sound}>{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button><input className="orbit-volume" aria-label="Ambient volume" type="range" min="0" max="60" value={volume} onChange={e => setVolume(Number(e.target.value))} /><button className="orbit-help" onClick={() => setRules(true)}><CircleHelp size={17} /><span>How to play</span></button></div>
    </header>

    {!game && !room && <section className="orbit-entry">
      <div className="orbit-intro"><p className="orbit-eyebrow"><span /> A SMALL GAME OF BIG LIES</p><h1>Good company.<br /><em>Terrible liars.</em></h1><p className="orbit-intro-sub">Read the room. Risk your seat.</p><p className="orbit-description">Five cards. Six chambers. Only one survivor.</p>
        <div className="orbit-cast" aria-label="Meet the house players">{BOT_NAMES.map((n,i)=><div key={n}><Character kind={i}/><strong>{n}</strong><span>{["THE FOX","THE RAVEN","THE AUTOMATON"][i]}</span></div>)}</div>
        <div className="orbit-entry-tags"><span><Moon size={14} /> No download</span><span><Users size={14} /> 1–4 players</span><span><AudioLines size={14} /> All nerve</span></div>
      </div>
      <div className="orbit-setup"><div className="orbit-setup-top"><span className="orbit-eyebrow">TAKE A SEAT</span><span className="orbit-open"><i /> TABLE OPEN</span></div>
        <div className="orbit-mode" role="group" aria-label="Game mode"><button disabled={!ready} onClick={() => setMode('solo')} aria-pressed={mode === 'solo'}><Gamepad2 size={17} /> Fly solo</button><button disabled={!ready} onClick={() => setMode('friends')} aria-pressed={mode === 'friends'}><Users size={17} /> With friends</button></div>
        <h2>{mode === 'solo' ? 'Trust no one.' : 'Bring your best liars.'}</h2><p>{mode === 'solo' ? 'Not even the house bots. Three personalities, absolutely no poker face.' : 'Same Wi-Fi. Same address. Same room code. Up to four players; bots fill the spare seats.'}</p>
        <label className="orbit-label" htmlFor="orbit-name">YOUR TABLE NAME <span>OPTIONAL</span></label><input id="orbit-name" maxLength={18} placeholder="Traveller" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        <ol className="orbit-quick-rules"><li><b>01</b><span><strong>Make a claim.</strong> Play 1–3 cards face down. Every claim matches the table’s rank.</span></li><li><b>02</b><span><strong>Sell it. Or smell it.</strong> Play your cards, or call “Liar” on the last claim. Jokers are wild.</span></li><li><b>03</b><span><strong>Risk your seat.</strong> Caught lying? Wrong accusation? Face the chamber. Last survivor wins.</span></li></ol>
        {mode === 'solo' ? <><button className="orbit-primary" disabled={!ready || Boolean(credentials)} onClick={() => startSolo()}>{ready ? 'Deal me in' : 'Opening the table…'}<ArrowRight size={18} /></button></> : <><button className="orbit-primary" disabled={busy || Boolean(credentials)} onClick={() => roomAction('create')}>Create a room<ArrowRight size={18} /></button><div className="orbit-join"><input aria-label="Room code" placeholder="ROOM CODE" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/[^a-z0-9]/gi, '').toUpperCase())} /><button disabled={code.length !== 6 || busy || Boolean(credentials)} onClick={() => roomAction('join')}>Join <ArrowRight size={15} /></button></div></>}
        {credentials && <button className="orbit-resume" onClick={leave}>Reconnecting to {credentials.code} · Leave room</button>}
        <p className="orbit-setup-note">{mode === 'solo' ? 'Ambient sound starts when you join. Headphones recommended.' : 'The host keeps the local server running. Rooms reset when it restarts.'}</p>
      </div>
    </section>}

    {room && !game && <section className="orbit-lobby"><p className="orbit-eyebrow">PRIVATE TABLE · SAME WI-FI</p><h1>The company<br />you <em>don’t keep.</em></h1><p>Share this room code and the host’s local network address.</p><button className="orbit-room-code" onClick={copyCode}>{room.code}{copied ? <Check size={22} /> : <Copy size={22} />}</button><div className="orbit-lobby-seats">{Array.from({ length: 4 }, (_, i) => <div key={i}><span>{room.seats[i]?.name.slice(0, 1) || '✧'}</span><strong>{room.seats[i]?.name || 'Open seat'}</strong><small>{room.seats[i] ? 'READY TO LIE' : 'A BOT CAN FILL IN'}</small></div>)}</div>{room.host ? <button className="orbit-primary" disabled={busy} onClick={() => roomAction('start')}>Start the table <ArrowRight size={18} /></button> : <p className="orbit-wait">Waiting for the host to deal…</p>}<p className="orbit-setup-note">30 seconds per human turn. Bots move in about a second. A bot plays if someone steps away.</p><button className="orbit-resume" onClick={leave}>Leave room</button></section>}

    {game && <section className="orbit-game">
      <div className="orbit-game-bar"><div><span className="orbit-live-dot" />{room ? `ROOM ${room.code}` : 'SOLO TABLE'}<span className="orbit-bar-divider">/</span>ROUND {String(game.round).padStart(2, '0')}{room && game.phase === 'playing' && !game.players[game.turn].bot && <span className="orbit-clock">{Math.max(0, Math.ceil((room.due - clock) / 1000))}s</span>}</div><button onClick={() => setLeaving(true)}>Leave table <ArrowRight size={14} /></button></div>
      <div className={`orbit-turn-banner ${yourTurn?'is-yours':''}`} aria-live="polite"><div className="orbit-rank-badge"><span>TABLE RULE</span><strong>{RANK_NAMES[game.rank]} only</strong><small>Jokers are wild</small></div><div className="orbit-current-turn"><span>{game.phase==='playing'?'CURRENT TURN':'ALL EYES ON'}</span><strong>{game.phase==='playing'?(yourTurn?'Your move.':`${game.players[game.turn].name}’s move.`):`${reveal?.loser}`}</strong><small>{game.phase==='playing'?(yourTurn?'Play your hand or call their bluff.':game.players[game.turn].bot?'Reading the table…':'Waiting for their play…'):game.phase==='reveal'?'The challenged cards are being revealed.':game.phase==='armed'?'The player at risk controls the trigger.':game.phase==='firing'?'Hold your breath.':'The chamber has decided.'}</small></div></div>
      <div className={`orbit-table-area phase-${game.phase}`}><Suspense fallback={null}><TableScene players={opponents} activeId={game.phase==='playing'?game.players[game.turn].id:game.reveal?.loserId} phase={game.phase}/></Suspense>
        <div className="orbit-table"><div className="orbit-table-ring" /><span className="orbit-table-label">FORTUNE FAVOURS THE CONVINCING</span><div className="orbit-table-bottom">EST. AT THE EDGE OF NOWHERE</div></div>
        {opponents.map((player, i) => <Seat key={player.id} player={player} active={game.phase === 'playing' && game.players[game.turn].id === player.id} position={i} />)}
        <div className="orbit-table-center">
          <div className="orbit-rank-label">THE TABLE IS</div><h2>{RANK_NAMES[game.rank]}<span> ONLY</span></h2>
          <div className="orbit-pile" key={`${game.round}-${game.revision}`}>{game.last ? Array.from({ length: game.last.count }, (_, i) => <div key={i} style={{ '--i': i }}><Card back /></div>) : <div className="orbit-empty-pile"><Crest rank={game.rank} /><span>MAKE THE FIRST CLAIM</span></div>}</div>
          <p className="orbit-claim">{game.last ? <><strong>{game.players[game.last.player].name}</strong> claims {game.last.count} {RANK_NAMES[game.rank]}<span>Honest hand. Or a very good lie.</span></> : <>The table is quiet.<span>Someone has to lie first.</span></>}</p>
        </div>
        {reveal && <div className={`orbit-reveal risk-${game.phase}`} key={`reveal-${game.round}`} role="status">
          <div className="orbit-sequence-steps"><span className="done">01 · THE CARDS</span><span className={game.phase !== 'reveal' ? 'done' : ''}>02 · THE CHAMBER</span><span className={['resolved','finished'].includes(game.phase) ? 'done' : ''}>03 · THE VERDICT</span></div>
          <h2>{reveal.liar ? 'That was a lie.' : 'An honest hand.'}</h2>
          <p><strong>{reveal.accused}</strong> played {reveal.cards.map(r=>r==='J'?'Joker':RANK_NAMES[r].slice(0,-1)).join(' + ')}. {reveal.liar ? 'The bluff was caught.' : 'Every card was valid.'}</p>
          <div className="orbit-reveal-cards">{reveal.cards.map((rank,i)=><div className="orbit-flip" style={{'--i':i}} key={i}><Card rank={rank}/></div>)}</div>
          {game.phase === 'reveal' ? <p className="orbit-risk-caption">{reveal.loser}, the chamber is yours.</p> : <>
            <Revolver phase={game.phase} eliminated={reveal.eliminated}/>
            {game.phase === 'armed' && <><p className="orbit-risk-caption"><strong>{reveal.loserId === youId ? 'Your nerve. Your trigger.' : `${reveal.loser} faces the chamber.`}</strong><span>Chamber {reveal.risk} of 6 · {reveal.liar ? 'Caught bluffing' : 'Wrong accusation'}</span></p>{reveal.loserId===youId ? <button className="orbit-fire" disabled={busy} onClick={()=>move('fire')}>Pull the trigger <span>↗</span></button> : <p className="orbit-wait">Everyone is watching. Waiting for {reveal.loser}…</p>}</>}
            {game.phase === 'firing' && <p className="orbit-risk-caption">{reveal.loser} pulls the trigger…</p>}
            {['resolved','finished'].includes(game.phase) && <><div className={`orbit-shot-result ${reveal.eliminated?'danger':''}`}><b>{reveal.eliminated?'BANG.':'CLICK.'}</b><span>{reveal.loser} {reveal.eliminated?'is out of the game.':'lives to lie another day.'}</span></div>{game.phase==='finished' ? <><h3>{game.winner===youId?'You take the table.':`${game.players.find(p=>p.id===game.winner)?.name} wins.`}</h3><button className="orbit-primary" onClick={leave}>Back to the lounge <ArrowRight size={17}/></button></> : room ? <p className="orbit-wait">A new hand is coming…</p> : <button className="orbit-primary" onClick={()=>setSolo(nextRound(solo))}>Next hand <ArrowRight size={17}/></button>}</>}
          </>}
        </div>}
      </div>
      <div className="orbit-player-zone"><div className="orbit-player-top"><div><span className={`orbit-turn-dot ${yourTurn ? 'on' : ''}`} /><strong>{you?.name}</strong><span>{!you?.alive ? 'SPECTATING' : yourTurn ? 'YOUR MOVE' : 'YOUR HAND'}</span></div><div className="orbit-player-score"><span className="orbit-personal-risk">CHAMBERS USED</span> {you?.risks}<span>/ 6</span></div></div>
        <div className="orbit-hand">{you?.alive ? you.hand.map((rank, i) => <Card key={`${game.round}-${i}`} rank={rank} index={i} selected={selected.includes(i)} disabled={!yourTurn || busy || forced} onClick={() => { setError(''); setSelected((cards) => cards.includes(i) ? cards.filter((n) => n !== i) : cards.length < 3 ? [...cards, i] : cards); tone(); }} />) : <p className="orbit-spectator">Your luck ran out. Stay to see who gets the last word.</p>}</div>
        <div className="orbit-turn-message" aria-live="polite">{game.phase !== 'playing' ? 'The cards have spoken.' : !you?.alive ? 'You’re out. The table plays on.' : yourTurn ? forced ? 'Last hand standing. You must call the previous claim.' : selected.length ? `${selected.length} selected. You’re claiming ${RANK_NAMES[game.rank]}, whatever you play.` : 'Your move. Pick 1–3 cards, or call their bluff.' : `${game.players[game.turn].name} is weighing the odds…`}</div>
        <div className="orbit-controls"><button className="orbit-primary" disabled={!yourTurn || !selected.length || busy || forced} onClick={() => move('play')}>Play {selected.length || ''} {selected.length === 1 ? 'card' : 'cards'}<ArrowRight size={17} /></button><button className="orbit-challenge" disabled={!yourTurn || !game.last || busy} onClick={() => move('challenge')}>Call “Liar” <span>↗</span></button></div>
      </div>
      <details className="orbit-history"><summary>Table talk <span>{game.log.length} recent events</span></summary><ol>{game.log.map((line, i) => <li key={`${i}-${line}`}>{line}</li>)}</ol></details>
    </section>}

    {error && <div className="orbit-error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss message"><X size={16} /></button></div>}
    <footer className="orbit-footer"><span>NO HONOUR AMONG LIARS.</span><span>{sound?'AMBIENCE ON · ADJUST ABOVE':'AMBIENCE MUTED'}</span><span>{storageWarning?'Reconnection unavailable in this browser':'LAST SURVIVOR TAKES THE TABLE'}</span></footer>
    {rules && <Modal title="Lie well. Live longer." onClose={() => setRules(false)}><ol className="orbit-full-rules"><li><strong>Every hand has a table rank: Aces, Kings, or Queens.</strong> You get five cards. Play 1–3 face down and claim they match. Jokers count as any rank.</li><li><strong>On your turn, play or call “Liar.”</strong> Calling reveals only the last play. Even one wrong card makes it a bluff. If they lied, they face the chamber. If they told the truth, you do.</li><li><strong>One live chamber. Six possible positions.</strong> Your chamber is randomly set once per match. Each penalty advances it. Survive the click and stay in; hit the live chamber and you’re out. No gore, just your seat at stake.</li><li><strong>A new hand follows every challenge.</strong> Empty hands sit out until then. The last player holding cards must challenge the previous claim. The last survivor wins.</li></ol><p className="orbit-rules-note">Solo pauses while these rules are open. Friend rooms keep moving, with a 30-second turn limit. The player facing the chamber pulls the trigger; after 20 seconds the house takes over.</p><button className="orbit-primary" onClick={() => setRules(false)}>I’m in <ArrowRight size={16} /></button></Modal>}
    {leaving && <Modal title="Leaving so soon?" onClose={() => setLeaving(false)}><p className="orbit-rules-note">{room ? 'A bot takes your seat so your friends can keep playing.' : 'Leaving ends this solo match. Start a fresh table whenever you like.'}</p><button className="orbit-primary" onClick={leave}>Leave table <ArrowRight size={16} /></button><button className="orbit-resume" onClick={() => setLeaving(false)}>Stay at the table</button></Modal>}
  </main>;
}
