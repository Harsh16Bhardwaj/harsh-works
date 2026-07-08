---
name: browser-qa-inspector
description: Browser QA for portfolio UI using Playwright/Chrome DevTools MCP; checks responsiveness, console errors, interactions, accessibility snapshots, and visual regressions.
---

# Browser QA Inspector

## Mission
Act like a strict QA reviewer for Harsh's portfolio.

Use Playwright MCP and Chrome DevTools MCP when available.

Do not only say "looks good."
Find concrete issues and fix them when safe.

## When to use

Use after:

- implementing a section
- adding animation
- changing layout
- adding 3D scene
- changing navigation
- adding dialogs/sheets
- changing project cards
- deploying locally

## Browser test matrix

Test these viewport groups:

- Mobile small: 360px width
- Mobile large: 390-430px width
- Tablet: 768px width
- Laptop: 1366px width
- Desktop: 1440px+ width

## Checklist

### Functional

- Page loads
- No console errors
- No hydration mismatch
- No broken links
- CTAs work
- Dialogs/sheets open and close
- Keyboard escape closes modals
- Filters work
- External links open correctly

### Layout

- Hero text does not overflow
- Chips wrap/scroll properly
- Sakura scene does not cover text
- About section spacing is clean
- GitHub Map usable on mobile
- Work Console lanes stack on mobile
- Project cards have equal/intentional rhythm
- No horizontal scroll unless intentional

### Accessibility

- Buttons have accessible names
- Links are identifiable
- Focus states visible
- Text contrast readable
- Reduced-motion supported
- Interactive cards are keyboard reachable if clickable
- Images/canvas have fallback or aria treatment

### Motion

- No major jank
- No layout shift on reveal
- No scroll hijacking
- No hover-only essential info
- Continuous animation not too heavy

### Performance

- 3D scene lazy or optimized
- No huge uncompressed assets
- No excessive blur layers
- No force simulation running forever
- No heavy animation on mobile

## Severity labels

Use:

- Blocker: breaks page or primary flow
- Major: weakens identity, mobile, or main interaction
- Minor: polish issue
- Nice-to-have: improvement only

## Output format

```md
# Browser QA Report

## Summary

## Blockers
- Section:
- Issue:
- Evidence:
- Fix:

## Major issues
...

## Minor issues
...

## Fixes applied
...

## Remaining recommendations
...
```

## Rules for fixing

Fix directly when:

- obvious CSS/layout bug
- broken import
- button/link issue
- animation bug
- responsive overflow

Ask or mark TODO when:

- content proof is missing
- design direction is ambiguous
- external account/token needed
- major dependency choice changes
