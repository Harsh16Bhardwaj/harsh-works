# Engaging sprint

Approved direction: gameplay and character quality before AWS. Test only once all implementation for each sprint is complete; fix and recheck failures within that sprint.

Preference scores (priority / 100): hidden bot personalities 98; five quality characters 97; pacing/feedback 94; skin names 92; private-match reliability 91; rematch/results 89; canonical progression 86; performance/audio comfort 85; playtest evidence 83; extensible architecture 72; AWS 25. Recorded voice pools were originally 95 but explicitly deferred due to asset gathering; extensible temporary scenario cues belong in Sprint 1.

## Sprint 1 — The cast and the bluff

Status: implemented and verified locally. See `engaging-sprint-1-qa.md` for evidence and limits. No deployment or commit was performed.

- Five randomly assigned, private bot policies: trickster, pacer, survivor, reader, opportunist. Public evidence only, contextual risk, varied timing; no LLM.
- Eleven low-poly character skins using the original geometric visual language and a shared seated animation contract.
- Stable character names used in matches, separate from player identity and accounts. Five starter skins are owned; six remain coin or win-gated unlocks.
- Per-skin sound manifest with temporary original meme-style synthesized reactions; recorded voice collection deferred.
- Public event history and private bot assignments, with backward-compatible saved games.
- End-of-sprint: game tests, production build, browser interaction, mobile and reduced-motion review.

Narrative: strangers at a theatrical bluffing table. Content: eleven cosmetic identities and five invisible strategies. Visual language: faceted low-poly characters, dark tailoring, and the original geometric silhouettes. Animation: seated body language, gaze, card reach and hammer anticipation. Components: skin manifest, low-poly actor and portrait, bot policies, reaction selector, existing rules/controller. Missing proof: recorded voices remain deferred; validate actual device performance before claiming production standards.

## Sprint 2 — Identity and earned progression

- Username/password accounts, secure sessions, throttling, database migrations.
- Canonical inventory, coins, wins, games and selected skin; remove prototype grants.
- Server-trusted match outcomes and atomic, idempotent rewards and purchases.
- Explicit treatment of existing local progress; never trust imported local coins.
- End-of-sprint integration, authentication, reward abuse and recovery checks.

## Sprint 3 — Return to the table

- Private-room reconnects, host-loss policy, cross-network connectivity, rematches and spectator comfort.
- Pacing and results polish; playtest completion/rematch/disconnect measurements.
- Recorded per-character voice pools when assets are available, captions and audio controls.
- Performance profiling, mobile quality levels, deployment configuration and future matchmaking boundaries.
- AWS deployment remains low priority; no public matchmaking in current scope.
- End-of-sprint full multiplayer, recovery, accessibility and performance review.
