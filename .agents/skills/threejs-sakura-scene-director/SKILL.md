---
name: threejs-sakura-scene-director
description: Planning and reviewing the Three.js / React Three Fiber sakura-petal hero scene, performance, fallback, and visual integration with the portfolio hero.
---

# Three.js Sakura Scene Director

## Mission
Guide the Hero's sakura-petal scene so it becomes a premium identity anchor, not a distracting 3D toy.

The sakura scene should feel:

- quiet
- cinematic
- premium
- subtle
- slightly poetic
- integrated with technical console UI

It should not feel:

- anime overload
- particle spam
- game demo
- random 3D portfolio clone
- performance-heavy

## Visual concept

Dark builder console + sakura petals.

Meaning:

- calm discipline + engineering focus
- technical grid + human learning trail
- soft petals + sharp proof systems

## Scene behavior

Allowed:

- petals drift slowly
- petals have subtle rotation
- gentle depth layering
- small cursor influence
- background grid/gradient behind canvas
- optional camera parallax, very subtle

Avoid:

- fast movement
- full-screen clutter
- too many petals
- intense bloom
- spinning camera
- heavy lights/shadows
- physics overkill

## Performance rules

- Keep petal count limited.
- Use instancing if many petals.
- Lower count/DPR on mobile.
- Pause or reduce animation when tab not visible if possible.
- Respect reduced motion.
- Canvas should not block text interactions.
- Use pointer-events carefully.
- Lazy load if initial bundle gets heavy.

## Hero integration

The scene must support the text hierarchy.

Layer order:

1. background gradient/noise/grid
2. canvas petals
3. dark readability overlay if needed
4. hero text
5. live chips and CTAs

Text must remain readable at all times.

## Fallbacks

If reduced motion:

- static petals or no petals
- static gradient background
- no cursor interaction

If mobile performance weak:

- fewer petals
- simpler material
- static background

If WebGL unavailable:

- CSS gradient + subtle SVG/petal pattern fallback

## Review checklist

- Does the scene make the hero more memorable?
- Is text readable?
- Does it run on mobile?
- Is it calm enough?
- Does it load without blocking first paint?
- Is reduced motion respected?
- Does it match the builder identity?

## Output format

When invoked, produce:

```md
# Sakura Scene Plan / Review

## Visual role
## Scene elements
## Animation behavior
## Performance constraints
## Accessibility / fallback
## Integration with hero layout
## Implementation notes
## Risks
```
