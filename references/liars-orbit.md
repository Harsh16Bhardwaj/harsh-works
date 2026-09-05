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

1. Reveal the challenged cards over 2.6 seconds; explicitly identify an honest hand or a bluff. No survival result is exposed.
2. Animate the gun and chamber. Only the player facing the penalty can fire. Bots fire after 1.4 seconds; the house acts for an absent human after 20 seconds.
3. Firing lasts 1.5 seconds. The result remains hidden.
4. Resolve the fixed hidden chamber and display CLICK/BANG to all participants. A room deals again after 3.5 seconds; solo offers Next hand.
5. The last survivor wins.

The hidden live chamber is assigned once per match, in positions 1–6. Surviving does not reset it. The server validates who can fire and rejects stale or duplicate actions.

## Sprint 3: bots

Server timers schedule bot moves at 1.1 seconds, independent of client polling. Clients poll every 450 ms to observe state. Human turns time out after 30 seconds.

Bots see only their own hand and previously played cards, public claims, and revealed opponent history. A hypergeometric estimate measures whether an unknown five-card hand could support an opponent’s cumulative claims given the deck and known cards. It is blended with a smoothed revealed bluff rate. This is a heuristic, not a calibrated prediction of the latest claim. Personalities vary their challenge thresholds and bluff frequency. Greater chamber risk raises caution; bluffs tend to be small, and honest plays sometimes retain a matching card for later.

## Verification

`npm.cmd run test:game`: 11 tests, including 500 seeded complete matches, illegal moves, joker truth, hidden information, forced challenges, room authorization/capacity, trigger authorization, no early outcome disclosure, bot-history sensitivity, and two-human/two-bot progression without polling.

Browser QA: two isolated players through shared card reveal, manual trigger, firing, identical verdict and reconnect; audio activation and mute; five widths (360, 390, 768, 1366, 1440); controls visible on a 768px-high laptop; reduced motion; keyboard dismissal of rules. No page errors observed. Screenshots are in ignored `logs/`.

Production build verifies the routes. No standalone lint/typecheck script exists in this JavaScript repository. Audio was checked programmatically; listening quality and real-phone performance still need human/device testing.
