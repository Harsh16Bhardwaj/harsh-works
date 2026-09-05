# Liar's Orbit: current state and production plan

## Current assessment

| Area | State | Evidence | Next priority |
| --- | --- | --- | --- |
| Core rules | Implemented | Server-authoritative turns, card check, independent 1-in-6 shots, elimination, winner | Add rematch flow and balance playtests |
| Bot decisions | Implemented | Bots use private hand, public claims and revealed bluff history | Tune personality differences from real matches |
| Pacing | Implemented in this pass | Bot delay is 5–10 seconds; reveal, loading, firing and verdict have distinct deadlines | Playtest whether expert players want a faster option |
| Gun sequence | Improved in this pass | Card flip, gun preparation, hammer, aim, recoil, flash and smoke are staged | Replace the vector prop only if a bespoke 3D gun becomes worthwhile |
| Turn comprehension | Good | Current-turn banner, active character and recent-claim trail | Add a compact odds notebook only after playtesting |
| Room correctness in one process | Implemented | Authenticated seats, stale-action checks, atomic joins/moves, expiry and reconnect | Add host restart/rematch controls |
| Room reliability on Vercel | Blocked by architecture | In-memory state is isolated per server instance and disappears on restart | Move room authority to one persistent game service or shared state |
| Mobile and reduced motion | Implemented, final regression pending | Responsive layout and reduced-motion CSS exist | Repeat the device matrix after every motion change |
| Observability | Basic | API errors now have stable codes and request IDs in server logs | Add room lifecycle metrics before public traffic |

## Isolated failure classes

1. `INVALID_CODE`: malformed room code. Keep the player on the join form and point at the field.
2. `ROOM_NOT_FOUND`: expired room, restarted server or a different server instance. Clear stale reconnect credentials and return to the lounge.
3. `ROOM_FULL` / `ROOM_STARTED`: valid room that cannot accept a new seat. Keep the entered code so the player can retry or ask for a new room.
4. `SEAT_INVALID`: old or replaced credential. Clear it automatically and offer a clean join.
5. `STALE_STATE`: two actions raced or the client acted on an old revision. Refresh silently, then let the player act again if it is still their turn.
6. `ROOM_BUSY`: repeated concurrent updates. Retry once with jitter; show an error only if the retry also fails.
7. Network timeout: retain the seat and reconnect in the background. Do not duplicate the last action automatically unless it carries an idempotency key.

## Ideal small-room flow

1. The host creates a room. The authority creates an unpredictable room code, a host seat token and revision `0` with a two-hour idle expiry.
2. The UI copies `/play?room=ABC123`. Opening the invite switches to Friends mode and fills the code.
3. A guest joins with a display name. The authority atomically reserves one of four seats and returns a private seat token.
4. The browser stores only `{ roomCode, seatToken }` in session storage. Hidden cards and shot results remain on the authority.
5. The host starts. Empty seats become bots. Every action includes the current revision and a unique action ID.
6. The authority validates seat, turn, phase and revision; writes the new state atomically; then broadcasts the public view.
7. Clients reconnect with exponential backoff and resume from the latest revision. A short disconnect preserves the seat; a deliberate leave converts it to a bot.
8. The room expires after the match plus a short rematch window, or after two inactive hours.

## Recommended production architecture

For a few simultaneous rooms, keep the portfolio on Vercel and run the game authority as one small persistent Node service. WebSocket connections give immediate updates; an in-process map remains acceptable while there is exactly one instance. Configure health checks, automatic restart and session affinity, and accept that a restart clears rooms.

If room survival and horizontal scaling become requirements, replace the in-process map with a shared state store and use atomic compare-and-swap writes. At that point multiple API instances can safely serve the same room. Browser local storage is only suitable for a player's reconnect token; it cannot share a room between different people.

## Delivery order

### Now

- Finish and verify slower bot pacing and the staged gun sequence.
- Ship invite links, typed room errors, stale-session cleanup and concurrent-join protection.
- Verify two browsers, five viewport widths, keyboard behavior and reduced motion.

### Next

- Move `/api/orbit` to a single persistent game service if friend rooms must work reliably in production without shared storage.
- Add WebSocket broadcasts, reconnect backoff, action IDs, host disconnect rules and rematches.
- Add room-created, join-failed, reconnect and match-completed counters without logging tokens or hidden cards.

### Later, after playtesting

- Tune bot pacing by action complexity instead of pure random delay.
- Add stronger tells and personality-specific character reactions.
- Add spectator/rejoin rules, optional private tables and abuse rate limits if traffic grows.
