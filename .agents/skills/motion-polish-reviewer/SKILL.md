---
name: motion-polish-reviewer
description: Planning, reviewing, and debugging animations, scroll effects, hover states, 3D scenes, section reveals, and motion quality.
---

# Motion Polish Reviewer

## Mission
Make motion feel premium, purposeful, and smooth.

The portfolio should have cinematic motion, but not animation spam.

## Core rule
One dominant motion idea per section.

If a section already has a strong visual animation, do not add extra animated gimmicks.

## Motion hierarchy

### Tier 1: Signature motion
Used rarely.

- Sakura-petal hero scene
- GitHub cluster formation
- Work Console boot sequence

### Tier 2: Section motion
Used for structure.

- fade/slide reveal
- staggered cards
- scroll-linked progress
- selected card expansion

### Tier 3: Microinteractions
Used for polish.

- button hover
- chip hover
- card tilt if subtle
- focus states
- dialog open/close

Do not let tier 3 overpower tier 1.

## Section motion rules

### Hero

Allowed:

- slow petals
- subtle cursor response
- identity text reveal
- staggered live chips
- gentle background parallax

Avoid:

- high-speed particles
- rotating camera
- too much bloom/glow
- unreadable text
- heavy GPU scene on mobile

Mobile fallback:

- fewer petals
- lower device pixel ratio
- static/slow background if needed

### About

Allowed:

- staggered thesis reveal
- process line drawing
- small proof-trail flow

Avoid:

- big movement
- scroll pinning
- decorative bouncing

### GitHub Map

Allowed:

- nodes forming clusters
- selected cluster expands
- links fade based on selection
- hover preview card

Avoid:

- force graph jitter forever
- nodes flying too much
- unreadable labels

### Work Console

Allowed:

- boot sequence
- lane load indicators
- subtle status pulse
- selected lane emphasis

Avoid:

- fake terminal text flood
- blinking everywhere
- fast scanning lines

### Project Gallery

Allowed:

- staggered case-file reveal
- layout animation on expand
- architecture preview reveal

Avoid:

- every card rotating differently
- huge hover transforms
- dark cards with unreadable text

## Reduced motion requirements

Always support reduced motion.

When reduced motion is on:

- disable continuous parallax
- disable petals or make them static/minimal
- replace scroll animations with simple opacity changes
- remove card tilts
- preserve content and layout

## Performance checklist

Check:

- No long-running expensive layout animations
- Avoid animating width/height when transform/opacity works
- Avoid huge blurred layers everywhere
- Avoid too many fixed elements
- Use lazy-loading for heavy 3D if possible
- Don't run force simulations forever
- Test on mobile

## Review process

When invoked after implementation:

1. Inspect each first-five section.
2. Identify dominant animation.
3. Mark any unnecessary animation.
4. Check mobile behavior.
5. Check reduced-motion behavior.
6. Check jank / layout shift.
7. Suggest exact fixes.

## Output format

```md
## Motion Review

### Section
- Dominant animation:
- Works / does not work:
- Issues:
- Severity:
- Fix:
- Mobile note:
```

## Final standard

The motion should make the site feel expensive, not restless.
