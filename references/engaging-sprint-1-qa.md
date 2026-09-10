# Sprint 1 verification

## Summary

Recovered the complete player-system feature suite and replaced only the later humanized renderer with the original low-poly character system. Verification covers the restored progression, memory, multiplayer appearance syncing, personalities, reactions, and tighter camera framing.

- 47 game tests passed, including 500 seeded full matches and checks for private personalities, different behavior, legal moves, hidden-card independence, public event privacy, progression, wagers, skin purchases, reaction selection and all eleven low-poly rigs.
- Final production build passed after the last UI correction.
- Browser: selected a skin, entered solo without a nickname, played a bluff, observed bot turns, challenged, reached hammer resolution and the following round, and exited through confirmation.
- Final-build mobile entry and selected-skin match entry verified. Top controls stay on screen, the cast fits the scene, and hand controls remain reachable.
- Layout measurements at widths 360, 390, 768, 1366 and 1440 showed no horizontal document overflow. Visual screenshots inspected at phone and desktop widths.
- No browser warnings or errors in the inspected console logs.
- Whitespace diff check passed. The repository has no standalone lint or typecheck scripts; the Next.js build's checking step passed.

## Blockers

None found in the verified solo flow.

## Major issues fixed

- Mobile entry was still using a later desktop grid override: restored one-column layout.
- Main element retained roster scroll and hid game toolbar: clear scroll on match entry and use clipping for the viewport.
- Narrow aspect ratios cut off the cast: camera zoom now fits aspect ratio.

## Minor issues fixed

- Active roster denominator included archived skins: count active skins only.
- Missing font variables invalidated typography rules: add scoped fallbacks.
- Initial procedural face construction looked puffy: use a continuous shaped face mesh and smaller feature geometry.

## Remaining verification and recommendations

- Reduced motion reviewed in source (continuous movement gated, instant consequence pose, CSS animations disabled); browser media emulation was unavailable through the selected browser API. Existing presentation tests cover camera/hammer behavior, not real reduced-motion device rendering.
- Cross-network multiplayer, host-loss recovery, and real mobile GPU performance have not been verified in this sprint.
- Characters intentionally use the original faceted low-poly style. The shared seated animation contract preserves table motion and consequence staging across all eleven skins.
- Temporary reactions are original synthesized meme-style cues, not stock recordings. Per-skin manifests support recorded clips later. Audible quality has not been independently reviewed.
- Accounts, trusted progression, persistence and removal of prototype starting grants are Sprint 2. Existing inventory and old character backups are preserved.
