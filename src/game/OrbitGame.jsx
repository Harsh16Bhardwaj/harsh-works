'use client';

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, CircleHelp, Copy, Gamepad2, Link2, LogOut, Users, Volume2, VolumeX, X } from 'lucide-react';
import { act, armRisk, readyRisk, fireRisk, resolveRisk, botAction, BOT_NAMES, createGame, nextRound, RANK_NAMES, viewFor } from './engine.js';
import { Character } from './Character.jsx';
import { phaseDelay } from './timing.js';
import { createSoundscape } from './sound.js';
import { clearSeat, loadSeat, rememberName, rememberedName } from './room-storage.js';
import { createRoomSession } from './room-session.js';
import './orbit.css';
const TableScene = lazy(() => import('./StageScene.jsx'));

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
    <div className="orbit-seat-label"><strong>{player.name}</strong><span>{!player.alive ? 'OUT' : `${player.count} ${player.count === 1 ? 'CARD' : 'CARDS'}`}</span></div>
    <div className="orbit-seat-hand" aria-hidden="true">{Array.from({length:Math.min(5,player.count || 0)},(_,i)=><i key={i} style={{'--card':i}}/>)}</div>
    <FateMarks risks={player.risks} alive={player.alive}/>
  </div>;
}

function LastBluffMark() {
  return <svg className="last-bluff-mark" viewBox="0 0 42 32" aria-hidden="true"><rect x="5" y="8" width="20" height="18" rx="2"/><rect x="17" y="5" width="20" height="18" rx="2"/><circle cx="21" cy="16" r="5"/></svg>;
}

function FateMarks({ risks = 0, alive = true }) {
  const safe = Math.max(0, risks - (alive ? 0 : 1));
  return <div className={`orbit-fate ${alive ? '' : 'is-out'}`} aria-label={alive ? `${safe} escapes` : 'Eliminated'}><span>{alive ? `${safe} ESCAPES` : 'OUT'}</span><div>{Array.from({length:6},(_,i)=><i className={i<safe?'used':''} key={i}/>)}</div></div>;
}

function matchOrder(gameId, playerId) {
  const value = `${gameId}:${playerId}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
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
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [sound, setSound] = useState(true);
  const [volume, setVolume] = useState(25);
  const [copied, setCopied] = useState(false);
  const audio = useRef(null);
  const roomSession = useRef(null);
  const lastClaimCue = useRef('');
  const lastGameCue = useRef('');
  const lock = useRef(false);
  const latestRevision = useRef(-1);
  const game = room?.game || (solo ? viewFor(solo, 'you') : null);
  const youId = room ? room.playerId : 'you';
  const you = game?.players.find((p) => p.id === youId);
  const yourTurn = game?.phase === 'playing' && game.players[game.turn].id === youId;
  const waitingTurn = game?.phase === 'playing' && !yourTurn;
  const forced = game?.last && (you?.count === 0 || game.players.filter((p) => p.alive && p.count > 0).length <= 1);

  useEffect(() => {
    try {
      const invited = new URLSearchParams(window.location.search).get('room')?.replace(/[^a-z2-9]/gi, '').toUpperCase().slice(0, 6);
      if (invited) { setMode('friends'); setCode(invited); }
      setName(rememberedName());
      const seat = loadSeat();
      if (seat?.code && seat?.seatToken) setCredentials(seat);
    } catch {}
    setReady(true);
    const visibility = () => { if (document.hidden) audio.current?.pause(); else audio.current?.resume(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); audio.current?.dispose(); };
  }, []);

  useEffect(() => { audio.current?.setVolume(sound ? volume / 100 : 0); }, [sound, volume]);
  useEffect(() => {
    if (!game?.id || lastGameCue.current === game.id) return;
    lastGameCue.current = game.id;
    audio.current?.cue('start');
  }, [game?.id]);
  useEffect(() => {
    if (game?.phase === 'reveal') audio.current?.cue('detective');
    if (game?.phase === 'loading') audio.current?.cue('hammer-rise');
    if (game?.phase === 'armed') audio.current?.cue('ready');
    if (game?.phase === 'resolved' || game?.phase === 'finished') audio.current?.cue('swing');
  }, [game?.phase, game?.round]);

  useEffect(() => {
    const claims = game?.claims;
    if (!claims?.length) { lastClaimCue.current = ''; return; }
    const claim = claims[claims.length - 1];
    const signature = `${game.id}:${game.round}:${claims.length}:${claim.player}:${claim.count}`;
    if (signature !== lastClaimCue.current) audio.current?.cue('deal');
    lastClaimCue.current = signature;
  }, [game?.id, game?.round, game?.claims?.length]);

  useEffect(() => { setSelected([]); }, [game?.revision, game?.id]);
  useEffect(() => { if (game?.id) window.scrollTo({ top: 0, behavior: 'instant' }); }, [game?.id]);
  useEffect(() => { if (game?.phase === 'reveal') window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }, [game?.phase]);

  useEffect(() => {
    if (!solo || rules || leaving) return;
    let update, delay;
    if (solo.phase === 'reveal') { update = armRisk; delay = phaseDelay(solo); }
    else if (solo.phase === 'loading') { update = readyRisk; delay = phaseDelay(solo); }
    else if (solo.phase === 'armed') { update = s => fireRisk(s, s.reveal.loserId); delay = phaseDelay(solo); }
    else if (solo.phase === 'firing') { update = resolveRisk; delay = phaseDelay(solo); }
    else if (solo.phase === 'resolved') { update = nextRound; delay = phaseDelay(solo); }
    else if (solo.phase === 'playing' && solo.players[solo.turn].bot) {
      update = s => act(s, s.players[s.turn].id, botAction(viewFor(s, s.players[s.turn].id)));
      delay = phaseDelay(solo);
    }
    if (!update) return;
    const timer = setTimeout(() => setSolo(update), delay);
    return () => clearTimeout(timer);
  }, [solo, rules, leaving]);

  function acceptRoom(data) {
    const revision = data.game?.revision ?? -1;
    if (revision >= latestRevision.current) { latestRevision.current = revision; setRoom(data); }
  }

  useEffect(() => {
    if (!ready || !credentials || roomSession.current) return;
    let cancelled = false;
    async function reconnect() {
      try {
        const session = await createRoomSession({ type: 'resume', credentials, onState: acceptRoom, onError: setError });
        if (!cancelled) { roomSession.current = session; setError(''); }
      } catch (e) {
        if (!cancelled) {
          clearSeat();
          setCredentials(null); setRoom(null); latestRevision.current = -1;
          setError(e.message);
        }
      }
    }
    reconnect();
    return () => { cancelled = true; };
  }, [credentials, ready]);

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
      if (type === 'start') await roomSession.current.start();
      else {
        const session = await createRoomSession({ type, name, code: type === 'join' ? code.toUpperCase() : undefined, onState: acceptRoom, onError: setError });
        roomSession.current = session;
        latestRevision.current = -1;
        setCredentials(session.credentials);
      }
    } catch (e) { setError(e.message); }
    finally { lock.current = false; setBusy(false); }
  }

  function setRoomBots(allowBots) {
    if (!room?.host || !roomSession.current || busy) return;
    setError('');
    try { roomSession.current.setAllowBots(allowBots); }
    catch (e) { setError(e.message); }
  }

  async function move(type) {
    if (!yourTurn || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const action = { type, cards: selected };
      if (room) roomSession.current.act(action, game.revision);
      else setSolo(act(solo, 'you', action));
      setSelected([]);
    } catch (e) { setError(e.message); }
    finally { lock.current = false; setBusy(false); }
  }

  async function leave() {
    if (roomSession.current) await roomSession.current.close().catch(() => {});
    roomSession.current = null; clearSeat();
    setCredentials(null); setRoom(null); setSolo(null); setLeaving(false); setError(''); latestRevision.current = -1;
  }

  async function copyCode() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/play?room=${room.code}`); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { setError(`Room code: ${room.code}. Select and copy it to share.`); }
  }

  const opponents = game?.players.filter((p) => p.id !== youId) || [];
  const visualOpponents = [...opponents].sort((a, b) => matchOrder(game?.id, a.id) - matchOrder(game?.id, b.id));
  const scenePlayers = game ? [...visualOpponents, ...Array(Math.max(0, 3 - visualOpponents.length)).fill(null), you] : [];
  const reveal = game?.reveal;
  const activePlayerId = game?.phase === 'playing' ? game.players[game.turn].id : reveal?.loserId;
  return <main className="orbit-app">
    <div className="orbit-scenery" aria-hidden="true"><div className="orbit-moon" /><div className="orbit-horizon" /></div>
    {!game && <header className="orbit-header orbit-entry-header">
      <a className="orbit-home" href="/" aria-label="Back to portfolio"><span>← PORTFOLIO</span></a>
      <a className="orbit-brand" href="/play"><LastBluffMark/><span>LAST <b>BLUFF</b></span></a>
      <div className="orbit-header-actions"><button className="orbit-icon" onClick={() => { if (!sound) { try { audio.current ??= createSoundscape(); } catch { return; } } setSound(!sound); }} aria-label={sound ? 'Mute sound' : 'Enable sound'} aria-pressed={sound}>{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button><input className="orbit-volume" aria-label="Ambient volume" type="range" min="0" max="60" value={volume} onChange={e => setVolume(Number(e.target.value))} /><button className="orbit-help" aria-label="How to play" aria-expanded={rules} onClick={() => setRules(true)}><CircleHelp size={17} /><span>How to play</span></button></div>
    </header>}

    {!game && !room && <section className="orbit-entry">
        <div className="orbit-intro"><p className="orbit-eyebrow"><span /> READ THE TABLE</p><h1>Good company.<br /><em>Terrible liars.</em></h1><p className="orbit-description orbit-stakes">Five cards. Six chances. Last player alive wins.</p>
        <div className="orbit-cast" aria-label="Meet the house players">{BOT_NAMES.map((n,i)=><div key={n}><Character kind={i}/><strong>{n}</strong><span>{["CAREFUL","FEARLESS","UNREADABLE"][i]}</span></div>)}</div>
      </div>
      <div className="orbit-setup"><div className="orbit-setup-top"><span className="orbit-eyebrow">TAKE A SEAT</span><span className="orbit-open"><i /> TABLE OPEN</span></div>
        <div className="orbit-mode" role="group" aria-label="Game mode"><button disabled={!ready} onClick={() => setMode('solo')} aria-pressed={mode === 'solo'}><Gamepad2 size={17} /> Fly solo</button><button disabled={!ready} onClick={() => setMode('friends')} aria-pressed={mode === 'friends'}><Users size={17} /> With friends</button></div>
        <div className="orbit-name-field"><label className="orbit-label" htmlFor="orbit-name">YOUR NAME</label><input id="orbit-name" maxLength={18} placeholder="Enter your name" value={name} onChange={(e) => { setName(e.target.value); rememberName(e.target.value); }} autoComplete="name" /></div>
        <ol className="orbit-quick-rules"><li><b>01</b><span><strong>Play 1–3 cards.</strong> Claim they match the table.</span></li><li><b>02</b><span><strong>Play or call the bluff.</strong> Jokers always count.</span></li><li><b>03</b><span><strong>Lose the call, face the hammer.</strong> Your sixth chance is never safe.</span></li></ol>
        {mode === 'solo' ? <button className="orbit-primary" disabled={!ready || Boolean(credentials)} onClick={() => startSolo()}>{ready ? 'Take your seat' : 'Opening the table…'}<ArrowRight size={18} /></button> : <><div className={`orbit-join ${code ? 'has-code' : ''}`}><input aria-label="Room code" placeholder="ENTER ROOM CODE" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/[^a-z2-9]/gi, '').toUpperCase())} /><button disabled={code.length !== 6 || busy || Boolean(credentials)} onClick={() => roomAction('join')}>Join <ArrowRight size={15} /></button></div><div className="orbit-or"><span>OR</span></div><button className={`orbit-primary orbit-create ${code ? 'orbit-create-muted' : ''}`} disabled={busy || Boolean(credentials) || Boolean(code)} onClick={() => roomAction('create')}>Create a room<ArrowRight size={18} /></button></>}
        {credentials && <button className="orbit-resume" onClick={leave}>Reconnecting to {credentials.code} · Leave room</button>}
      </div>
    </section>}

    {room && !game && <section className="orbit-lobby"><p className="orbit-eyebrow">PRIVATE TABLE · WITH FRIENDS</p><h1>The company<br />you <em>don’t keep.</em></h1><p>Copy the invite. Your friend opens it and joins with the code already filled in.</p><button className="orbit-room-code" onClick={copyCode} aria-label="Copy room invite">{room.code}{copied ? <Check size={22} /> : <Copy size={22} />}</button><div className="orbit-lobby-seats">{Array.from({ length: 4 }, (_, i) => <div key={i}><span>{room.seats[i]?.name.slice(0, 1) || '✧'}</span><strong>{room.seats[i]?.name || 'Open seat'}</strong><small>{room.seats[i] ? 'READY TO LIE' : room.allowBots ? 'BOT FILLS AT START' : 'WAITING FOR A FRIEND'}</small></div>)}</div><div className="orbit-bot-setting"><div><strong>Fill open seats with bots</strong><span>{room.allowBots ? 'Start anytime with a full table.' : 'Friends only · minimum two players.'}</span></div>{room.host ? <button type="button" role="switch" aria-checked={room.allowBots} className={room.allowBots ? 'is-on' : ''} onClick={() => setRoomBots(!room.allowBots)}><i /></button> : <b>{room.allowBots ? 'ON' : 'OFF'}</b>}</div>{room.host ? <button className="orbit-primary" disabled={busy || (!room.allowBots && room.seats.length < 2)} onClick={() => roomAction('start')}>Start the table <ArrowRight size={18} /></button> : <p className="orbit-wait">Waiting for the host to deal…</p>}<p className="orbit-setup-note">30 seconds per human turn. Bot fillers act in about 5 seconds. A disconnected seat is automated so the match can finish.</p><button className="orbit-resume" onClick={leave}>Leave room</button></section>}

    {game && <section className={`orbit-game ${yourTurn ? 'is-your-turn' : ''} ${waitingTurn ? 'is-waiting-turn' : ''}`}>
      <div className="orbit-game-atmosphere" aria-hidden="true"><i/><i/><i/><span>✦</span><span>◆</span><span>✧</span></div>
      <div className="orbit-game-tools"><div><button className="orbit-tool" onClick={() => { if (!sound) { try { audio.current ??= createSoundscape(); } catch { return; } } setSound(!sound); }} aria-label={sound ? 'Mute sound' : 'Enable sound'}>{sound ? <Volume2 size={17}/> : <VolumeX size={17}/>}</button><input className="orbit-volume" aria-label="Ambient volume" type="range" min="0" max="60" value={volume} onChange={e => setVolume(Number(e.target.value))}/>{room && <button className="orbit-tool invite" onClick={copyCode}>{copied?<Check size={16}/>:<Link2 size={16}/>}<span>{copied?'Copied':room.code}</span></button>}<button className="orbit-tool" onClick={()=>setRules(true)} aria-label="How to play"><CircleHelp size={17}/></button></div><button className="orbit-leave" onClick={() => setLeaving(true)}>Leave <LogOut size={15}/></button></div>
      <div className={`orbit-turn-banner ${yourTurn?'is-yours':''}`} aria-live="polite"><div className="orbit-rank-badge"><span>PLAY</span><strong>{RANK_NAMES[game.rank]}</strong><small>Jokers count</small></div><div className="orbit-current-turn"><span className="orbit-turn-pulse" /> <strong>{game.phase==='playing'?(yourTurn?'YOUR TURN':game.players[game.turn].name.toUpperCase()):game.phase==='resolved'||game.phase==='finished'?(reveal?.eliminated?'DEAD':'SAFE'):(reveal?.loser || '').toUpperCase()}</strong><small>{game.phase==='playing'?'NOW PLAYING':game.phase==='reveal'?'CARDS REVEALED':game.phase==='loading'||game.phase==='armed'?'HAMMER RISING':game.phase==='firing'?'IMPACT':'RESULT'}</small></div></div>
      <div className={`orbit-table-area phase-${game.phase}`}><Suspense fallback={null}><TableScene players={scenePlayers} activeId={activePlayerId} phase={game.phase} gameKey={game.id} round={game.round} onContact={({eliminated,pan}) => { audio.current?.cue('impact', {pan, heavy:eliminated}); audio.current?.cue(eliminated?'dead':'safe', {pan, delay:.16}); }}/></Suspense>
        <div className="orbit-table"><div className="orbit-table-ring" /><span className="orbit-table-label">FORTUNE FAVOURS THE CONVINCING</span><div className="orbit-table-bottom">EST. AT THE EDGE OF NOWHERE</div></div>
        {visualOpponents.map((player, i) => <Seat key={player.id} player={player} active={activePlayerId === player.id} position={i} />)}
        <div className={`orbit-table-center ${reveal ? 'is-revealing' : ''}`}>
          {reveal ? game.phase==='reveal' ? <div className="orbit-reveal" key={`reveal-${game.round}`} role="status"><h2>{reveal.liar ? 'LIE' : 'TRUE'}</h2><div className="orbit-reveal-cards">{reveal.cards.map((rank,i)=><div className="orbit-flip" style={{'--i':i}} key={i}><Card rank={rank}/></div>)}</div><p>{reveal.loser} loses the call</p></div> : game.phase==='finished' ? <div className="orbit-reveal orbit-winner"><h2>{game.winner===youId?'YOU WIN':`${game.players.find(p=>p.id===game.winner)?.name.toUpperCase()} WINS`}</h2><button className="orbit-primary" onClick={leave}>Leave table <ArrowRight size={15}/></button></div> : null : <><div className="orbit-rank-label">THE TABLE IS</div><h2>{RANK_NAMES[game.rank]}<span> ONLY</span></h2><div className="orbit-pile" key={`${game.round}-${game.revision}`}>{game.last ? Array.from({ length: game.last.count }, (_, i) => <div key={i} style={{ '--i': i }}><Card back /></div>) : <div className="orbit-empty-pile"><Crest rank={game.rank} /><span>{yourTurn ? 'MAKE THE FIRST CLAIM' : 'WAIT FOR THE OPENING CLAIM'}</span></div>}</div><p className="orbit-claim">{game.last ? <><strong>{game.players[game.last.player].name}</strong> · {game.last.count} {RANK_NAMES[game.rank]}</> : yourTurn ? 'Your opening play' : <><strong>{game.players[game.turn].name}</strong> opens this hand</>}</p></>}
        </div>
      </div>
      <div className="orbit-player-zone"><div className="orbit-player-top"><div><span className={`orbit-turn-dot ${yourTurn ? 'on' : ''}`} /><strong>{you?.name}</strong><b className="orbit-you-chip">YOU</b><span>{!you?.alive ? 'SPECTATING' : yourTurn ? 'YOUR MOVE' : 'YOUR HAND'}</span></div><div className="orbit-player-score"><FateMarks risks={you?.risks} alive={you?.alive}/></div></div>
        <div className="orbit-hand">{you?.alive ? you.hand.map((rank, i) => <Card key={`${game.round}-${i}`} rank={rank} index={i} selected={selected.includes(i)} disabled={!yourTurn || busy || forced} onClick={() => { setError(''); setSelected((cards) => cards.includes(i) ? cards.filter((n) => n !== i) : cards.length < 3 ? [...cards, i] : cards); tone(); }} />) : <p className="orbit-spectator">Your luck ran out. Stay to see who gets the last word.</p>}</div>
        <div className="orbit-controls"><button className="orbit-primary" disabled={!yourTurn || !selected.length || busy || forced} onClick={() => move('play')}>Play {selected.length || ''} {selected.length === 1 ? 'card' : 'cards'}<ArrowRight size={17} /></button><button className="orbit-challenge" disabled={!yourTurn || !game.last || busy} onClick={() => move('challenge')}>Call “Liar” <span>↗</span></button></div>
      </div>
      {game.phase === 'playing' && game.claims.length > 0 && <div className="orbit-claim-trail" aria-label="Recent claims">{game.claims.slice(-4).map((claim, i) => <span key={i}>{game.players[claim.player].name} · <b>{claim.count} {RANK_NAMES[game.rank]}</b></span>)}</div>}
      <details className="orbit-history"><summary>Table talk <span>{game.log.length} recent events</span></summary><ol>{game.log.map((line, i) => <li key={`${i}-${line}`}>{line}</li>)}</ol></details>
    </section>}

    {error && <div className="orbit-error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss message"><X size={16} /></button></div>}
    {rules && <Modal title="How to play" onClose={() => setRules(false)}><ol className="orbit-full-rules"><li><strong>Match the table.</strong> Play Aces, Kings, or Queens. Jokers always match.</li><li><strong>Play 1–3 cards face down.</strong> Say they match. You can lie.</li><li><strong>Play or call “Liar.”</strong> Turns always move in the same direction.</li><li><strong>Lose the call, face the hammer.</strong> It either bounces or crushes you.</li><li><strong>Sixth time means dead.</strong> Every player has one hidden losing hit from one to six.</li></ol><p className="orbit-rules-note">Bots take about five seconds. If a player waits too long, a bot keeps the table moving.</p><button className="orbit-primary" onClick={() => setRules(false)}>Take a seat <ArrowRight size={16} /></button></Modal>}
    {leaving && <Modal title="Leaving so soon?" onClose={() => setLeaving(false)}><p className="orbit-rules-note">{room ? 'A bot takes your seat so your friends can keep playing.' : 'Leaving ends this solo match. Start a fresh table whenever you like.'}</p><button className="orbit-primary" onClick={leave}>Leave table <ArrowRight size={16} /></button><button className="orbit-resume" onClick={() => setLeaving(false)}>Stay at the table</button></Modal>}
  </main>;
}
