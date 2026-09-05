# Liar’s Orbit — second pass

An original browser bluffing game with vector characters, procedural 3D models, and synthesized sound. The portfolio launch button lives beside the avatar. Game code loads at `/play`.

## Run

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run start -- --hostname 0.0.0.0 --port 3100
```

Friends use the host computer’s LAN address with port 3100 and the same room code. Bots fill spare seats. Keep the server running. Rooms are held in one Node process, expire after two inactive hours, and reset on restart. This is local multiplayer, not a globally distributed backend. Physical-device Wi-Fi/firewall access remains unverified.

## Sprint 1: presence

- Vesper the fox, Rook the raven, Sable the automaton, and a masked traveller, assigned consistently across participants.
- Lazy-loaded Three.js table and low-poly characters, warm/rim lighting, head movement, active-seat rings, and eliminated-character posture.
- HTML labels projected from character locations. Vector portraits and a CSS table remain available if WebGL cannot initialize.
- Rendering capped at 30 fps and pixel ratio 1.4. Hidden pages skip rendering. Reduced motion removes movement and renders on state/size changes only. Renderer resources are disposed on unmount.
- Prominent required-rank and current-turn banner. Original synthesized drone/wind ambience starts after joining or enabling sound; adjustable volume, mute, reveal/loading/click/shot cues, and hidden-page audio suspension.
- Local score display and solo save/resume removed. Old stored records are no longer used or modified. Session storage retains only the room reconnection credential.

## Sprint 2: shared reveal

1. Reveal the challenged cards for 5 seconds; explicitly say who lied or who told the truth. No shot result is exposed.
2. Prepare the gun in a separate 3.5-second stage. Only the player who lost the challenge can fire. Bots take 5–7.5 seconds; the game acts for an absent human after 20 seconds.
3. Cock, aim and fire over 3.2 seconds. The result remains hidden until firing completes.
4. Make a fresh random 1-in-6 roll and display CLICK/BANG to all participants. The result remains visible for 6.5 seconds; solo offers Next hand.
5. The last survivor wins.

Every shot is independent: 1-in-6 for BANG and 5-in-6 for CLICK. The server validates who can fire and rejects stale or duplicate actions.

## Sprint 3: bots

Persisted deadlines pace bot moves at 5–10 seconds. Clients poll every 450 ms to observe and advance overdue state. Human turns time out after 30 seconds. In-memory rooms require one persistent Node process; separate Vercel instances cannot reliably share them.

Bots see only their own cards, public claims, and revealed opponent history. A probability estimate measures whether an unknown five-card set could support an opponent’s cumulative claims given the deck and known cards. It is blended with the opponent’s revealed lie rate. Personalities vary their challenge threshold and lie frequency. Bots usually keep lies small, and valid plays sometimes retain one matching card for later.

## Verification

`npm.cmd run test:game`: 15 tests, including 500 seeded complete matches, illegal moves, joker rules, hidden information, forced challenges, an exact 1-in-6 shot boundary, room authorization/capacity, concurrent joins and moves, trigger authorization, staged deadlines, no early result disclosure, bot-history sensitivity, expiry, and process-isolation behavior.

Browser QA: two isolated players through shared card reveal, manual trigger, firing, identical verdict and reconnect; audio activation and mute; five widths (360, 390, 768, 1366, 1440); controls visible on a 768px-high laptop; reduced motion; keyboard dismissal of rules. No page errors observed. Screenshots are in ignored `logs/`.

Production build verifies the routes. No standalone lint/typecheck script exists in this JavaScript repository. Audio was checked programmatically; listening quality and real-phone performance still need human/device testing.
